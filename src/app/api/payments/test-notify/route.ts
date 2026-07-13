import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest, getAuthUserId } from "@/lib/supabaseServer";
import { notifyAdminPaymentSuccess } from "@/lib/payments/notifyPaymentSuccess";

/**
 * POST /api/payments/test-notify
 * Envoie un email de test admin (paiement fictif). Réservé aux admins.
 */
export async function POST(req: NextRequest) {
  const { supabase, token } = createSupabaseFromRequest(req);
  const userId = await getAuthUserId(supabase, token);
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("role, email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY manquante sur le serveur" },
      { status: 500 }
    );
  }

  await notifyAdminPaymentSuccess({
    product: "course",
    paymentMethod: "test",
    amount: 1000,
    referenceId: `test_${Date.now()}`,
    userId,
    userEmail: profile.email ?? null,
    userName: profile.full_name ?? null,
    detail: "Email de test — notification paiement",
  });

  return NextResponse.json({
    ok: true,
    message: "Email de test envoyé (vérifie Resend + boîte mail)",
    to: process.env.PAYMENT_NOTIFY_EMAIL || "modiboongoiba76@gmail.com",
    from:
      process.env.RESEND_FROM_EMAIL ||
      "VB Sniper Académie <support@vbsniperacademie.com>",
    hasResendKey: true,
  });
}
