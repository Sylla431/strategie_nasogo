import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminUser = {
  id: string;
};

export async function requireAdmin(
  req: NextRequest,
): Promise<{ user: AdminUser | null; error: NextResponse | null }> {
  if (!supabaseAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 }),
    };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { user: null, error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return { user: { id: user.id }, error: null };
}
