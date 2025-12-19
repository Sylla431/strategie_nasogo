import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getUserRole(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return null;
  const { data } = await supabase.from("users_profile").select("role").eq("id", authUser.user.id).single();
  return data?.role ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getUserRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Résoudre params si c'est une Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const orderId = resolvedParams.id;

  if (!orderId) {
    return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
  }

  // Récupérer l'order avec user_id et course_id
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("user_id, course_id")
    .eq("id", orderId)
    .single();
  
  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || "Commande non trouvée" }, { status: 400 });
  }

  if (!order.user_id || !order.course_id) {
    return NextResponse.json({ error: "Données de commande invalides (user_id ou course_id manquant)" }, { status: 400 });
  }

  // Marquer comme payé
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("*")
    .single();
  
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Accorder automatiquement l'accès au cours
  const { data: authData } = await supabase.auth.getUser();
  const grantedBy = authData?.user?.id || null;

  // Vérifier que les UUIDs sont valides avant insertion
  if (!order.user_id || !order.course_id) {
    console.error("Missing user_id or course_id:", { user_id: order.user_id, course_id: order.course_id });
    return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 });
  }

  const { data: accessData, error: accessError } = await supabase
    .from("course_access")
    .insert([{ 
      user_id: order.user_id, 
      course_id: order.course_id, 
      granted_by: grantedBy || null
    }])
    .select()
    .single();

  // Si l'accès existe déjà (erreur 23505 = violation contrainte unique), c'est OK
  if (accessError && accessError.code !== "23505") {
    console.error("Erreur création accès:", accessError);
    // On continue quand même car le paiement est validé, mais on log l'erreur
  }

  // Retourner les données avec confirmation de l'accès
  return NextResponse.json({
    ...updatedOrder,
    access_granted: accessError?.code === "23505" ? "already_exists" : accessData ? "created" : "error",
  });
}

