import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MonerooWebhookPayload, verifyPayment, verifyWebhookToken } from "@/lib/moneroo";

/**
 * POST /api/payments/moneroo/webhook
 * Webhook pour recevoir les notifications de paiement Moneroo
 *
 * Documentation: https://docs.moneroo.io/introduction/webhooks
 * Payload typique:
 * {
 *   "event": "payment.success" | "payment.failed" | "payment.cancelled" | "payment.initiated",
 *   "data": { "id": "...", "status": "...", "amount": 1000, "currency": "XOF" }
 * }
 *
 * L'order_id est dans metadata (passé à l'init) — on le récupère via verifyPayment si besoin.
 */
export async function POST(req: NextRequest) {
  try {
    // HMAC doit être calculé sur le raw body (pas JSON.stringify après parse)
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const isValid = verifyWebhookToken(rawBody, headers);
    if (!isValid) {
      console.error("❌ Token/Signature Moneroo invalide");
      console.error("Headers reçus:", Object.keys(headers));
      console.error("Signature header:", headers["x-moneroo-signature"]?.slice(0, 16) + "...");
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    let body: { event?: string; data?: MonerooWebhookPayload["data"]; metadata?: Record<string, string> };
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("Webhook Moneroo JSON invalide");
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const payload: MonerooWebhookPayload = {
      event: body.event as MonerooWebhookPayload["event"],
      data: body.data as MonerooWebhookPayload["data"],
    };

    if (!payload.event || !payload.data?.id) {
      console.error("Webhook Moneroo payload invalide:", body);
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    console.log("✅ Webhook Moneroo authentifié:", payload.event, payload.data.id);

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Récupérer order_id depuis metadata du payload, ou via l'API verify
    let orderId =
      payload.data.metadata?.order_id ||
      body.data?.metadata?.order_id ||
      body.metadata?.order_id;

    if (!orderId) {
      const verified = await verifyPayment(payload.data.id);
      orderId = verified.data?.metadata?.order_id;
      console.log("Order ID via verifyPayment:", orderId, "status:", verified.data?.status);
    }

    // Fallback: chercher la commande par payment_id stocké à l'initiation
    let order = null;

    if (orderId) {
      const { data, error } = await supabase
        .from("orders")
        .select("id, user_id, course_id, status, payment_reference, payment_method")
        .eq("id", orderId)
        .eq("payment_method", "moneroo")
        .single();

      if (!error && data) {
        order = data;
      }
    }

    if (!order) {
      // Chercher par payment_id dans payment_reference
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
      console.log("Commande déjà payée, webhook ignoré:", order.id);
      return NextResponse.json({ message: "Commande déjà traitée" }, { status: 200 });
    }

    if (payload.event === "payment.success") {
      // Re-vérifier auprès de Moneroo avant d'accorder l'accès
      const verified = await verifyPayment(payload.data.id);
      const verifiedStatus = verified.data?.status;

      if (verifiedStatus && verifiedStatus !== "success" && verifiedStatus !== "completed") {
        console.warn("Webhook success mais verify status =", verifiedStatus);
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
        console.error("Erreur mise à jour commande:", updateError);
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
        } else {
          console.log("✅ Accès au cours accordé automatiquement pour paiement Moneroo");
        }
      }

      return NextResponse.json({ message: "Paiement confirmé et accès accordé" }, { status: 200 });
    }

    if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.moneroo_id = payload.data.id;
      paymentData.failed_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_reference: JSON.stringify(paymentData),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Erreur mise à jour commande en failed:", updateError);
      } else {
        console.log("✅ Commande mise en 'failed':", order.id);
      }

      return NextResponse.json({ message: "Paiement échoué" }, { status: 200 });
    }

    console.log("Événement Moneroo:", payload.event);
    return NextResponse.json({ message: "Paiement en cours" }, { status: 200 });
  } catch (error) {
    console.error("Erreur traitement webhook Moneroo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
