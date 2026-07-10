import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest, getAuthUserId } from "@/lib/supabaseServer";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifyPayment } from "@/lib/moneroo";
import { failVipPayment, fulfillVipPayment, type VipPaymentRow } from "@/lib/payments/fulfillVipPayment";
import { notifyAdminOrderPaid } from "@/lib/payments/notifyPaymentSuccess";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceSupabase = SupabaseClient<any>;

type OrderRow = {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  payment_reference: string | null;
  payment_method: string;
};

/**
 * POST /api/payments/moneroo/confirm
 * Confirme un paiement Moneroo après redirection (cours ou VIP).
 * Body: { orderId?, paymentId?, vipPaymentId? }
 */
export async function POST(req: NextRequest) {
  const { supabase, token } = createSupabaseFromRequest(req);
  const userId = await getAuthUserId(supabase, token);

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { orderId, paymentId, vipPaymentId } = await req.json();

    if (!orderId && !paymentId && !vipPaymentId) {
      return NextResponse.json(
        { error: "orderId, vipPaymentId ou paymentId requis" },
        { status: 400 }
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- VIP ---
    if (vipPaymentId || (!orderId && paymentId)) {
      const vipResult = await confirmVipPayment({
        serviceClient,
        userId,
        vipPaymentId,
        paymentId,
      });
      if (vipResult) return vipResult;
      // Si paymentId seul n'est pas VIP, continuer vers orders
      if (vipPaymentId) {
        return NextResponse.json({ error: "Paiement VIP non trouvé" }, { status: 404 });
      }
    }

    // --- Cours ---
    return confirmOrderPayment({
      serviceClient,
      userId,
      orderId,
      paymentId,
    });
  } catch (error) {
    console.error("Error confirming Moneroo payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

async function confirmVipPayment(params: {
  serviceClient: ServiceSupabase;
  userId: string;
  vipPaymentId?: string;
  paymentId?: string;
}): Promise<NextResponse | null> {
  const { serviceClient, userId, vipPaymentId, paymentId } = params;

  let payment: VipPaymentRow | null = null;
  let monerooPaymentId = paymentId as string | undefined;

  if (vipPaymentId) {
    const { data, error } = await serviceClient
      .from("telegram_vip_payments")
      .select("id, user_id, kind, amount, months, status, payment_reference")
      .eq("id", vipPaymentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    payment = data as VipPaymentRow;

    if (!monerooPaymentId && payment.payment_reference) {
      try {
        const ref = JSON.parse(payment.payment_reference);
        monerooPaymentId = ref.payment_id || ref.moneroo_id;
      } catch {
        /* ignore */
      }
    }
  } else if (paymentId) {
    // Chercher VIP par moneroo payment_id
    const { data: pending } = await serviceClient
      .from("telegram_vip_payments")
      .select("id, user_id, kind, amount, months, status, payment_reference")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    payment =
      (pending?.find((p) => {
        try {
          const ref = p.payment_reference ? JSON.parse(p.payment_reference) : {};
          return ref.payment_id === paymentId || ref.moneroo_id === paymentId;
        } catch {
          return false;
        }
      }) as VipPaymentRow | undefined) ?? null;

    if (!payment) return null;
    monerooPaymentId = paymentId;
  }

  if (!payment || !monerooPaymentId) return null;

  if (payment.status === "paid") {
    return NextResponse.json({
      status: "paid",
      product: "telegram_vip",
      message: "VIP déjà confirmé",
    });
  }

  const verified = await verifyPayment(monerooPaymentId);
  if (!verified.data) {
    return NextResponse.json(
      { error: verified.error || "Impossible de vérifier le paiement" },
      { status: 400 }
    );
  }

  const status = verified.data.status;

  if (status === "success" || status === "completed") {
    const result = await fulfillVipPayment({
      serviceClient,
      payment,
      monerooPaymentId,
      confirmedVia: "return_url",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      status: "paid",
      product: "telegram_vip",
      message: "Abonnement VIP activé",
    });
  }

  if (status === "failed" || status === "cancelled") {
    await failVipPayment({ serviceClient, payment, monerooPaymentId });
    return NextResponse.json({
      status: "failed",
      product: "telegram_vip",
      message: "Paiement VIP échoué",
    });
  }

  return NextResponse.json({
    status: "pending",
    product: "telegram_vip",
    message: "Paiement en cours",
  });
}

async function confirmOrderPayment(params: {
  serviceClient: ServiceSupabase;
  userId: string;
  orderId?: string;
  paymentId?: string;
}) {
  const { serviceClient, userId, orderId, paymentId } = params;

  let order: OrderRow | null = null;
  let monerooPaymentId = paymentId as string | undefined;

  if (orderId) {
    const { data, error } = await serviceClient
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method")
      .eq("id", orderId)
      .eq("user_id", userId)
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

  if (order?.status === "paid") {
    return NextResponse.json({ status: "paid", message: "Déjà confirmé" });
  }

  const verified = await verifyPayment(monerooPaymentId);
  if (!verified.data) {
    return NextResponse.json(
      { error: verified.error || "Impossible de vérifier le paiement" },
      { status: 400 }
    );
  }

  const status = verified.data.status;

  if (!order) {
    const metaOrderId = verified.data.metadata?.order_id;
    if (!metaOrderId) {
      return NextResponse.json({ error: "Commande non liée au paiement" }, { status: 404 });
    }

    const { data, error } = await serviceClient
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method")
      .eq("id", metaOrderId)
      .eq("user_id", userId)
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

    void notifyAdminOrderPaid({
      serviceClient,
      orderId: order.id,
      userId: order.user_id,
      courseId: order.course_id,
      paymentMethod: order.payment_method || "moneroo",
      monerooPaymentId,
    });

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
}
