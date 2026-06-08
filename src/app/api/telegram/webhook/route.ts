import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { getTelegramConfig } from "@/lib/telegram/config";
import { processTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/webhookHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook Telegram actif. Telegram doit envoyer des requêtes POST ici.",
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
      console.error("telegram webhook: secret invalide", {
        hasHeader: Boolean(headerSecret),
        headerLength: headerSecret?.length ?? 0,
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

  // Répondre vite à Telegram (sinon il réessaie et l'utilisateur ne voit rien)
  after(async () => {
    await processTelegramUpdate(update);
  });

  return NextResponse.json({ ok: true });
}
