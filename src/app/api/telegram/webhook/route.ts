import { NextRequest, NextResponse } from "next/server";
import { getTelegramConfig } from "@/lib/telegram/config";
import { processTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/webhookHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook Telegram actif. Telegram envoie des requêtes POST ici (pas GET).",
    tip: "Vérifiez GET /api/telegram/webhook-info (admin) pour voir si Telegram est bien configuré.",
  });
}

export async function POST(req: NextRequest) {
  const config = getTelegramConfig();
  if (!config) {
    console.error("telegram webhook: config manquante");
    return NextResponse.json({ error: "Telegram non configuré" }, { status: 503 });
  }

  if (config.webhookSecret) {
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== config.webhookSecret) {
      console.error("telegram webhook: secret invalide — Telegram reçoit 401 et le bot ne répond pas", {
        hasHeader: Boolean(headerSecret),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("telegram webhook: update reçu", {
    update_id: update.update_id,
    text: update.message?.text?.slice(0, 40),
    chat_id: update.message?.chat.id,
  });

  // Traitement synchrone (after() ne s'exécutait pas toujours sur Vercel)
  try {
    await processTelegramUpdate(update);
  } catch (error) {
    console.error("telegram webhook: erreur traitement", error);
  }

  return NextResponse.json({ ok: true });
}
