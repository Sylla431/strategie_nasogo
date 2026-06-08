import { NextRequest, NextResponse } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { getSubscriptionByUserId, isSubscriptionActive } from "@/lib/telegram/subscription";

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sub = await getSubscriptionByUserId(authData.user.id);
  if (!sub) {
    return NextResponse.json({
      active: false,
      account_email: authData.user.email ?? null,
      subscription: null,
    });
  }

  return NextResponse.json({
    active: isSubscriptionActive(sub),
    account_email: authData.user.email ?? null,
    subscription: {
      status: sub.status,
      subscription_expires_at: sub.subscription_expires_at,
      telegram_linked: sub.telegram_user_id != null,
      telegram_username: sub.telegram_username,
    },
  });
}
