import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { kickFromChannel, unbanFromChannel } from "@/lib/telegram/api";
import { resolveUserFromEmailOrId } from "@/lib/telegram/resolveUser";

export type TelegramSubscription = {
  id: string;
  user_id: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  subscription_expires_at: string;
  status: "active" | "expired" | "revoked";
  granted_email: string | null;
  created_at: string;
  updated_at: string;
};

export function isSubscriptionActive(sub: Pick<TelegramSubscription, "status" | "subscription_expires_at">) {
  if (sub.status !== "active") return false;
  return new Date(sub.subscription_expires_at).getTime() > Date.now();
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export async function getSubscriptionByUserId(userId: string): Promise<TelegramSubscription | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getSubscriptionByUserId error:", error.message, error.code);
    return null;
  }
  if (!data) return null;
  return data as TelegramSubscription;
}

async function ensureUserProfileExists(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return "Client admin Supabase non initialisé";

  const { data: profile } = await supabaseAdmin
    .from("users_profile")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.id) return null;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError || !authData.user) {
    return "Compte utilisateur introuvable dans l'authentification";
  }

  const { error: insertError } = await supabaseAdmin.from("users_profile").insert({
    id: userId,
    email: authData.user.email ?? null,
    role: "client",
  });

  if (insertError && insertError.code !== "23505") {
    return `Profil utilisateur manquant: ${insertError.message}`;
  }

  return null;
}

export async function getSubscriptionByTelegramUserId(telegramUserId: number): Promise<TelegramSubscription | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("*")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle();

  if (error || !data) return null;
  return data as TelegramSubscription;
}

async function migrateSubscriptionToUser(subscriptionId: string, userId: string) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("telegram_subscriptions").update({ user_id: userId }).eq("id", subscriptionId);
}

export async function findSubscriptionForAccount(
  userId: string,
  email?: string | null,
): Promise<{ subscription: TelegramSubscription | null; lookupUserId: string }> {
  const lookupIds = new Set<string>([userId]);

  if (email) {
    const resolved = await resolveUserFromEmailOrId({ user_id: userId, email });
    if (resolved?.userId) lookupIds.add(resolved.userId);
  }

  for (const id of lookupIds) {
    const sub = await getSubscriptionByUserId(id);
    if (sub && isSubscriptionActive(sub)) {
      if (id !== userId) {
        await migrateSubscriptionToUser(sub.id, userId);
        return { subscription: (await getSubscriptionByUserId(userId)) ?? sub, lookupUserId: userId };
      }
      return { subscription: sub, lookupUserId: id };
    }
  }

  if (email && supabaseAdmin) {
    const normalized = email.toLowerCase().trim();
    const { data: byGrantedEmail, error: grantedEmailError } = await supabaseAdmin
      .from("telegram_subscriptions")
      .select("*")
      .ilike("granted_email", normalized)
      .maybeSingle();

    if (!grantedEmailError && byGrantedEmail && isSubscriptionActive(byGrantedEmail as TelegramSubscription)) {
      await migrateSubscriptionToUser(byGrantedEmail.id, userId);
      const migrated = await getSubscriptionByUserId(userId);
      return { subscription: migrated, lookupUserId: userId };
    }
  }

  const direct = await getSubscriptionByUserId(userId);
  return { subscription: direct, lookupUserId: userId };
}

export async function grantOrExtendSubscription(
  userId: string,
  months = 1,
  grantedEmail?: string | null,
): Promise<{ subscription: TelegramSubscription | null; error?: string }> {
  if (!supabaseAdmin) {
    return { subscription: null, error: "Client admin Supabase non initialisé" };
  }

  const profileError = await ensureUserProfileExists(userId);
  if (profileError) {
    return { subscription: null, error: profileError };
  }

  const existing = await getSubscriptionByUserId(userId);
  const now = new Date();
  const baseDate =
    existing && isSubscriptionActive(existing) ? new Date(existing.subscription_expires_at) : now;
  const expiresAt = addMonths(baseDate, months).toISOString();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("telegram_subscriptions")
      .update({
        subscription_expires_at: expiresAt,
        status: "active",
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("grantOrExtendSubscription update error:", error?.message, error?.code);
      return {
        subscription: null,
        error: error?.message ?? "Échec mise à jour abonnement Telegram",
      };
    }

    if (grantedEmail) {
      await supabaseAdmin
        .from("telegram_subscriptions")
        .update({ granted_email: grantedEmail.toLowerCase().trim() })
        .eq("user_id", userId);
    }

    return { subscription: data as TelegramSubscription };
  }

  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    subscription_expires_at: expiresAt,
    status: "active",
  };
  if (grantedEmail) {
    insertPayload.granted_email = grantedEmail.toLowerCase().trim();
  }

  const { data, error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !data) {
    console.error("grantOrExtendSubscription insert error:", error?.message, error?.code);
    return {
      subscription: null,
      error:
        error?.code === "42P01"
          ? "Table telegram_subscriptions absente — exécutez la migration Supabase"
          : (error?.message ?? "Échec création abonnement Telegram"),
    };
  }
  return { subscription: data as TelegramSubscription };
}

export async function revokeSubscription(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const existing = await getSubscriptionByUserId(userId);
  if (!existing) return false;

  const { error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .update({ status: "revoked" })
    .eq("user_id", userId);

  if (error) return false;

  if (existing.telegram_user_id) {
    await kickFromChannel(existing.telegram_user_id);
  }

  return true;
}

export async function linkTelegramAccount(
  userId: string,
  telegramUserId: number,
  telegramUsername?: string | null,
): Promise<TelegramSubscription | null> {
  if (!supabaseAdmin) return null;

  const sub = await getSubscriptionByUserId(userId);
  if (!sub || !isSubscriptionActive(sub)) return null;

  const { data, error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .update({
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername ?? null,
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) return null;
  return data as TelegramSubscription;
}

/** Pour les tests : expire immédiatement et retire du canal Telegram si lié. */
export async function expireSubscriptionNow(userId: string): Promise<{
  ok: boolean;
  kicked: boolean;
  error?: string;
}> {
  if (!supabaseAdmin) {
    return { ok: false, kicked: false, error: "Client admin Supabase non initialisé" };
  }

  const existing = await getSubscriptionByUserId(userId);
  if (!existing) {
    return { ok: false, kicked: false, error: "Aucun abonnement trouvé" };
  }

  let kicked = false;
  if (existing.telegram_user_id) {
    const kickResult = await kickFromChannel(existing.telegram_user_id);
    kicked = kickResult.ok;
    if (!kickResult.ok) {
      const errMsg =
        "description" in kickResult && kickResult.description
          ? kickResult.description
          : "error" in kickResult && kickResult.error
            ? kickResult.error
            : "erreur kick";
      return { ok: false, kicked: false, error: errMsg };
    }
  }

  const { error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .update({
      status: "expired",
      subscription_expires_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { ok: false, kicked, error: error.message };
  }

  return { ok: true, kicked };
}

export async function processExpiredSubscriptions(): Promise<{ processed: number; errors: string[] }> {
  if (!supabaseAdmin) return { processed: 0, errors: ["Client admin Supabase non initialisé"] };

  const nowIso = new Date().toISOString();
  const { data: expiredRows, error } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("*")
    .eq("status", "active")
    .lte("subscription_expires_at", nowIso);

  if (error) return { processed: 0, errors: [error.message] };

  const errors: string[] = [];
  let processed = 0;

  for (const row of (expiredRows ?? []) as TelegramSubscription[]) {
    if (row.telegram_user_id) {
      const kickResult = await kickFromChannel(row.telegram_user_id);
      if (!kickResult.ok) {
        const errMsg =
          "description" in kickResult && kickResult.description
            ? kickResult.description
            : "error" in kickResult && kickResult.error
              ? kickResult.error
              : "erreur";
        errors.push(`Kick ${row.telegram_user_id}: ${errMsg}`);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("telegram_subscriptions")
      .update({ status: "expired" })
      .eq("id", row.id);

    if (updateError) {
      errors.push(`Update ${row.id}: ${updateError.message}`);
      continue;
    }

    processed += 1;
  }

  return { processed, errors };
}

export async function prepareTelegramAccess(telegramUserId: number) {
  await unbanFromChannel(telegramUserId);
}
