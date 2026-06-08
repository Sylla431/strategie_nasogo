import { sendTelegramMessage } from "@/lib/telegram/api";
import { handleStartWithToken } from "@/lib/telegram/linkToken";

export type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; username?: string; first_name?: string };
    text?: string;
  };
};

export function parseStartToken(text: string): string | null {
  const trimmed = text.trim();
  // /start TOKEN ou /start@MonBot TOKEN
  const match = trimmed.match(/^\/start(?:@[\w_]+)?(?:\s+(.+))?$/i);
  if (!match) return null;
  const token = match[1]?.trim();
  return token || null;
}

export async function processTelegramUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message?.text || !message.from) return;

  const chatId = message.chat.id;
  const from = message.from;
  const text = message.text.trim();

  try {
    if (text.startsWith("/start")) {
      const token = parseStartToken(text);

      if (!token) {
        await sendTelegramMessage(
          chatId,
          [
            "👋 Bienvenue !",
            "",
            "Pour accéder au canal VIP, connectez-vous sur le site vbsniperacademie.com, puis cliquez sur « Accès canal VIP » dans votre espace client.",
          ].join("\n"),
        );
        return;
      }

      const result = await handleStartWithToken(token, from.id, from.username ?? null, chatId);
      if (!result.ok) {
        await sendTelegramMessage(chatId, result.message);
      }
      return;
    }

    if (text === "/status" || text.startsWith("/status@")) {
      await sendTelegramMessage(
        chatId,
        "Pour obtenir votre lien d'accès, utilisez le bouton « Accès canal VIP » sur votre espace client sur le site.",
      );
    }
  } catch (error) {
    console.error("processTelegramUpdate error:", error);
    try {
      await sendTelegramMessage(
        chatId,
        "Une erreur est survenue. Réessayez dans quelques instants ou contactez le support.",
      );
    } catch (sendError) {
      console.error("Failed to send error message to Telegram:", sendError);
    }
  }
}
