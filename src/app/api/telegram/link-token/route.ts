import { NextRequest, NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { createTelegramLinkToken } from "@/lib/telegram/linkToken";
import { getTelegramConfig, getTelegramConfigMissing } from "@/lib/telegram/config";

export async function POST(req: NextRequest) {
  const config = getTelegramConfig();
  if (!config) {
    const missing = getTelegramConfigMissing();
    return NextResponse.json(
      {
        error: "Telegram non configuré sur le serveur.",
        missing_env: missing,
      },
      { status: 503 },
    );
  }

  const { supabase } = createSupabaseFromRequest(req);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const link = await createTelegramLinkToken(authData.user.id, authData.user.email);
  if (!link.ok) {
    return NextResponse.json(
      {
        error: link.error,
        code: link.code,
        hint: link.hint,
        account_email: authData.user.email ?? null,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    bot_url: link.botUrl,
    expires_in_minutes: config.linkTokenTtlMinutes,
  });
}
