import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase env vars manquants");
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const token = authHeader.slice("Bearer ".length);
    
    // Vérifier le rôle admin
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client non initialisé" },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabaseAdmin
      .from("users_profile")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès refusé. Seuls les admins peuvent exporter les emails." },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs
    const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (allUsersError) {
      return NextResponse.json(
        { error: `Erreur lors de la récupération des utilisateurs: ${allUsersError.message}` },
        { status: 500 }
      );
    }

    // Extraire les emails
    const emails = (allUsers?.users ?? [])
      .map((u) => u.email)
      .filter((email): email is string => !!email && email.length > 0);

    // Format pour Resend (liste séparée par des virgules)
    const emailsList = emails.join(", ");
    
    // Format CSV pour téléchargement
    const csvContent = `Email,Name\n${emails.map((email, index) => {
      const user = allUsers?.users[index];
      const name = user?.user_metadata?.full_name || "";
      return `${email},"${name}"`;
    }).join("\n")}`;

    // Retourner les données
    return NextResponse.json({
      success: true,
      total: emails.length,
      emails: emailsList,
      csv: csvContent,
      emailsArray: emails, // Pour utilisation programmatique
    });
  } catch (error) {
    console.error("Erreur lors de l'export des emails:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'export des emails",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

