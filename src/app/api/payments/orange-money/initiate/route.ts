import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { initiatePayment } from "@/lib/orangeMoney";
import { createClient } from "@supabase/supabase-js";

async function getUserId(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) return null;
  return authUser.user.id;
}

/**
 * POST /api/payments/orange-money/initiate
 * Initie un paiement Orange Money pour une commande
 */
export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const userId = await getUserId(supabase);
  
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId requis" }, { status: 400 });
    }

    // Récupérer la commande pour vérifier qu'elle appartient à l'utilisateur
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, courses(*)")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // Vérifier que la commande n'est pas déjà payée
    if (order.status === "paid") {
      return NextResponse.json({ error: "Cette commande est déjà payée" }, { status: 400 });
    }

    // Récupérer les informations utilisateur pour le paiement
    const { data: userProfile } = await supabase
      .from("users_profile")
      .select("email, phone")
      .eq("id", userId)
      .single();

    // Récupérer l'email depuis auth.users si nécessaire
    let userEmail = userProfile?.email;
    if (!userEmail) {
      const { data: emailData } = await supabase.rpc("get_user_email", { user_id: userId });
      userEmail = emailData || undefined;
    }

    let appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com";
    
    // Orange Money n'accepte pas localhost ou 127.0.0.1
    // Vérifier si l'URL contient localhost ou 127.0.0.1
    if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
      // En développement, utiliser ngrok ou une URL publique
      // Si NGROK_URL est défini, l'utiliser
      const ngrokUrl = process.env.NGROK_URL;
      if (ngrokUrl) {
        appUrl = ngrokUrl;
      } else {
        return NextResponse.json({ 
          error: "Orange Money n'accepte pas les URLs localhost. " +
                 "Pour le développement, utilisez ngrok ou définissez NGROK_URL dans vos variables d'environnement. " +
                 "Exemple: NGROK_URL=https://your-ngrok-url.ngrok.io"
        }, { status: 400 });
      }
    }

    type Course = {
      title?: string;
      price?: number;
    };
    const coursePrice = (order.courses as Course | undefined)?.price || 0;

    // Vérifier que le prix est valide
    if (!coursePrice || coursePrice <= 0 || isNaN(Number(coursePrice))) {
      console.error("Prix du cours invalide:", coursePrice);
      return NextResponse.json({ error: "Le prix du cours n'est pas valide" }, { status: 400 });
    }

    // S'assurer que le montant est un entier (pas de décimales)
    const amount = Math.round(Number(coursePrice));
    if (amount <= 0 || isNaN(amount)) {
      console.error("Montant invalide après conversion:", amount, "depuis:", coursePrice);
      return NextResponse.json({ error: "Le montant doit être supérieur à 0" }, { status: 400 });
    }

    // Déterminer la devise selon l'environnement
    const isProduction = process.env.ORANGE_MONEY_ENV === "production";
    const currency = isProduction ? "XOF" : "OUV";
    
    // Log pour debug
    console.log("Données de paiement:", {
      coursePrice,
      amount,
      currency,
      isProduction,
      ORANGE_MONEY_ENV: process.env.ORANGE_MONEY_ENV,
    });

    // S'assurer que orderId ne dépasse pas 30 caractères (limite API)
    const shortOrderId = orderId.length > 30 ? orderId.substring(0, 30) : orderId;

    // Vérifier que merchant_key est défini
    const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;
    if (!merchantKey) {
      console.error("ORANGE_MONEY_MERCHANT_KEY n'est pas défini");
      return NextResponse.json({ error: "Configuration Orange Money manquante" }, { status: 500 });
    }

    // Construire les URLs (s'assurer qu'elles sont valides et ne contiennent pas localhost)
    const returnUrl = `${appUrl}/payment/success?order_id=${orderId}`;
    const cancelUrl = `${appUrl}/payment/cancel?order_id=${orderId}`;
    const notifUrl = `${appUrl}/api/payments/webhook`;

    // Vérifier que les URLs ne contiennent pas localhost ou 127.0.0.1
    if (returnUrl.includes("localhost") || returnUrl.includes("127.0.0.1") ||
        cancelUrl.includes("localhost") || cancelUrl.includes("127.0.0.1") ||
        notifUrl.includes("localhost") || notifUrl.includes("127.0.0.1")) {
      return NextResponse.json({ 
        error: "Orange Money n'accepte pas les URLs avec localhost ou 127.0.0.1. " +
               "Utilisez ngrok pour le développement ou définissez NGROK_URL."
      }, { status: 400 });
    }

    // Vérifier que les URLs ne dépassent pas 120 caractères
    if (returnUrl.length > 120 || cancelUrl.length > 120 || notifUrl.length > 120) {
      console.error("URLs trop longues:", { returnUrl: returnUrl.length, cancelUrl: cancelUrl.length, notifUrl: notifUrl.length });
      return NextResponse.json({ error: "Les URLs de retour sont trop longues" }, { status: 400 });
    }

    // Initier le paiement Orange Money selon la documentation
    const paymentParams = {
      merchant_key: merchantKey,
      amount: amount,
      currency: currency,
      order_id: shortOrderId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: notifUrl,
      lang: "fr",
      reference: "VB Sniper Academie".substring(0, 30), // Max 30 chars
    };

    // Log les paramètres avant l'envoi
    console.log("Paramètres de paiement Orange Money:", {
      ...paymentParams,
      merchant_key: merchantKey ? `${merchantKey.substring(0, 4)}...` : "undefined",
    });

    const paymentResult = await initiatePayment(paymentParams);

    if (paymentResult.status !== 201) {
      return NextResponse.json(
        { error: paymentResult.error || paymentResult.message || "Erreur lors de l'initiation du paiement" },
        { status: paymentResult.status || 400 }
      );
    }

    // Mettre à jour la commande avec le pay_token et notif_token pour vérification ultérieure
    // Stocker les deux tokens dans payment_reference au format JSON
    // Utiliser order.id (l'ID réel de la commande récupérée) au lieu de orderId du body
    if (paymentResult.pay_token && paymentResult.notif_token) {
      const paymentData = {
        pay_token: paymentResult.pay_token,
        notif_token: paymentResult.notif_token,
      };
      
      const paymentReferenceJson = JSON.stringify(paymentData);
      
      // Utiliser order.id qui est l'ID réel de la commande dans la base de données
      const realOrderId = order.id;
      
      console.log(`🔄 Tentative de mise à jour payment_reference pour commande ${realOrderId}`);
      console.log(`📝 orderId du body: ${orderId}, order.id réel: ${realOrderId}`);
      console.log(`📝 Données à stocker:`, paymentReferenceJson);
      
      // Vérifier d'abord que la commande existe et peut être mise à jour
      const { data: checkOrder, error: checkError } = await supabase
        .from("orders")
        .select("id, status, payment_method, payment_reference")
        .eq("id", realOrderId)
        .single();

      if (checkError) {
        console.error("❌ Erreur lors de la vérification de la commande:", checkError);
        if (checkError.message?.includes("payment_reference")) {
          console.error("🚨 La colonne payment_reference n'existe probablement pas!");
          console.error("💡 Exécutez la migration SQL (voir AJOUTER_COLONNE_PAYMENT_REFERENCE.md)");
        }
      } else {
        console.log(`✅ Commande trouvée:`, {
          id: checkOrder.id,
          status: checkOrder.status,
          payment_method: checkOrder.payment_method,
          has_payment_reference: !!checkOrder.payment_reference,
        });
      }

      // Utiliser directement le service role pour contourner RLS
      // car la mise à jour de payment_reference doit fonctionner même si RLS bloque
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      type UpdateResult = {
        id: string;
        payment_reference: string | null;
      } | null;
      let updatedOrders: UpdateResult[] | null = null;
      type UpdateError = {
        code?: string;
        message?: string;
        details?: string;
        hint?: string;
      } | null;
      let updateError: UpdateError = null;
      
      if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
        // Utiliser service role directement pour contourner RLS
        const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        
        const { data: serviceUpdatedOrders, error: serviceError } = await serviceRoleClient
          .from("orders")
          .update({ 
            payment_reference: paymentReferenceJson,
          })
          .eq("id", realOrderId)
          .select("id, payment_reference");
        
        if (serviceError) {
          console.error("❌ Erreur avec service role:", serviceError);
          updateError = serviceError;
        } else if (serviceUpdatedOrders && serviceUpdatedOrders.length > 0) {
          console.log("✅ Mise à jour réussie avec service role");
          updatedOrders = serviceUpdatedOrders;
        } else {
          console.warn("⚠️ Service role: 0 lignes mises à jour");
          // Essayer avec le client normal comme fallback
          const { data: normalUpdatedOrders, error: normalError } = await supabase
            .from("orders")
            .update({ 
              payment_reference: paymentReferenceJson,
            })
            .eq("id", realOrderId)
            .select("id, payment_reference");
          
          if (normalError) {
            updateError = normalError;
          } else {
            updatedOrders = normalUpdatedOrders;
          }
        }
      } else {
        // Fallback: utiliser le client normal si service role n'est pas disponible
        console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY non défini, utilisation du client normal");
        const { data: normalUpdatedOrders, error: normalError } = await supabase
          .from("orders")
          .update({ 
            payment_reference: paymentReferenceJson,
          })
          .eq("id", realOrderId)
          .select("id, payment_reference");
        
        if (normalError) {
          updateError = normalError;
        } else {
          updatedOrders = normalUpdatedOrders;
        }
      }

      // Si succès, prendre le premier élément
      const updatedOrder = updatedOrders && updatedOrders.length > 0 ? updatedOrders[0] : null;
      
      console.log(`📊 Résultat de la mise à jour:`, {
        rows_updated: updatedOrders?.length || 0,
        has_error: !!updateError,
        error_code: updateError?.code,
        error_message: updateError?.message,
      });

      if (updateError) {
        console.error("❌ Erreur lors de la mise à jour de payment_reference:", updateError);
        console.error("Détails de l'erreur:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        // On continue quand même car le paiement est initié
      } else {
        // Vérifier que la mise à jour a bien fonctionné
        if (updatedOrder && updatedOrder.payment_reference) {
          console.log(`✅ payment_reference mis à jour avec succès pour la commande ${realOrderId}`);
          console.log(`📋 payment_reference stocké:`, updatedOrder.payment_reference.substring(0, 100) + "...");
        } else {
          console.warn(`⚠️ Mise à jour réussie mais payment_reference est null dans la réponse pour la commande ${realOrderId}`);
          console.warn(`Réponse complète:`, updatedOrder);
          
          // Vérifier si la colonne existe en essayant de la lire
          const { data: checkOrder, error: checkError } = await supabase
            .from("orders")
            .select("id, payment_reference")
            .eq("id", realOrderId)
            .single();
          
          if (checkError) {
            console.error("❌ Erreur lors de la vérification:", checkError);
            if (checkError.message?.includes("payment_reference")) {
              console.error("🚨 La colonne payment_reference n'existe probablement pas dans la base de données!");
              console.error("💡 Exécutez la migration SQL pour ajouter la colonne (voir AJOUTER_COLONNE_PAYMENT_REFERENCE.md)");
            } else {
              console.error("❌ Erreur lors de la vérification:", checkError);
            }
          } else {
            console.log(`🔍 Vérification - payment_reference actuel:`, checkOrder?.payment_reference || "NULL");
          }
        }
      }
    } else {
      console.warn("⚠️ pay_token ou notif_token manquant dans la réponse:", {
        has_pay_token: !!paymentResult.pay_token,
        has_notif_token: !!paymentResult.notif_token,
      });
    }

    return NextResponse.json({
      payment_url: paymentResult.payment_url,
      pay_token: paymentResult.pay_token,
      notif_token: paymentResult.notif_token,
    });
  } catch (error) {
    console.error("Error initiating Orange Money payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

