import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { initiatePayment } from "@/lib/paytech";
import { createClient } from "@supabase/supabase-js";

async function getUserId(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) return null;
  return authUser.user.id;
}

/**
 * POST /api/payments/paytech/initiate
 * Initie un paiement PayTech pour une commande
 * 
 * Documentation PayTech: https://doc.intech.sn/doc_paytech.php
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

    // Récupérer l'URL de base de l'application
    // En développement local, utiliser une URL HTTPS via tunnel (ngrok) ou laisser vide pour les webhooks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com";
    const isLocalDev = process.env.NODE_ENV === "development" && appUrl.startsWith("http://");
    
    // Pour les webhooks, PayTech exige HTTPS
    // En développement local, on peut omettre ces URLs si on n'a pas de tunnel HTTPS
    const webhookBaseUrl = process.env.PAYTECH_WEBHOOK_URL || appUrl;
    const hasHttpsWebhook = webhookBaseUrl.startsWith("https://");

    type Course = {
      title?: string;
      price?: number;
    };
    const course = order.courses as Course | undefined;
    const coursePrice = course?.price || 0;
    const courseTitle = course?.title || "Cours";

    // Vérifier que le prix est valide
    if (!coursePrice || coursePrice <= 0 || isNaN(Number(coursePrice))) {
      console.error("Prix du cours invalide:", coursePrice);
      return NextResponse.json({ error: "Le prix du cours n'est pas valide" }, { status: 400 });
    }

    // S'assurer que le montant est un entier
    const amount = Math.round(Number(coursePrice));
    if (amount <= 0 || isNaN(amount)) {
      console.error("Montant invalide après conversion:", amount, "depuis:", coursePrice);
      return NextResponse.json({ error: "Le montant doit être supérieur à 0" }, { status: 400 });
    }

    // Construire les URLs selon la documentation PayTech
    const successUrl = `${appUrl}/payment/success?order_id=${orderId}`;
    const cancelUrl = `${appUrl}/payment/cancel?order_id=${orderId}`;
    
    // Les webhooks doivent être en HTTPS selon PayTech
    // En développement local sans tunnel HTTPS, on ne les envoie pas (ils sont optionnels)
    const ipnUrl = hasHttpsWebhook ? `${webhookBaseUrl}/api/payments/paytech/webhook` : undefined;
    const refundNotifUrl = hasHttpsWebhook ? `${webhookBaseUrl}/api/payments/paytech/webhook` : undefined;
    
    if (isLocalDev && !hasHttpsWebhook) {
      console.warn("⚠️ Mode développement local détecté sans HTTPS. Les webhooks ne seront pas configurés.");
      console.warn("💡 Pour tester les webhooks en local, utilisez un tunnel HTTPS (ngrok) et définissez PAYTECH_WEBHOOK_URL");
    }

    // Générer une référence unique pour la commande PayTech
    // Format recommandé: préfixe + timestamp + orderId
    const refCommand = `CMD_${Date.now()}_${orderId}`;

    // Préparer custom_field avec les données de la commande (sera encodé en Base64 par PayTech)
    const customField = JSON.stringify({
      order_id: orderId,
      user_id: userId,
      course_id: order.course_id,
      email: userEmail,
    });

    // Initier le paiement PayTech selon la documentation officielle
    // Note: ipn_url et refund_notif_url sont optionnels mais doivent être en HTTPS si fournis
    const paymentParams: {
      item_name: string;
      item_price: number;
      ref_command: string;
      command_name: string;
      currency: string;
      env: string;
      success_url: string;
      cancel_url: string;
      custom_field: string;
      ipn_url?: string;
      refund_notif_url?: string;
      target_payment?: string;
    } = {
      item_name: courseTitle,
      item_price: amount,
      ref_command: refCommand,
      command_name: `Paiement ${courseTitle} via PayTech`,
      currency: "XOF",
      env: process.env.PAYTECH_ENV === "production" ? "prod" : "test",
      success_url: successUrl,
      cancel_url: cancelUrl,
      custom_field: customField,
      // Ajouter les webhooks seulement si HTTPS disponible
      ...(ipnUrl && { ipn_url: ipnUrl }),
      ...(refundNotifUrl && { refund_notif_url: refundNotifUrl }),
      // Optionnel: cibler une méthode de paiement spécifique
      // target_payment: "Orange Money", // ou "Orange Money, Wave, Free Money" pour plusieurs
    };

    console.log("Paramètres de paiement PayTech:", {
      item_name: paymentParams.item_name,
      item_price: paymentParams.item_price,
      ref_command: paymentParams.ref_command,
      env: paymentParams.env,
    });

    const paymentResult = await initiatePayment(paymentParams);

    if (paymentResult.success !== 1) {
      return NextResponse.json(
        { error: paymentResult.message || "Erreur lors de l'initiation du paiement" },
        { status: 400 }
      );
    }

    // Mettre à jour la commande avec le token PayTech pour vérification ultérieure
    if (paymentResult.token) {
      const paymentData = {
        paytech_token: paymentResult.token,
        paytech_ref_command: refCommand,
        provider: "paytech",
      };
      
      const paymentReferenceJson = JSON.stringify(paymentData);
      const realOrderId = order.id;
      
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
        const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        
        await serviceRoleClient
          .from("orders")
          .update({ payment_reference: paymentReferenceJson })
          .eq("id", realOrderId);
      } else {
        await supabase
          .from("orders")
          .update({ payment_reference: paymentReferenceJson })
          .eq("id", realOrderId);
      }
    }

    return NextResponse.json({
      payment_url: paymentResult.redirect_url || paymentResult.redirectUrl,
      token: paymentResult.token,
      ref_command: refCommand,
    });
  } catch (error) {
    console.error("Error initiating PayTech payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
