import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getSubscriptionByUserId,
  grantOrExtendSubscription,
  isSubscriptionActive,
  revokeSubscription,
} from "@/lib/telegram/subscription";

async function resolveUserId(body: { user_id?: string; email?: string }): Promise<string | null> {
  if (body.user_id) return body.user_id;

  if (!body.email || !supabaseAdmin) return null;

  const { data: userIdData, error } = await supabaseAdmin.rpc("find_user_by_email", {
    user_email: body.email.toLowerCase().trim(),
  });

  if (error || !userIdData) return null;
  return userIdData as string;
}

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;
  if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim();
  const resolvedUserId = userId ?? (email ? await resolveUserId({ email }) : null);

  if (!resolvedUserId) {
    return NextResponse.json({ error: "user_id ou email requis" }, { status: 400 });
  }

  const sub = await getSubscriptionByUserId(resolvedUserId);
  if (!sub) {
    return NextResponse.json({ subscription: null, active: false });
  }

  return NextResponse.json({
    subscription: sub,
    active: isSubscriptionActive(sub),
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const body = (await req.json()) as { user_id?: string; email?: string; months?: number };
  const userId = await resolveUserId(body);
  if (!userId) {
    return NextResponse.json({ error: "Utilisateur introuvable (user_id ou email requis)" }, { status: 404 });
  }

  const months = Number(body.months ?? 1);
  if (!Number.isFinite(months) || months < 1 || months > 24) {
    return NextResponse.json({ error: "months doit être entre 1 et 24" }, { status: 400 });
  }

  const sub = await grantOrExtendSubscription(userId, months);
  if (!sub) {
    return NextResponse.json({ error: "Impossible de créer ou prolonger l'abonnement" }, { status: 500 });
  }

  return NextResponse.json({ subscription: sub, active: isSubscriptionActive(sub) }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const body = (await req.json()) as {
    user_id?: string;
    email?: string;
    action?: "extend" | "revoke";
    months?: number;
  };

  const userId = await resolveUserId(body);
  if (!userId) {
    return NextResponse.json({ error: "Utilisateur introuvable (user_id ou email requis)" }, { status: 404 });
  }

  if (body.action === "revoke") {
    const ok = await revokeSubscription(userId);
    if (!ok) {
      return NextResponse.json({ error: "Aucun abonnement à révoquer" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, action: "revoke" });
  }

  if (body.action === "extend") {
    const months = Number(body.months ?? 1);
    if (!Number.isFinite(months) || months < 1 || months > 24) {
      return NextResponse.json({ error: "months doit être entre 1 et 24" }, { status: 400 });
    }

    const sub = await grantOrExtendSubscription(userId, months);
    if (!sub) {
      return NextResponse.json({ error: "Impossible de prolonger l'abonnement" }, { status: 500 });
    }

    return NextResponse.json({ subscription: sub, active: isSubscriptionActive(sub), action: "extend" });
  }

  return NextResponse.json({ error: "action invalide (extend ou revoke)" }, { status: 400 });
}
