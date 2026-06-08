import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { callTelegramApi } from "@/lib/telegram/api";
import { getTelegramConfig, getTelegramWebhookBaseUrl } from "@/lib/telegram/config";

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json({ error: "Variables Telegram manquantes" }, { status: 503 });
  }

  const appUrl = getTelegramWebhookBaseUrl();
  if (!appUrl) {
    return NextResponse.json(
      {
        error: "TELEGRAM_WEBHOOK_URL ou NEXT_PUBLIC_APP_URL manquant",
        hint: "Utilisez l'URL exacte sans redirection, ex: https://www.vbsniperacademie.com",
      },
      { status: 500 },
    );
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const body: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  };
  if (config.webhookSecret) {
    body.secret_token = config.webhookSecret;
  }

  await callTelegramApi("deleteWebhook", { drop_pending_updates: true });

  const result = await callTelegramApi("setWebhook", body);
  if (!result.ok) {
    return NextResponse.json({ error: result.description ?? "Échec setWebhook" }, { status: 400 });
  }

  const info = await callTelegramApi<{ url?: string; last_error_message?: string }>("getWebhookInfo");

  return NextResponse.json({
    ok: true,
    webhook_url: webhookUrl,
    secret_configured: Boolean(config.webhookSecret),
    telegram_webhook: info.result ?? null,
  });
}
