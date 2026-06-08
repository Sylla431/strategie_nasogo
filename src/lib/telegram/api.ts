import { getTelegramConfig } from "@/lib/telegram/config";

type TelegramApiResponse<T = unknown> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export async function callTelegramApi<T = unknown>(
  method: string,
  body?: Record<string, unknown>,
): Promise<TelegramApiResponse<T>> {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false, description: "Configuration Telegram manquante" };
  }

  const res = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  return (await res.json()) as TelegramApiResponse<T>;
}

export async function sendTelegramMessage(chatId: number | string, text: string) {
  const withHtml = await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });

  if (withHtml.ok) return withHtml;

  console.error("sendTelegramMessage HTML failed:", withHtml.description);
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text: text.replace(/<[^>]+>/g, ""),
  });
}

export async function createPersonalInviteLink(userId: string) {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false as const, inviteLink: null, error: "Configuration Telegram manquante" };
  }

  const expireDate = Math.floor(Date.now() / 1000) + config.inviteLinkExpireMinutes * 60;
  const response = await callTelegramApi<{ invite_link: string }>("createChatInviteLink", {
    chat_id: config.channelId,
    member_limit: 1,
    expire_date: expireDate,
    name: `access-${userId.slice(0, 8)}`,
  });

  if (!response.ok || !response.result?.invite_link) {
    return {
      ok: false as const,
      inviteLink: null,
      error: response.description ?? "Impossible de créer le lien d'invitation",
    };
  }

  return { ok: true as const, inviteLink: response.result.invite_link, error: null };
}

export async function kickFromChannel(telegramUserId: number) {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false, error: "Configuration Telegram manquante" };
  }

  return callTelegramApi("banChatMember", {
    chat_id: config.channelId,
    user_id: telegramUserId,
    revoke_messages: false,
  });
}

export async function unbanFromChannel(telegramUserId: number) {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false, error: "Configuration Telegram manquante" };
  }

  return callTelegramApi("unbanChatMember", {
    chat_id: config.channelId,
    user_id: telegramUserId,
    only_if_banned: true,
  });
}
