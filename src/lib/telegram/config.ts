export type TelegramConfig = {
  botToken: string;
  botUsername: string;
  channelId: string;
  webhookSecret: string;
  cronSecret: string;
  linkTokenTtlMinutes: number;
  inviteLinkExpireMinutes: number;
};

export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() ?? "";
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim() ?? "";

  if (!botToken || !botUsername || !channelId) {
    return null;
  }

  return {
    botToken,
    botUsername,
    channelId,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "",
    cronSecret:
      process.env.TELEGRAM_CRON_SECRET?.trim() ??
      process.env.CRON_SECRET?.trim() ??
      "",
    linkTokenTtlMinutes: Number(process.env.TELEGRAM_LINK_TOKEN_TTL_MINUTES ?? "15") || 15,
    inviteLinkExpireMinutes: Number(process.env.TELEGRAM_INVITE_LINK_TTL_MINUTES ?? "60") || 60,
  };
}
