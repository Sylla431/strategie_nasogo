import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";
import { initiatePayment } from "@/lib/moneroo";
import { createClient } from "@supabase/supabase-js";

async function getUserId(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) return null;
  return authUser.user.id;
}

/**
 * POST /api/payments/moneroo/initiate
 * Initie un paiement Moneroo pour une commande
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
    // Si Moneroo a configuré PayTech comme passerelle, utiliser le webhook_url fourni par Moneroo
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com";
    const monerooWebhookUrl = process.env.MONEROO_WEBHOOK_URL; // URL configurée dans Moneroo pour PayTech
    
    // En développement local, gérer HTTPS comme pour PayTech
    const isLocalDev = process.env.NODE_ENV === "development" && appUrl.startsWith("http://");
    const webhookBaseUrl = monerooWebhookUrl || appUrl;
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

    // Construire les URLs
    const returnUrl = `${appUrl}/payment/success?order_id=${orderId}`;
    const cancelUrl = `${appUrl}/payment/cancel?order_id=${orderId}`;
    
    // Utiliser le webhook_url configuré dans Moneroo si disponible, sinon construire l'URL
    // Si PayTech est utilisé comme passerelle, Moneroo peut avoir son propre webhook_url
    const webhookUrl = monerooWebhookUrl || (hasHttpsWebhook ? `${webhookBaseUrl}/api/payments/moneroo/webhook` : undefined);
    
    if (isLocalDev && !hasHttpsWebhook && !monerooWebhookUrl) {
      console.warn("⚠️ Mode développement local détecté sans HTTPS. Le webhook ne sera pas configuré.");
      console.warn("💡 Pour tester les webhooks en local, utilisez un tunnel HTTPS (ngrok) et définissez MONEROO_WEBHOOK_URL");
    }

    // Récupérer le nom complet de l'utilisateur
    const { data: authUser } = await supabase.auth.getUser();
    const fullName = authUser.user?.user_metadata?.full_name || 
                     authUser.user?.user_metadata?.name || 
                     userProfile?.email?.split('@')[0] || 
                     "Client";
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(' ') || "Moneroo";

    // Initier le paiement Moneroo selon la documentation officielle
    // Format: https://docs.moneroo.io/payments/standard-integration
    const paymentParams = {
      amount: amount,
      currency: "XOF",
      description: `Paiement pour ${courseTitle}`,
      return_url: returnUrl,
      customer: {
        email: userEmail || "client@example.com",
        first_name: firstName,
        last_name: lastName,
        ...(userProfile?.phone && { phone: userProfile.phone }),
      },
      metadata: {
        order_id: orderId,
        user_id: userId,
        course_id: order.course_id,
      },
      // Ajouter webhook_url seulement si disponible (HTTPS requis)
      ...(webhookUrl && { webhook_url: webhookUrl }),
    };

    console.log("Paramètres de paiement Moneroo:", {
      ...paymentParams,
      amount,
      currency: paymentParams.currency,
    });

    const paymentResult = await initiatePayment(paymentParams);

    // Moneroo retourne 201 pour un paiement initialisé avec succès
    if (paymentResult.status !== 201) {
      return NextResponse.json(
        { error: paymentResult.error || paymentResult.message || "Erreur lors de l'initiation du paiement" },
        { status: paymentResult.status || 400 }
      );
    }

    // Mettre à jour la commande avec le payment_id pour vérification ultérieure
    if (paymentResult.payment_id) {
      const paymentData = {
        payment_id: paymentResult.payment_id,
        provider: "moneroo",
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
      payment_url: paymentResult.payment_url,
      payment_id: paymentResult.payment_id,
    });
  } catch (error) {
    console.error("Error initiating Moneroo payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
