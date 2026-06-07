import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTelegramConfig } from "@/lib/telegram/config";
import {
  getSubscriptionByUserId,
  isSubscriptionActive,
  linkTelegramAccount,
  prepareTelegramAccess,
} from "@/lib/telegram/subscription";
import { createPersonalInviteLink, sendTelegramMessage } from "@/lib/telegram/api";

function generateToken() {
  return randomBytes(16).toString("hex");
}

export async function createTelegramLinkToken(userId: string): Promise<{ token: string; botUrl: string } | null> {
  const config = getTelegramConfig();
  if (!config || !supabaseAdmin) return null;

  const sub = await getSubscriptionByUserId(userId);
  if (!sub || !isSubscriptionActive(sub)) return null;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + config.linkTokenTtlMinutes * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("telegram_link_tokens").insert({
    token,
    user_id: userId,
    expires_at: expiresAt,
  });

  if (error) return null;

  return {
    token,
    botUrl: `https://t.me/${config.botUsername}?start=${token}`,
  };
}

export async function handleStartWithToken(
  token: string,
  telegramUserId: number,
  telegramUsername: string | null,
  chatId: number,
): Promise<{ ok: boolean; message: string }> {
  if (!supabaseAdmin) {
    return { ok: false, message: "Service indisponible. Réessayez plus tard." };
  }

  const { data: linkRow, error: linkError } = await supabaseAdmin
    .from("telegram_link_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (linkError || !linkRow) {
    return { ok: false, message: "Lien invalide ou expiré. Retournez sur votre espace client et recliquez sur Accès Telegram." };
  }

  if (linkRow.used_at) {
    return { ok: false, message: "Ce lien a déjà été utilisé. Générez-en un nouveau depuis votre espace client." };
  }

  if (new Date(linkRow.expires_at).getTime() < Date.now()) {
    return { ok: false, message: "Ce lien a expiré. Retournez sur votre espace client et recliquez sur Accès Telegram." };
  }

  const userId = linkRow.user_id as string;
  const sub = await getSubscriptionByUserId(userId);
  if (!sub || !isSubscriptionActive(sub)) {
    return { ok: false, message: "Votre abonnement Telegram n'est pas actif. Contactez le support." };
  }

  const { data: existingByTelegram } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("user_id")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle();

  if (existingByTelegram && existingByTelegram.user_id !== userId) {
    return { ok: false, message: "Ce compte Telegram est déjà lié à un autre utilisateur." };
  }

  await supabaseAdmin
    .from("telegram_link_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);

  await prepareTelegramAccess(telegramUserId);
  const linked = await linkTelegramAccount(userId, telegramUserId, telegramUsername);
  if (!linked) {
    return { ok: false, message: "Impossible de lier votre compte. Contactez le support." };
  }

  const invite = await createPersonalInviteLink(userId);
  if (!invite.ok || !invite.inviteLink) {
    return {
      ok: false,
      message: invite.error ?? "Impossible de générer votre lien d'accès. Contactez le support.",
    };
  }

  const expiresLabel = new Date(linked.subscription_expires_at).toLocaleDateString("fr-FR");
  await sendTelegramMessage(
    chatId,
    [
      "✅ <b>Accès activé</b>",
      "",
      `Voici votre lien personnel pour rejoindre le canal (usage unique) :`,
      invite.inviteLink,
      "",
      `Abonnement valide jusqu'au <b>${expiresLabel}</b>.`,
      "À l'expiration, vous serez retiré du canal. Renouvelez sur le site puis recliquez sur Accès Telegram.",
    ].join("\n"),
  );

  return { ok: true, message: "Lien envoyé." };
}
