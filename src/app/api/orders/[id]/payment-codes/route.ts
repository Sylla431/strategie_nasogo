import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getUserIdAndRole(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) return { userId: null, role: null };
  const { data } = await supabase.from("users_profile").select("role").eq("id", authUser.user.id).single();
  return { userId: authUser.user.id, role: data?.role ?? null };
}

/**
 * GET /api/orders/[id]/payment-codes
 * Récupère les codes de paiement Orange Money pour une commande
 * 
 * Retourne:
 * - pay_token: Token de paiement (obtenu lors de l'initiation)
 * - notif_token: Token de notification (obtenu lors de l'initiation)
 * - txnid: ID de transaction Orange Money (obtenu après le paiement via webhook)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = createSupabaseFromRequest(req);
  const { userId, role } = await getUserIdAndRole(supabase);
  
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id: orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "ID de commande requis" }, { status: 400 });
  }

  // Récupérer la commande
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, payment_method, payment_reference, status")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  // Vérifier que l'utilisateur a le droit d'accéder à cette commande
  if (role !== "admin" && order.user_id !== userId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // Vérifier que c'est une commande Orange Money
  if (order.payment_method !== "orange_money") {
    return NextResponse.json({ 
      error: "Cette commande n'utilise pas Orange Money",
      payment_method: order.payment_method 
    }, { status: 400 });
  }

  // Parser les codes de paiement depuis payment_reference
  let paymentCodes = {
    pay_token: null as string | null,
    notif_token: null as string | null,
    txnid: null as string | null,
  };

  if (order.payment_reference) {
    try {
      const paymentData = typeof order.payment_reference === "string" 
        ? JSON.parse(order.payment_reference)
        : order.payment_reference;
      
      paymentCodes = {
        pay_token: paymentData.pay_token || null,
        notif_token: paymentData.notif_token || null,
        txnid: paymentData.txnid || null,
      };
    } catch (parseError) {
      console.error("Erreur parsing payment_reference:", parseError);
      // Si le parsing échoue, paymentCodes reste avec des valeurs null
    }
  }

  return NextResponse.json({
    order_id: order.id,
    status: order.status,
    payment_method: order.payment_method,
    codes: paymentCodes,
    // Informations sur chaque code
    info: {
      pay_token: {
        description: "Token de paiement obtenu lors de l'initiation du paiement",
        usage: "Utilisé pour vérifier le statut du paiement via l'API Orange Money",
        obtained_at: "Lors de l'appel à /api/payments/orange-money/initiate",
      },
      notif_token: {
        description: "Token de notification pour vérifier l'authenticité des webhooks",
        usage: "Comparé avec le token reçu dans les notifications Orange Money",
        obtained_at: "Lors de l'appel à /api/payments/orange-money/initiate",
      },
      txnid: {
        description: "ID de transaction Orange Money",
        usage: "Identifiant unique de la transaction chez Orange Money",
        obtained_at: "Lors de la réception du webhook après le paiement",
      },
    },
  });
}

