import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PayTechWebhookPayload, verifyWebhookSignature, decodeCustomField } from "@/lib/paytech";

/**
 * POST /api/payments/paytech/webhook
 * Webhook pour recevoir les notifications de paiement PayTech (IPN)
 * 
 * Documentation PayTech: https://doc.intech.sn/doc_paytech.php#ipnfonctionment
 * 
 * Types d'événements:
 * - sale_complete: Paiement réussi
 * - sale_canceled: Paiement annulé
 * - refund_complete: Remboursement effectué
 * - transfer_success: Transfer réussi (pour API Transfer)
 * - transfer_failed: Transfer échoué (pour API Transfer)
 * 
 * PayTech envoie les données en POST (form-data ou JSON selon configuration)
 */
export async function POST(req: NextRequest) {
  try {
    // PayTech peut envoyer les données en form-data ou JSON
    // Essayer d'abord JSON, puis form-data
    let payload: PayTechWebhookPayload;

    try {
      const jsonBody = await req.json();
      payload = jsonBody as PayTechWebhookPayload;
    } catch {
      // Si JSON échoue, essayer form-data
      const formData = await req.formData();
      payload = {
        type_event: formData.get("type_event") as PayTechWebhookPayload["type_event"],
        custom_field: formData.get("custom_field") as string,
        ref_command: formData.get("ref_command") as string,
        item_name: formData.get("item_name") as string,
        item_price: Number(formData.get("item_price")),
        item_price_xof: formData.get("item_price_xof") ? Number(formData.get("item_price_xof")) : undefined,
        initial_item_price: formData.get("initial_item_price") ? Number(formData.get("initial_item_price")) : undefined,
        initial_item_price_xof: formData.get("initial_item_price_xof") ? Number(formData.get("initial_item_price_xof")) : undefined,
        final_item_price: formData.get("final_item_price") ? Number(formData.get("final_item_price")) : undefined,
        final_item_price_xof: formData.get("final_item_price_xof") ? Number(formData.get("final_item_price_xof")) : undefined,
        promo_enabled: formData.get("promo_enabled") === "true" || formData.get("promo_enabled") === "1",
        promo_value_percent: formData.get("promo_value_percent") ? Number(formData.get("promo_value_percent")) : undefined,
        currency: formData.get("currency") as string,
        command_name: formData.get("command_name") as string,
        token: formData.get("token") as string,
        env: formData.get("env") as string,
        payment_method: formData.get("payment_method") as string,
        client_phone: formData.get("client_phone") as string,
        api_key_sha256: formData.get("api_key_sha256") as string,
        api_secret_sha256: formData.get("api_secret_sha256") as string,
        hmac_compute: formData.get("hmac_compute") as string,
      } as PayTechWebhookPayload;
    }

    // Valider la structure du payload
    if (!payload.type_event || !payload.ref_command) {
      console.error("Webhook PayTech payload invalide:", payload);
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    // Vérifier l'authenticité de la notification
    const isValid = verifyWebhookSignature(payload);
    if (!isValid) {
      console.error("Signature PayTech invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 403 });
    }

    // Utiliser un client Supabase avec service role
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

    // Décoder custom_field pour obtenir order_id
    const customData = decodeCustomField(payload.custom_field);
    const orderId = customData.order_id as string;

    // Trouver la commande par ref_command ou order_id depuis custom_field
    let order;
    if (orderId) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, user_id, course_id, status, payment_reference, payment_method")
        .eq("id", orderId)
        .eq("payment_method", "paytech")
        .single();

      if (orderError || !orderData) {
        console.error("Commande PayTech non trouvée par order_id:", orderId);
        // Essayer avec ref_command dans payment_reference
        const { data: orders } = await supabase
          .from("orders")
          .select("id, user_id, course_id, status, payment_reference, payment_method")
          .eq("payment_method", "paytech")
          .contains("payment_reference", payload.ref_command);
        
        if (orders && orders.length > 0) {
          order = orders[0];
        } else {
          return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
        }
      } else {
        order = orderData;
      }
    } else {
      // Chercher par ref_command dans payment_reference
      const { data: orders } = await supabase
        .from("orders")
        .select("id, user_id, course_id, status, payment_reference, payment_method")
        .eq("payment_method", "paytech")
        .contains("payment_reference", payload.ref_command);
      
      if (!orders || orders.length === 0) {
        console.error("Commande PayTech non trouvée par ref_command:", payload.ref_command);
        return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
      }
      
      order = orders[0];
    }

    // Traiter selon le type d'événement
    if (payload.type_event === "sale_complete") {
      // Vérifier que la commande n'est pas déjà payée (éviter les doublons)
      if (order.status === "paid") {
        console.log("Commande déjà payée, webhook ignoré:", order.id);
        return NextResponse.json({ message: "Commande déjà traitée" }, { status: 200 });
      }

      const finalPrice = payload.final_item_price || payload.item_price;
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.paytech_token = payload.token;
      paymentData.paytech_ref_command = payload.ref_command;
      paymentData.completed_at = new Date().toISOString();
      paymentData.payment_method_used = payload.payment_method;
      paymentData.client_phone = payload.client_phone;
      if (payload.promo_enabled) {
        paymentData.promo_applied = true;
        paymentData.promo_value_percent = payload.promo_value_percent;
        paymentData.initial_price = payload.initial_item_price;
        paymentData.final_price = finalPrice;
      }
      
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

      // Accorder automatiquement l'accès au cours pour paiement PayTech
      if (order.user_id && order.course_id && order.payment_method === "paytech") {
        const { error: accessError } = await supabase.rpc("grant_course_access_automatic", {
          p_user_id: order.user_id,
          p_course_id: order.course_id,
          p_granted_by: null,
        });

        if (accessError && accessError.code !== "23505") {
          console.error("❌ Erreur création accès automatique:", accessError);
        } else {
          console.log("✅ Accès au cours accordé automatiquement pour paiement PayTech");
        }
      }

      console.log(`💰 Paiement PayTech réussi pour ${payload.ref_command}`);
      if (payload.promo_enabled) {
        console.log(`🎉 Promotion appliquée: ${payload.promo_value_percent}%`);
      }

      return NextResponse.json({ message: "Paiement confirmé et accès accordé" }, { status: 200 });
    } 
    else if (payload.type_event === "sale_canceled") {
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.paytech_token = payload.token;
      paymentData.paytech_ref_command = payload.ref_command;
      paymentData.canceled_at = new Date().toISOString();
      
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
      
      console.log(`❌ Paiement PayTech annulé pour ${payload.ref_command}`);
      return NextResponse.json({ message: "Paiement annulé" }, { status: 200 });
    }
    else if (payload.type_event === "refund_complete") {
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.refunded_at = new Date().toISOString();
      paymentData.refunded = true;
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "refunded",
          payment_reference: JSON.stringify(paymentData),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Erreur mise à jour commande en refunded:", updateError);
      } else {
        console.log("✅ Commande remboursée:", order.id);
      }
      
      console.log(`💸 Remboursement PayTech effectué pour ${payload.ref_command}`);
      return NextResponse.json({ message: "Remboursement confirmé" }, { status: 200 });
    }
    else {
      // transfer_success, transfer_failed, etc. - pour l'API Transfer (non utilisé pour les paiements)
      console.log("Événement PayTech non géré:", payload.type_event);
      return NextResponse.json({ message: "Événement non géré" }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur traitement webhook PayTech:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
