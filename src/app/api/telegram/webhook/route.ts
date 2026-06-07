import { NextRequest, NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { getTelegramConfig } from "@/lib/telegram/config";
import { handleStartWithToken } from "@/lib/telegram/linkToken";
import { sendTelegramMessage } from "@/lib/telegram/api";

type TelegramUpdate = {
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; username?: string; first_name?: string };
    text?: string;
  };
};

export async function POST(req: NextRequest) {
  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json({ error: "Telegram non configuré" }, { status: 503 });
  }

  if (config.webhookSecret) {
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== config.webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const from = message.from;
  const text = message.text.trim();

  if (text.startsWith("/start")) {
    const parts = text.split(/\s+/);
    const token = parts[1];

    if (!token) {
      await sendTelegramMessage(
        chatId,
        [
          "👋 Bienvenue !",
          "",
          "Pour accéder au canal privé, connectez-vous sur le site, puis cliquez sur le bouton <b>Accès Telegram</b> dans votre espace client.",
        ].join("\n"),
      );
      return NextResponse.json({ ok: true });
    }

    const result = await handleStartWithToken(token, from.id, from.username ?? null, chatId);
    if (!result.ok) {
      await sendTelegramMessage(chatId, result.message);
    }
    return NextResponse.json({ ok: true });
  }

  if (text === "/status") {
    await sendTelegramMessage(
      chatId,
      "Pour vérifier votre accès, utilisez le bouton Accès Telegram depuis votre espace client sur le site.",
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
