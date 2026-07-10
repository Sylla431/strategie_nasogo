import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest, getAuthUserId } from "@/lib/supabaseServer";
import { initiateMonerooForOrder } from "@/lib/payments/initiateMoneroo";

async function getUserIdAndRole(
  supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"],
  token?: string
) {
  const userId = await getAuthUserId(supabase, token);
  if (!userId) return { userId: null, role: null };
  const { data } = await supabase.from("users_profile").select("role, email, full_name, phone").eq("id", userId).single();
  return { userId, role: data?.role ?? null };
}

// GET /api/orders -> orders for current user
export async function GET(req: NextRequest) {
  const { supabase, token } = createSupabaseFromRequest(req);
  const { userId, role } = await getUserIdAndRole(supabase, token);
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
          if (!order.user_id || typeof order.user_id !== "string") {
            console.log("Invalid user_id:", order.user_id);
            return order;
          }

          try {
            const { data: emailData, error: emailError } = await supabase.rpc("get_user_email", {
              user_id: order.user_id,
            });
            if (!emailError && emailData) {
              order.users_profile.email = emailData;
              try {
                await supabase
                  .from("users_profile")
                  .update({ email: emailData })
                  .eq("id", order.user_id);
              } catch (updateErr) {
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
  const { supabase, token } = createSupabaseFromRequest(req);
  const { userId } = await getUserIdAndRole(supabase, token);
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { courseId, payment_method = "cash" } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requis" }, { status: 400 });

  const validPaymentMethods = ["cash", "orange_money", "paytech", "moneroo"];
  if (!validPaymentMethods.includes(payment_method)) {
    return NextResponse.json({ error: "payment_method invalide" }, { status: 400 });
  }

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
      already_paid: true,
    }, { status: 400 });
  }

  const { error: updateOldOrdersError } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "pending");

  if (updateOldOrdersError) {
    console.error("Erreur lors de la mise à jour des anciennes commandes:", updateOldOrdersError);
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, course_id: courseId, payment_method, status: "pending" }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Moneroo: appel in-process (évite self-fetch HTTP qui perd le Bearer en prod)
  if (payment_method === "moneroo") {
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        req.nextUrl.origin ||
        "https://vbsniperacademie.com";

      const result = await initiateMonerooForOrder({
        supabase,
        userId,
        orderId: order.id,
        appUrl,
      });

      if (!result.ok) {
        return NextResponse.json({
          ...order,
          payment_initiation_error: result.error,
        }, { status: 201 });
      }

      return NextResponse.json({
        ...order,
        payment_url: result.payment_url,
        payment_id: result.payment_id,
        redirect_required: true,
      }, { status: 201 });
    } catch (error) {
      console.error("Error initiating moneroo payment:", error);
      return NextResponse.json({
        ...order,
        payment_initiation_error: "Erreur lors de l'initiation du paiement",
      }, { status: 201 });
    }
  }

  // Orange Money / PayTech: self-fetch via origin de la requête (pas localhost)
  if (payment_method === "orange_money" || payment_method === "paytech") {
    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        req.nextUrl.origin ||
        "https://vbsniperacademie.com"
      ).replace(/\/$/, "");

      const endpoint =
        payment_method === "orange_money"
          ? `${baseUrl}/api/payments/orange-money/initiate`
          : `${baseUrl}/api/payments/paytech/initiate`;

      const authHeader =
        req.headers.get("authorization") ||
        req.headers.get("Authorization") ||
        (token ? `Bearer ${token}` : "");

      const initiateRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ orderId: order.id, courseId }),
      });

      if (!initiateRes.ok) {
        const errorData = await initiateRes.json().catch(() => ({}));
        return NextResponse.json({
          ...order,
          payment_initiation_error: errorData.error || "Erreur lors de l'initiation du paiement",
        }, { status: 201 });
      }

      const responseData = await initiateRes.json();
      const payment_url = responseData.payment_url || responseData.redirectUrl;

      return NextResponse.json({
        ...order,
        payment_url,
        payment_id: responseData.payment_id,
        pay_token: responseData.pay_token,
        notif_token: responseData.notif_token,
        redirect_required: true,
      }, { status: 201 });
    } catch (error) {
      console.error(`Error initiating ${payment_method} payment:`, error);
      return NextResponse.json({
        ...order,
        payment_initiation_error: "Erreur lors de l'initiation du paiement",
      }, { status: 201 });
    }
  }

  return NextResponse.json(order, { status: 201 });
}
