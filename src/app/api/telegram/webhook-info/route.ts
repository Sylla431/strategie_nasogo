import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { callTelegramApi } from "@/lib/telegram/api";
import { getTelegramConfig, getTelegramConfigMissing, getTelegramWebhookBaseUrl } from "@/lib/telegram/config";

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

  const appUrl = getTelegramWebhookBaseUrl();
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
        ? "Si le bot ne répond pas: le secret Vercel doit être IDENTIQUE à celui du setWebhook. Sinon supprimez TELEGRAM_WEBHOOK_SECRET, redeploy, puis refaites set-webhook."
        : "Pas de secret webhook configuré (OK si setWebhook sans secret_token).",
      "Utilisez la même URL avec ou sans www partout (ex: https://www.vbsniperacademie.com). Les redirections www peuvent bloquer les POST Telegram.",
      "GET /api/telegram/webhook dans le navigateur ne prouve pas que Telegram envoie des POST — vérifiez telegram_webhook.url ci-dessus.",
    ].filter(Boolean),
  });
}
