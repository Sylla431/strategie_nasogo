import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveUserFromEmailOrId } from "@/lib/telegram/resolveUser";
import {
  expireSubscriptionNow,
  getSubscriptionByUserId,
  grantOrExtendSubscription,
  isSubscriptionActive,
  processExpiredSubscriptions,
  revokeSubscription,
} from "@/lib/telegram/subscription";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;
  if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim();

  const resolved = await resolveUserFromEmailOrId({
    user_id: userId || undefined,
    email: email || undefined,
  });

  if (!resolved) {
    return NextResponse.json(
      {
        error:
          "Utilisateur introuvable. Vérifiez que le client a créé un compte sur le site avec cet email, ou liez la fiche étudiant.",
        subscription: null,
        active: false,
      },
      { status: 404 },
    );
  }

  const sub = await getSubscriptionByUserId(resolved.userId);
  if (!sub) {
    return NextResponse.json({
      subscription: null,
      active: false,
      resolved_user_id: resolved.userId,
      resolved_via: resolved.resolvedVia,
      email_hint: resolved.emailHint,
    });
  }

  return NextResponse.json({
    subscription: sub,
    active: isSubscriptionActive(sub),
    resolved_user_id: resolved.userId,
    resolved_via: resolved.resolvedVia,
    email_hint: resolved.emailHint,
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const body = (await req.json()) as { user_id?: string; email?: string; months?: number };
  const resolved = await resolveUserFromEmailOrId(body);

  if (!resolved) {
    return NextResponse.json(
      {
        error:
          "Utilisateur introuvable. Le client doit d'abord créer un compte sur le site avec cet email (ou lier la fiche étudiant).",
      },
      { status: 404 },
    );
  }

  const months = Number(body.months ?? 1);
  if (!Number.isFinite(months) || months < 1 || months > 24) {
    return NextResponse.json({ error: "months doit être entre 1 et 24" }, { status: 400 });
  }

  const grantEmail = body.email?.toLowerCase().trim() ?? resolved.emailHint;
  const { subscription: sub, error: grantError } = await grantOrExtendSubscription(
    resolved.userId,
    months,
    grantEmail,
  );
  if (!sub) {
    return NextResponse.json(
      { error: grantError ?? "Impossible de créer ou prolonger l'abonnement" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      subscription: sub,
      active: isSubscriptionActive(sub),
      resolved_user_id: resolved.userId,
      resolved_via: resolved.resolvedVia,
      email_hint: resolved.emailHint,
    },
    { status: 201 },
  );
}

export async function PATCH(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return adminCheck.error;

  const body = (await req.json()) as {
    user_id?: string;
    email?: string;
    action?: "extend" | "revoke" | "expire_now" | "run_cron";
    months?: number;
  };

  if (body.action === "run_cron") {
    const cronResult = await processExpiredSubscriptions();
    return NextResponse.json({ ok: true, action: "run_cron", ...cronResult });
  }

  const resolved = await resolveUserFromEmailOrId(body);
  if (!resolved) {
    return NextResponse.json({ error: "Utilisateur introuvable (user_id ou email requis)" }, { status: 404 });
  }

  if (body.action === "revoke") {
    const ok = await revokeSubscription(resolved.userId);
    if (!ok) {
      return NextResponse.json({ error: "Aucun abonnement à révoquer" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, action: "revoke", resolved_user_id: resolved.userId });
  }

  if (body.action === "expire_now") {
    const result = await expireSubscriptionNow(resolved.userId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Échec expiration test" }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      action: "expire_now",
      kicked_from_channel: result.kicked,
      resolved_user_id: resolved.userId,
      message: result.kicked
        ? "Abonnement expiré et utilisateur retiré du canal."
        : "Abonnement expiré (Telegram non lié — pas de kick possible).",
    });
  }

  if (body.action === "extend") {
    const months = Number(body.months ?? 1);
    if (!Number.isFinite(months) || months < 1 || months > 24) {
      return NextResponse.json({ error: "months doit être entre 1 et 24" }, { status: 400 });
    }

    const grantEmail = body.email?.toLowerCase().trim() ?? resolved.emailHint;
  const { subscription: sub, error: grantError } = await grantOrExtendSubscription(
    resolved.userId,
    months,
    grantEmail,
  );
    if (!sub) {
      return NextResponse.json({ error: grantError ?? "Impossible de prolonger l'abonnement" }, { status: 500 });
    }

    return NextResponse.json({
      subscription: sub,
      active: isSubscriptionActive(sub),
      action: "extend",
      resolved_user_id: resolved.userId,
    });
  }

  return NextResponse.json({ error: "action invalide (extend ou revoke)" }, { status: 400 });
}
