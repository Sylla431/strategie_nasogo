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
    .select("*, courses(*)")
    .eq("user_id", authData.user.id)
    .order("granted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getProfileRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
    .upsert({ id: userId, email: email.toLowerCase().trim() }, { onConflict: "id" });

  if (profileCheckError && profileCheckError.code !== "23505") {
    console.error("Error ensuring profile exists:", profileCheckError);
  }

  // Obtenir l'ID de l'admin qui accorde l'accès
  const { data: authData } = await supabase.auth.getUser();
  const grantedBy = authData?.user?.id ?? null;

  // Créer l'accès
  const { data, error } = await supabase
    .from("course_access")
    .insert([{ user_id: userId, course_id, granted_by: grantedBy }])
    .select("*, courses(*)")
    .single();

  if (error) {
    // Si l'erreur est une violation de contrainte unique, l'accès existe déjà
    if (error.code === "23505") {
      return NextResponse.json({ error: "L'utilisateur a déjà accès à ce cours" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

