import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MonerooWebhookPayload, verifyPayment, verifyWebhookToken } from "@/lib/moneroo";
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
 * POST /api/payments/moneroo/webhook
 * Gère les paiements cours (orders) et VIP Telegram (telegram_vip_payments).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const isValid = verifyWebhookToken(rawBody, headers);
    if (!isValid) {
      console.error("❌ Token/Signature Moneroo invalide");
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    let body: {
      event?: string;
      data?: MonerooWebhookPayload["data"] & { metadata?: Record<string, string> };
      metadata?: Record<string, string>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const payload: MonerooWebhookPayload = {
      event: body.event as MonerooWebhookPayload["event"],
      data: body.data as MonerooWebhookPayload["data"],
    };

    if (!payload.event || !payload.data?.id) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    console.log("✅ Webhook Moneroo authentifié:", payload.event, payload.data.id);

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let metadata =
      payload.data.metadata ||
      body.data?.metadata ||
      body.metadata ||
      {};

    if (!metadata.product && !metadata.order_id && !metadata.payment_id) {
      const verified = await verifyPayment(payload.data.id);
      metadata = verified.data?.metadata || {};
    }

    // --- VIP Telegram ---
    if (metadata.product === "telegram_vip") {
      return handleVipWebhook(supabase, payload, metadata);
    }

    // --- Cours (orders) ---
    return handleOrderWebhook(supabase, payload, metadata, body);
  } catch (error) {
    console.error("Erreur traitement webhook Moneroo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

async function findVipPayment(
  supabase: ServiceSupabase,
  monerooId: string,
  metadata: Record<string, string>
): Promise<VipPaymentRow | null> {
  const vipPaymentId = metadata.payment_id;
  if (vipPaymentId) {
    const { data } = await supabase
      .from("telegram_vip_payments")
      .select("id, user_id, kind, amount, months, status, payment_reference")
      .eq("id", vipPaymentId)
      .maybeSingle();
    if (data) return data as VipPaymentRow;
  }

  const { data: pending } = await supabase
    .from("telegram_vip_payments")
    .select("id, user_id, kind, amount, months, status, payment_reference")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    pending?.find((p) => {
      try {
        const ref = p.payment_reference ? JSON.parse(p.payment_reference) : {};
        return ref.payment_id === monerooId;
      } catch {
        return false;
      }
    }) ?? null
  );
}

async function handleVipWebhook(
  supabase: ServiceSupabase,
  payload: MonerooWebhookPayload,
  metadata: Record<string, string>
) {
  const payment = await findVipPayment(supabase, payload.data.id, metadata);
  if (!payment) {
    console.error("Paiement VIP non trouvé:", payload.data.id, metadata);
    return NextResponse.json({ error: "Paiement VIP non trouvé" }, { status: 404 });
  }

  if (payment.status === "paid" && payload.event === "payment.success") {
    return NextResponse.json({ message: "VIP déjà traité" }, { status: 200 });
  }

  if (payload.event === "payment.success") {
    const verified = await verifyPayment(payload.data.id);
    const verifiedStatus = verified.data?.status;
    if (verifiedStatus && verifiedStatus !== "success" && verifiedStatus !== "completed") {
      return NextResponse.json({ message: "Statut non confirmé" }, { status: 200 });
    }

    const result = await fulfillVipPayment({
      serviceClient: supabase,
      payment,
      monerooPaymentId: payload.data.id,
      confirmedVia: "webhook",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ message: "VIP confirmé et abonnement accordé" }, { status: 200 });
  }

  if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
    await failVipPayment({
      serviceClient: supabase,
      payment,
      monerooPaymentId: payload.data.id,
    });
    return NextResponse.json({ message: "Paiement VIP échoué" }, { status: 200 });
  }

  return NextResponse.json({ message: "Paiement VIP en cours" }, { status: 200 });
}

async function handleOrderWebhook(
  supabase: ServiceSupabase,
  payload: MonerooWebhookPayload,
  metadata: Record<string, string>,
  body: { data?: { metadata?: Record<string, string> }; metadata?: Record<string, string> }
) {
  let orderId =
    metadata.order_id ||
    body.data?.metadata?.order_id ||
    body.metadata?.order_id;

  if (!orderId) {
    const verified = await verifyPayment(payload.data.id);
    orderId = verified.data?.metadata?.order_id;
  }

  let order: OrderRow | null = null;

  if (orderId) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method")
      .eq("id", orderId)
      .eq("payment_method", "moneroo")
      .single();

    if (!error && data) order = data;
  }

  if (!order) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method")
      .eq("payment_method", "moneroo")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);

    order =
      orders?.find((o) => {
        try {
          const ref = o.payment_reference ? JSON.parse(o.payment_reference) : {};
          return ref.payment_id === payload.data.id;
        } catch {
          return false;
        }
      }) ?? null;
  }

  if (!order) {
    console.error("Commande Moneroo non trouvée pour payment:", payload.data.id, "orderId:", orderId);
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  if (order.status === "paid" && payload.event === "payment.success") {
    return NextResponse.json({ message: "Commande déjà traitée" }, { status: 200 });
  }

  if (payload.event === "payment.success") {
    const verified = await verifyPayment(payload.data.id);
    const verifiedStatus = verified.data?.status;

    if (verifiedStatus && verifiedStatus !== "success" && verifiedStatus !== "completed") {
      return NextResponse.json({ message: "Statut non confirmé" }, { status: 200 });
    }

    const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
    paymentData.moneroo_id = payload.data.id;
    paymentData.completed_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_reference: JSON.stringify(paymentData),
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: "Erreur mise à jour commande" }, { status: 500 });
    }

    if (order.user_id && order.course_id && order.payment_method === "moneroo") {
      const { error: accessError } = await supabase.rpc("grant_course_access_automatic", {
        p_user_id: order.user_id,
        p_course_id: order.course_id,
        p_granted_by: null,
      });

      if (accessError && accessError.code !== "23505") {
        console.error("❌ Erreur création accès automatique:", accessError);
      }
    }

    void notifyAdminOrderPaid({
      serviceClient: supabase,
      orderId: order.id,
      userId: order.user_id,
      courseId: order.course_id,
      paymentMethod: order.payment_method || "moneroo",
      monerooPaymentId: payload.data.id,
    });

    return NextResponse.json({ message: "Paiement confirmé et accès accordé" }, { status: 200 });
  }

  if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
    const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
    paymentData.moneroo_id = payload.data.id;
    paymentData.failed_at = new Date().toISOString();

    await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_reference: JSON.stringify(paymentData),
      })
      .eq("id", order.id);

    return NextResponse.json({ message: "Paiement échoué" }, { status: 200 });
  }

  return NextResponse.json({ message: "Paiement en cours" }, { status: 200 });
}
