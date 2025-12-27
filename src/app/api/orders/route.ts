import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getUserIdAndRole(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) return { userId: null, role: null };
  const { data } = await supabase.from("users_profile").select("role, email, full_name, phone").eq("id", authUser.user.id).single();
  return { userId: authUser.user.id, role: data?.role ?? null };
}

// GET /api/orders -> orders for current user
export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { userId, role } = await getUserIdAndRole(supabase);
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const query = supabase
    .from("orders")
    .select(`
      *,
      courses(*, course_videos(*)),
      users_profile(*)
    `)
    .order("created_at", { ascending: false });
  const { data, error } = role === "admin" ? await query : await query.eq("user_id", userId);
  if (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Enrichir les données : récupérer les emails depuis auth.users si manquants
  if (data && Array.isArray(data)) {
    const enrichedData = await Promise.all(
      data.map(async (order) => {
        if (order.users_profile && !order.users_profile.email && order.user_id) {
          // Vérifier que user_id est valide avant d'appeler la fonction
          if (!order.user_id || typeof order.user_id !== "string") {
            console.log("Invalid user_id:", order.user_id);
            return order;
          }
          
          // Récupérer l'email depuis auth.users via fonction SQL
          try {
            const { data: emailData, error: emailError } = await supabase.rpc("get_user_email", {
              user_id: order.user_id,
            });
            if (!emailError && emailData) {
              order.users_profile.email = emailData;
              // Mettre à jour users_profile avec l'email pour les prochaines fois
              try {
                await supabase
                  .from("users_profile")
                  .update({ email: emailData })
                  .eq("id", order.user_id);
              } catch (updateErr) {
                // Ignore les erreurs de mise à jour
                console.log("Error updating user profile email:", updateErr);
              }
            }
          } catch (err) {
            console.log(`Error fetching email for user ${order.user_id}:`, err);
          }
        }
        return order;
      })
    );
    return NextResponse.json(enrichedData);
  }

  return NextResponse.json(data);
}

// POST /api/orders { courseId, payment_method? } -> create pending order
export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { userId } = await getUserIdAndRole(supabase);
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { courseId, payment_method = "cash" } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requis" }, { status: 400 });

  // Valider le payment_method
  if (payment_method !== "cash" && payment_method !== "orange_money") {
    return NextResponse.json({ error: "payment_method invalide" }, { status: 400 });
  }

  // Vérifier si l'utilisateur a déjà une commande payée pour ce cours
  const { data: existingPaidOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "paid")
    .single();

  if (existingPaidOrder) {
    return NextResponse.json({ 
      error: "Vous avez déjà payé pour ce cours",
      already_paid: true 
    }, { status: 400 });
  }

  // Mettre en "failed" les anciennes commandes en "pending" pour ce cours et cet utilisateur
  // Cela permet de marquer les tentatives précédentes qui ont échoué
  const { error: updateOldOrdersError } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "pending");

  if (updateOldOrdersError) {
    console.error("Erreur lors de la mise à jour des anciennes commandes:", updateOldOrdersError);
    // On continue quand même, ce n'est pas bloquant
  }

  // Créer la nouvelle commande
  const { data: order, error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, course_id: courseId, payment_method, status: "pending" }])
    .select("*")
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Si c'est Orange Money, initier le paiement et retourner l'URL de redirection
  if (payment_method === "orange_money") {
    try {
      const initiateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/orange-money/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers.get("Authorization") || "",
        },
        body: JSON.stringify({ orderId: order.id, courseId }),
      });

      if (!initiateRes.ok) {
        const errorData = await initiateRes.json().catch(() => ({}));
        // On retourne quand même la commande créée, mais avec une erreur
        return NextResponse.json({
          ...order,
          payment_initiation_error: errorData.error || "Erreur lors de l'initiation du paiement",
        }, { status: 201 });
      }

      const { payment_url, pay_token, notif_token } = await initiateRes.json();
      return NextResponse.json({
        ...order,
        payment_url,
        pay_token,
        notif_token,
        redirect_required: true,
      }, { status: 201 });
    } catch (error) {
      console.error("Error initiating Orange Money payment:", error);
      // On retourne quand même la commande créée
      return NextResponse.json({
        ...order,
        payment_initiation_error: "Erreur lors de l'initiation du paiement",
      }, { status: 201 });
    }
  }

  // Pour cash, retourner simplement la commande
  return NextResponse.json(order, { status: 201 });
}

