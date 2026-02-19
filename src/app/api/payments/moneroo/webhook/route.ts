import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MonerooWebhookPayload, verifyWebhookToken } from "@/lib/moneroo";

/**
 * POST /api/payments/moneroo/webhook
 * Webhook pour recevoir les notifications de paiement Moneroo
 * 
 * Documentation: Moneroo envoie une notification POST avec:
 * {
 *   "event": "payment.success" | "payment.failed" | "payment.cancelled" | "payment.initiated",
 *   "data": {
 *     "id": "...",
 *     "status": "success" | "failed" | "cancelled" | "initiated",
 *     "order_id": "...",
 *     "amount": 1000,
 *     "currency": "XOF"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    // Valider la structure du payload
    const payload: MonerooWebhookPayload = {
      event: body.event,
      data: body.data,
    };

    if (!payload.event || !payload.data || !payload.data.order_id) {
      console.error("Webhook Moneroo payload invalide:", body);
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    // Vérifier le token/signature du webhook
    // Si PayTech est utilisé comme passerelle dans Moneroo, la vérification utilise MONEROO_WEBHOOK_SECRET
    const isValid = verifyWebhookToken(body, headers);
    if (!isValid) {
      console.error("❌ Token/Signature Moneroo invalide");
      console.error("Headers reçus:", Object.keys(headers));
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
    
    console.log("✅ Webhook Moneroo authentifié avec succès");

    // Utiliser un client Supabase avec service role
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let supabase;
    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
    }

    // Trouver la commande par order_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method")
      .eq("id", payload.data.order_id)
      .eq("payment_method", "moneroo")
      .single();

    if (orderError || !order) {
      console.error("Commande Moneroo non trouvée:", payload.data.order_id);
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // Vérifier que la commande n'est pas déjà payée (éviter les doublons)
    if (order.status === "paid" && payload.event === "payment.success") {
      console.log("Commande déjà payée, webhook ignoré:", order.id);
      return NextResponse.json({ message: "Commande déjà traitée" }, { status: 200 });
    }

    // Traiter selon l'événement
    if (payload.event === "payment.success") {
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

      // Accorder automatiquement l'accès au cours pour paiement Moneroo
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
    } else if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
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
    } else {
      // payment.initiated - on attend
      console.log("Événement Moneroo:", payload.event);
      return NextResponse.json({ message: "Paiement en cours" }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur traitement webhook Moneroo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
