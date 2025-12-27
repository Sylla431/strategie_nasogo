import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { verifyWebhookToken, OrangeMoneyWebhookPayload } from "@/lib/orangeMoney";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/payments/webhook
 * Webhook pour recevoir les notifications de paiement Orange Money
 * 
 * Documentation: Orange Money envoie une notification POST avec:
 * {
 *   "status": "SUCCESS" | "FAILED",
 *   "notif_token": "...",
 *   "txnid": "..."
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Valider la structure du payload selon la documentation
    const payload: OrangeMoneyWebhookPayload = {
      status: body.status,
      notif_token: body.notif_token,
      txnid: body.txnid || "", // txnid peut être vide pour les échecs
    };

    // Validation : status et notif_token sont obligatoires
    // txnid est obligatoire seulement pour SUCCESS, peut être vide pour FAILED
    if (!payload.status || !payload.notif_token) {
      console.error("Webhook payload invalide (status ou notif_token manquant):", body);
      return NextResponse.json({ error: "Payload invalide: status et notif_token requis" }, { status: 400 });
    }

    // Pour SUCCESS, txnid doit être présent et non vide
    if (payload.status === "SUCCESS" && !payload.txnid) {
      console.error("Webhook payload invalide (txnid manquant pour SUCCESS):", body);
      return NextResponse.json({ error: "Payload invalide: txnid requis pour SUCCESS" }, { status: 400 });
    }

    // Utiliser un client Supabase avec service role pour contourner RLS
    // Le webhook doit pouvoir lire toutes les commandes, même si RLS bloque
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Utiliser service role si disponible, sinon client normal
    let supabase;
    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log("🔑 Utilisation du service role pour le webhook");
    } else {
      const { supabase: normalSupabase } = createSupabaseFromRequest(req);
      supabase = normalSupabase;
      console.warn("⚠️ Service role non disponible, utilisation du client normal");
    }

    // Le webhook Orange Money ne contient pas order_id, seulement notif_token et txnid
    // On doit trouver la commande en cherchant celle qui a le notif_token correspondant
    // Le notif_token est stocké dans payment_reference au format JSON lors de l'initiation
    
    // Chercher toutes les commandes récentes (dernières 48h pour être sûr) avec payment_method orange_money
    // On cherche dans pending ET paid au cas où le webhook arrive deux fois
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    console.log(`🔍 Recherche de commande avec notif_token: ${payload.notif_token}`);
    console.log(`📅 Date limite: ${twoDaysAgo}`);
    
    // Essayer d'abord avec payment_reference dans le SELECT
    let orders: Array<{
      id: string;
      user_id: string;
      course_id: string;
      status: string;
      payment_reference: string | null;
      payment_method: string;
      created_at: string;
    }> | null = null;
    
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_id, course_id, status, payment_reference, payment_method, created_at")
      .eq("payment_method", "orange_money")
      .in("status", ["pending", "paid"])
      .gte("created_at", twoDaysAgo)
      .order("created_at", { ascending: false });

    // Si erreur liée à payment_reference, essayer sans cette colonne
    if (ordersError) {
      console.warn("⚠️ Erreur lors de la recherche (peut-être payment_reference n'existe pas):", ordersError);
      
      // Essayer sans payment_reference
      const { data: ordersWithoutRef, error: errorWithoutRef } = await supabase
        .from("orders")
        .select("id, user_id, course_id, status, payment_method, created_at")
        .eq("payment_method", "orange_money")
        .in("status", ["pending", "paid"])
        .gte("created_at", twoDaysAgo)
        .order("created_at", { ascending: false });
      
      if (errorWithoutRef) {
        console.error("❌ Erreur lors de la recherche des commandes (sans payment_reference):", errorWithoutRef);
        return NextResponse.json({ 
          error: "Erreur serveur. Vérifiez que la colonne payment_reference existe dans la table orders.",
          details: errorWithoutRef.message 
        }, { status: 500 });
      }
      
      // Récupérer payment_reference séparément pour chaque commande
      orders = [];
      if (ordersWithoutRef) {
        for (const o of ordersWithoutRef) {
          const { data: fullOrder } = await supabase
            .from("orders")
            .select("payment_reference")
            .eq("id", o.id)
            .single();
          orders.push({ ...o, payment_reference: fullOrder?.payment_reference || null });
        }
      }
    } else {
      orders = ordersData;
    }

    console.log(`📊 Nombre de commandes trouvées: ${orders?.length || 0}`);
    
    // Log toutes les commandes pour debug
    if (orders && orders.length > 0) {
      console.log("📋 Commandes trouvées:", orders.map(o => ({
        id: o.id,
        status: o.status,
        payment_method: o.payment_method,
        has_payment_reference: !!o.payment_reference,
        payment_reference_preview: o.payment_reference ? o.payment_reference.substring(0, 100) : null,
        created_at: o.created_at,
      })));
    } else {
      // Si aucune commande trouvée, chercher toutes les commandes récentes pour debug
      const { data: allRecentOrders } = await supabase
        .from("orders")
        .select("id, status, payment_method, created_at, payment_reference")
        .gte("created_at", twoDaysAgo)
        .order("created_at", { ascending: false })
        .limit(20);
      
      console.log("🔍 Toutes les commandes récentes (pour debug):", allRecentOrders?.map(o => ({
        id: o.id,
        status: o.status,
        payment_method: o.payment_method,
        created_at: o.created_at,
        has_payment_reference: !!o.payment_reference,
        payment_reference_preview: o.payment_reference ? o.payment_reference.substring(0, 100) : null,
      })));
      
      // Chercher aussi sans filtre de date pour voir s'il y a des commandes
      const { data: allOrders } = await supabase
        .from("orders")
        .select("id, status, payment_method, created_at")
        .eq("payment_method", "orange_money")
        .order("created_at", { ascending: false })
        .limit(10);
      
      console.log("🔍 Toutes les commandes Orange Money (sans filtre de date):", allOrders?.map(o => ({
        id: o.id,
        status: o.status,
        created_at: o.created_at,
      })));
    }

    // Trouver la commande avec le notif_token correspondant
    let order = null;
    for (const o of orders || []) {
      console.log(`Vérification commande ${o.id}, payment_reference:`, o.payment_reference ? "présent" : "absent");
      
      if (o.payment_reference) {
        try {
          const paymentData = JSON.parse(o.payment_reference);
          console.log(`Commande ${o.id} - notif_token stocké:`, paymentData.notif_token);
          
          if (paymentData.notif_token === payload.notif_token) {
            order = o;
            console.log(`✅ Commande trouvée: ${o.id}`);
            break;
          }
        } catch (e) {
          // Si payment_reference n'est pas du JSON, ignorer
          console.log(`Commande ${o.id} - Erreur parsing payment_reference:`, e);
          continue;
        }
      } else {
        console.log(`Commande ${o.id} - payment_reference est null ou undefined`);
      }
    }

    if (!order) {
      console.error("❌ Commande non trouvée pour notif_token:", payload.notif_token);
      console.error("Commandes vérifiées:", orders?.map(o => ({
        id: o.id,
        status: o.status,
        has_payment_reference: !!o.payment_reference,
        payment_reference_preview: o.payment_reference ? o.payment_reference.substring(0, 100) : null,
      })));
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // Vérifier que la commande n'est pas déjà payée (éviter les doublons)
    if (order.status === "paid") {
      console.log("Commande déjà payée, webhook ignoré:", order.id);
      return NextResponse.json({ message: "Commande déjà traitée" }, { status: 200 });
    }

    // Vérifier le notif_token selon la documentation
    // Le notif_token reçu doit correspondre à celui stocké lors de l'initiation
    let storedNotifToken = null;
    try {
      if (order.payment_reference) {
        const paymentData = JSON.parse(order.payment_reference);
        storedNotifToken = paymentData.notif_token;
      }
    } catch (e) {
      console.error("Erreur parsing payment_reference:", e);
    }

    if (!verifyWebhookToken(payload.notif_token, storedNotifToken || "")) {
      console.error("notif_token invalide:", payload.notif_token);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Traiter selon le statut
    if (payload.status === "SUCCESS") {
      // Mettre à jour la commande avec le txnid
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      paymentData.txnid = payload.txnid;
      
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

      // Accorder automatiquement l'accès au cours pour paiement Orange Money
      if (order.user_id && order.course_id && order.payment_method === "orange_money") {
        // Utiliser la fonction SQL pour accorder l'accès automatiquement (sans vérification admin)
        // Cette fonction est spécialement conçue pour les paiements Orange Money
        const { error: accessError } = await supabase.rpc("grant_course_access_automatic", {
          p_user_id: order.user_id,
          p_course_id: order.course_id,
          p_granted_by: null, // null = auto-attribution (pas besoin d'admin)
        });

        if (accessError && accessError.code !== "23505") {
          // 23505 = violation contrainte unique (accès déjà existant)
          console.error("❌ Erreur création accès automatique:", accessError);
          // On continue quand même car le paiement est validé
        } else {
          console.log("✅ Accès au cours accordé automatiquement pour paiement Orange Money");
        }
      } else {
        console.log("⚠️ Accès non accordé automatiquement:", {
          has_user_id: !!order.user_id,
          has_course_id: !!order.course_id,
          payment_method: order.payment_method,
        });
      }

      return NextResponse.json({ message: "Paiement confirmé et accès accordé" }, { status: 200 });
    } else if (payload.status === "FAILED") {
      // Le paiement a échoué, mettre la commande en "failed"
      // Mettre à jour payment_reference avec le txnid (même s'il est vide)
      const paymentData = order.payment_reference ? JSON.parse(order.payment_reference) : {};
      if (payload.txnid) {
        paymentData.txnid = payload.txnid;
      }
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
        console.log("✅ Commande mise en 'failed':", order.id, payload.txnid || "(txnid vide)");
      }
      
      return NextResponse.json({ message: "Paiement échoué" }, { status: 200 });
    } else {
      // Autre statut (ne devrait pas arriver selon la doc)
      console.log("Statut inattendu:", payload.status);
      return NextResponse.json({ message: "Statut inattendu" }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur traitement webhook Orange Money:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

