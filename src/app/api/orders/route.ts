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

// POST /api/orders { courseId } -> create pending cash order
export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { userId } = await getUserIdAndRole(supabase);
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId requis" }, { status: 400 });

  const { data, error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, course_id: courseId, payment_method: "cash", status: "pending" }])
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

