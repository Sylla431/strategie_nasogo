import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getProfileRole(
  supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"],
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (error) return null;
  return typeof data?.role === "string" ? data.role.trim().toLowerCase() : null;
}

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("course_access")
    .select("*, courses(*, course_videos(*))")
    .eq("user_id", authData.user.id)
    .order("granted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  
  // Vérifier l'authentification
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier le rôle
  const role = await getProfileRole(supabase);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Accès admin requis" }, { status: 403 });
  }

  const { email, course_id } = await req.json();
  if (!email || !course_id) {
    return NextResponse.json({ error: "email et course_id requis" }, { status: 400 });
  }

  // Trouver l'utilisateur par email dans auth.users via fonction SQL
  const { data: userIdData, error: findError } = await supabase.rpc("find_user_by_email", {
    user_email: email.toLowerCase().trim(),
  });

  if (findError) {
    return NextResponse.json({ error: `Erreur recherche utilisateur: ${findError.message}` }, { status: 400 });
  }

  const userId = userIdData as string | null;
  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non trouvé avec cet email" }, { status: 404 });
  }

  // Vérifier que le profil existe, sinon le créer
  const { error: profileCheckError } = await supabase
    .from("users_profile")
    .upsert({ id: userId, email: email.toLowerCase().trim(), role: "client" }, { onConflict: "id" });

  if (profileCheckError && profileCheckError.code !== "23505") {
    console.error("Error ensuring profile exists:", profileCheckError);
    // Ne pas bloquer si le profil existe déjà, mais continuer
  }

  // Obtenir l'ID de l'admin qui accorde l'accès
  const grantedBy = authData.user.id;

  // Utiliser la fonction SQL qui contourne RLS
  const { data: accessData, error: accessError } = await supabase.rpc("grant_course_access", {
    p_user_id: userId,
    p_course_id: course_id,
    p_granted_by: grantedBy,
  });

  if (accessError) {
    console.error("Error granting course access:", accessError);
    // Si l'erreur indique que l'utilisateur n'est pas admin
    if (accessError.message?.includes("admin")) {
      return NextResponse.json({ error: "Seuls les admins peuvent accorder l'accès" }, { status: 403 });
    }
    return NextResponse.json({ 
      error: accessError.message || "Erreur lors de l'attribution de l'accès",
      code: accessError.code,
    }, { status: 400 });
  }

  if (!accessData) {
    return NextResponse.json({ error: "L'utilisateur a déjà accès à ce cours" }, { status: 409 });
  }

  // Récupérer les données complètes avec le cours
  const { data: fullData, error: fetchError } = await supabase
    .from("course_access")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .single();

  if (fetchError) {
    // Si on ne peut pas récupérer les données complètes, retourner au moins les données de base
    return NextResponse.json(accessData, { status: 201 });
  }

  return NextResponse.json(fullData, { status: 201 });
}

