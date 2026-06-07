import { NextRequest, NextResponse } from "next/server";
import { getTelegramConfig } from "@/lib/telegram/config";
import { processExpiredSubscriptions } from "@/lib/telegram/subscription";

function isAuthorized(req: NextRequest, cronSecret: string) {
  if (!cronSecret) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const headerSecret = req.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
}

export async function GET(req: NextRequest) {
  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json({ error: "Telegram non configuré" }, { status: 503 });
  }

  if (!isAuthorized(req, config.cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processExpiredSubscriptions();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
