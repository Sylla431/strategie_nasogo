import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest, getAuthUserId } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSubscriptionByUserId } from "@/lib/telegram/subscription";
import { resolveVipCheckout } from "@/lib/telegram/pricing";
import { initiateMonerooForVipPayment } from "@/lib/payments/initiateMonerooVip";

/**
 * POST /api/telegram/vip/checkout
 * Crée un paiement VIP (adhésion ou renouvellement) et initie Moneroo.
 */
export async function POST(req: NextRequest) {
  const { supabase, token } = createSupabaseFromRequest(req);
  const userId = await getAuthUserId(supabase, token);

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  try {
    const existing = await getSubscriptionByUserId(userId);
    const checkout = resolveVipCheckout(!!existing);

    const { data: vipPayment, error: insertError } = await supabaseAdmin
      .from("telegram_vip_payments")
      .insert({
        user_id: userId,
        kind: checkout.kind,
        amount: checkout.amount,
        months: checkout.months,
        status: "pending",
      })
      .select("*")
      .single();

    if (insertError || !vipPayment) {
      console.error("VIP payment insert error:", insertError);
      return NextResponse.json(
        { error: insertError?.message || "Impossible de créer le paiement VIP" },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "https://vbsniperacademie.com";

    const result = await initiateMonerooForVipPayment({
      supabase,
      userId,
      vipPaymentId: vipPayment.id,
      amount: checkout.amount,
      kind: checkout.kind,
      description: checkout.label,
      appUrl,
    });

    if (!result.ok) {
      await supabaseAdmin
        .from("telegram_vip_payments")
        .update({ status: "failed" })
        .eq("id", vipPayment.id);

      return NextResponse.json(
        { error: result.error, vip_payment_id: vipPayment.id },
        { status: result.status }
      );
    }

    return NextResponse.json({
      payment_url: result.payment_url,
      vip_payment_id: vipPayment.id,
      kind: checkout.kind,
      amount: checkout.amount,
      moneroo_payment_id: result.moneroo_payment_id,
    });
  } catch (error) {
    console.error("VIP checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
