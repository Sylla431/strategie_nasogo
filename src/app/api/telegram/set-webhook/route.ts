import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { callTelegramApi } from "@/lib/telegram/api";
import { getTelegramConfig } from "@/lib/telegram/config";

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json({ error: "Variables Telegram manquantes" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL manquant" }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const body: Record<string, unknown> = { url: webhookUrl };
  if (config.webhookSecret) {
    body.secret_token = config.webhookSecret;
  }

  const result = await callTelegramApi("setWebhook", body);
  if (!result.ok) {
    return NextResponse.json({ error: result.description ?? "Échec setWebhook" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, webhook_url: webhookUrl });
}
