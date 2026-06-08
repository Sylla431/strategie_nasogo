import { NextRequest, NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getTelegramConfig, getTelegramConfigMissing } from "@/lib/telegram/config";
import { findSubscriptionForAccount, isSubscriptionActive } from "@/lib/telegram/subscription";
import { resolveUserFromEmailOrId } from "@/lib/telegram/resolveUser";

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = authData.user.id;
  const email = authData.user.email ?? null;
  const config = getTelegramConfig();
  const resolved = email ? await resolveUserFromEmailOrId({ user_id: userId, email }) : null;
  const { subscription: sub } = await findSubscriptionForAccount(userId, email);

  let linkTokensTableOk: boolean | null = null;
  let linkTokensError: string | null = null;
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("telegram_link_tokens").select("token").limit(1);
    linkTokensTableOk = !error;
    linkTokensError = error?.message ?? null;
  }

  return NextResponse.json({
    telegram_configured: Boolean(config),
    missing_env: config ? [] : getTelegramConfigMissing(),
    supabase_admin: Boolean(supabaseAdmin),
    account: { user_id: userId, email },
    resolved_account: resolved,
    subscription: sub
      ? {
          id: sub.id,
          status: sub.status,
          active: isSubscriptionActive(sub),
          expires_at: sub.subscription_expires_at,
          granted_email: sub.granted_email,
          telegram_linked: sub.telegram_user_id != null,
        }
      : null,
    link_tokens_table_ok: linkTokensTableOk,
    link_tokens_error: linkTokensError,
  });
}
