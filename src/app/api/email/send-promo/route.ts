import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getPromoEndingEmailTemplate } from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase env vars manquants");
}

// Client Supabase avec service role pour bypass RLS
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(req: NextRequest) {
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
    const { data: { user }, error: userError } = await supabaseAdmin?.auth.getUser(token) ?? { data: { user: null }, error: null };
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabaseAdmin
      ?.from("users_profile")
      .select("role")
      .eq("id", user.id)
      .maybeSingle() ?? { data: null };

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès refusé. Seuls les admins peuvent envoyer des emails." },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const body = await req.json();
    const {
      promoEndDate,
      promoPrice,
      originalPrice,
      productName,
      productUrl,
      testEmail, // Optionnel : pour tester avec un seul email
    } = body;

    // Validation
    if (!promoEndDate || !promoPrice || !originalPrice || !productName || !productUrl) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY non configurée" },
        { status: 500 }
      );
    }

    // Récupérer tous les utilisateurs inscrits
    let users: Array<{ email: string; full_name?: string | null }> = [];

    if (testEmail) {
      // Mode test : envoyer à un seul email
      users = [{ email: testEmail, full_name: null }];
    } else {
      // Récupérer tous les utilisateurs via l'API admin de Supabase
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Supabase admin client non initialisé" },
          { status: 500 }
        );
      }

      try {
        const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers();

        if (allUsersError) {
          return NextResponse.json(
            { error: `Erreur lors de la récupération des utilisateurs: ${allUsersError.message}` },
            { status: 500 }
          );
        }

        users = (allUsers?.users ?? [])
          .map((u) => ({
            email: u.email ?? "",
            full_name: u.user_metadata?.full_name ?? null,
          }))
          .filter((u) => u.email && u.email.length > 0);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        return NextResponse.json(
          {
            error: "Erreur lors de la récupération des utilisateurs",
            details: err instanceof Error ? err.message : "Erreur inconnue",
          },
          { status: 500 }
        );
      }
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "VB Sniper Académie <support@vbsniperacademie.com>";

    // Préparer les emails
    const emailPromises = users.map(async (user) => {
      const template = getPromoEndingEmailTemplate({
        userName: user.full_name || undefined,
        promoEndDate,
        promoPrice,
        originalPrice,
        productName,
        productUrl,
        siteUrl,
      });

      try {
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (error) {
          console.error(`Erreur envoi email à ${user.email}:`, error);
          return { email: user.email, success: false, error: error.message };
        }

        return { email: user.email, success: true, id: data?.id };
      } catch (err) {
        console.error(`Erreur envoi email à ${user.email}:`, err);
        return {
          email: user.email,
          success: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
        };
      }
    });

    // Envoyer tous les emails
    const results = await Promise.all(emailPromises);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Emails envoyés: ${successCount} réussis, ${failureCount} échoués`,
      total: users.length,
      successCount,
      failureCount,
      results: testEmail ? results : undefined, // Détails seulement en mode test
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi des emails",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

