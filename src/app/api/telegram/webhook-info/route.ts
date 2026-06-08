import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { callTelegramApi } from "@/lib/telegram/api";
import { getTelegramConfig, getTelegramConfigMissing } from "@/lib/telegram/config";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json({
      ok: false,
      missing_env: getTelegramConfigMissing(),
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const expectedWebhookUrl = appUrl ? `${appUrl}/api/telegram/webhook` : null;

  const info = await callTelegramApi<{
    url?: string;
    has_custom_certificate?: boolean;
    pending_update_count?: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    ip_address?: string;
  }>("getWebhookInfo");

  return NextResponse.json({
    ok: info.ok,
    expected_webhook_url: expectedWebhookUrl,
    telegram_webhook: info.result ?? null,
    webhook_secret_configured: Boolean(config.webhookSecret),
    telegram_error: info.description ?? null,
    hints: [
      !info.result?.url
        ? "Aucun webhook enregistré — appelez POST /api/telegram/set-webhook"
        : expectedWebhookUrl && info.result.url !== expectedWebhookUrl
          ? `URL webhook différente de NEXT_PUBLIC_APP_URL (actuel: ${info.result.url})`
          : null,
      info.result?.last_error_message
        ? `Dernière erreur Telegram: ${info.result.last_error_message}`
        : null,
      config.webhookSecret
        ? "Vérifiez que TELEGRAM_WEBHOOK_SECRET (ou TELEGRAM_LINK_SECRET) = secret_token utilisé dans setWebhook"
        : "Pas de secret webhook — setWebhook doit être appelé sans secret_token",
    ].filter(Boolean),
  });
}
