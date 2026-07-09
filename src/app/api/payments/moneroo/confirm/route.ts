import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { verifyPayment } from "@/lib/moneroo";

/**
 * POST /api/payments/moneroo/confirm
 * Confirme un paiement Moneroo après redirection (return_url).
 * Utile si le webhook n'a pas encore été reçu.
 */
export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { orderId, paymentId } = await req.json();

    if (!orderId && !paymentId) {
      return NextResponse.json({ error: "orderId ou paymentId requis" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Récupérer la commande
    let order = null;
    let monerooPaymentId = paymentId as string | undefined;

    if (orderId) {
      const { data, error } = await serviceClient
        .from("orders")
        .select("id, user_id, course_id, status, payment_reference, payment_method")
        .eq("id", orderId)
        .eq("user_id", authUser.user.id)
        .eq("payment_method", "moneroo")
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
      }
      order = data;

      if (!monerooPaymentId && order.payment_reference) {
        try {
          const ref = JSON.parse(order.payment_reference);
          monerooPaymentId = ref.payment_id || ref.moneroo_id;
        } catch {
          /* ignore */
        }
      }
    }

    if (!monerooPaymentId) {
      return NextResponse.json({ error: "paymentId introuvable" }, { status: 400 });
    }

    // Déjà payée
    if (order?.status === "paid") {
      return NextResponse.json({ status: "paid", message: "Déjà confirmé" });
    }

    // Vérifier auprès de Moneroo
    const verified = await verifyPayment(monerooPaymentId);
    if (!verified.data) {
      return NextResponse.json(
        { error: verified.error || "Impossible de vérifier le paiement" },
        { status: 400 }
      );
    }

    const status = verified.data.status;

    // Si on n'avait pas la commande, la retrouver via metadata
    if (!order) {
      const metaOrderId = verified.data.metadata?.order_id;
      if (!metaOrderId) {
        return NextResponse.json({ error: "Commande non liée au paiement" }, { status: 404 });
      }

      const { data, error } = await serviceClient
        .from("orders")
        .select("id, user_id, course_id, status, payment_reference, payment_method")
        .eq("id", metaOrderId)
        .eq("user_id", authUser.user.id)
        .eq("payment_method", "moneroo")
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
      }
      order = data;

      if (order.status === "paid") {
        return NextResponse.json({ status: "paid", message: "Déjà confirmé" });
      }
    }

    if (status === "success" || status === "completed") {
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.moneroo_id = monerooPaymentId;
      paymentData.payment_id = monerooPaymentId;
      paymentData.completed_at = new Date().toISOString();
      paymentData.confirmed_via = "return_url";

      await serviceClient
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_reference: JSON.stringify(paymentData),
        })
        .eq("id", order.id);

      if (order.user_id && order.course_id) {
        const { error: accessError } = await serviceClient.rpc("grant_course_access_automatic", {
          p_user_id: order.user_id,
          p_course_id: order.course_id,
          p_granted_by: null,
        });

        if (accessError && accessError.code !== "23505") {
          console.error("❌ Erreur création accès automatique:", accessError);
        }
      }

      return NextResponse.json({ status: "paid", message: "Paiement confirmé" });
    }

    if (status === "failed" || status === "cancelled") {
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.moneroo_id = monerooPaymentId;
      paymentData.failed_at = new Date().toISOString();

      await serviceClient
        .from("orders")
        .update({
          status: "failed",
          payment_reference: JSON.stringify(paymentData),
        })
        .eq("id", order.id);

      return NextResponse.json({ status: "failed", message: "Paiement échoué" });
    }

    return NextResponse.json({ status: "pending", message: "Paiement en cours" });
  } catch (error) {
    console.error("Error confirming Moneroo payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
