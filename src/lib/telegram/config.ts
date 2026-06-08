export type TelegramConfig = {
  botToken: string;
  botUsername: string;
  channelId: string;
  webhookSecret: string;
  cronSecret: string;
  linkTokenTtlMinutes: number;
  inviteLinkExpireMinutes: number;
};

export function getTelegramConfigMissing(): string[] {
  const missing: string[] = [];
  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) missing.push("TELEGRAM_BOT_TOKEN");
  if (!getBotUsername()) missing.push("NEXT_PUBLIC_TELEGRAM_BOT_USERNAME (ou TELEGRAM_BOT_USERNAME)");
  if (!process.env.TELEGRAM_CHANNEL_ID?.trim()) missing.push("TELEGRAM_CHANNEL_ID");
  return missing;
}

function getBotUsername(): string {
  return (
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() ??
    process.env.TELEGRAM_BOT_USERNAME?.trim() ??
    ""
  );
}

export function getTelegramWebhookBaseUrl(): string {
  return (
    process.env.TELEGRAM_WEBHOOK_URL?.trim().replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ??
    ""
  );
}

export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const botUsername = getBotUsername();
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim() ?? "";

  if (!botToken || !botUsername || !channelId) {
    return null;
  }

  return {
    botToken,
    botUsername,
    channelId,
    webhookSecret:
      process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ??
      process.env.TELEGRAM_LINK_SECRET?.trim() ??
      "",
    cronSecret:
      process.env.TELEGRAM_CRON_SECRET?.trim() ??
      process.env.CRON_SECRET?.trim() ??
      "",
    linkTokenTtlMinutes: Number(process.env.TELEGRAM_LINK_TOKEN_TTL_MINUTES ?? "15") || 15,
    inviteLinkExpireMinutes: Number(process.env.TELEGRAM_INVITE_LINK_TTL_MINUTES ?? "60") || 60,
  };
}
