import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function requireAdmin(req: NextRequest) {
  if (!supabaseAdmin) {
    return { error: NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 }) };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return { error: null };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
    }

    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    const users = usersData?.users ?? [];
    let syncedCount = 0;

    for (const user of users) {
      const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
      const phone = (user.user_metadata?.phone as string | undefined) ?? null;

      const { error: upsertError } = await supabaseAdmin.from("users_profile").upsert({
        id: user.id,
        role: "client",
        full_name: fullName,
        phone,
      });

      if (!upsertError) {
        syncedCount += 1;
      }
    }

    return NextResponse.json({
      success: true,
      total_users: users.length,
      synced_profiles: syncedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

