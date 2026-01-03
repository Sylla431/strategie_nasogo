import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Construire l'URL de base de manière fiable (pour Vercel)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  // Si erreur, rediriger vers la page d'authentification avec le message d'erreur
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, baseUrl)
    );
  }

  // Si pas de code, rediriger vers la page d'authentification sans message
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth", baseUrl)
    );
  }

  // Échanger le code contre une session
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Erreur lors de l'échange du code:", exchangeError);
    return NextResponse.redirect(
      new URL(
        `/auth?error=${encodeURIComponent(exchangeError.message)}`,
        baseUrl
      )
    );
  }

  // Vérifier si l'échange a réussi et si l'email est confirmé
  if (data.user && data.session) {
    // Vérifier explicitement si l'email est confirmé
    const isEmailConfirmed = data.user.email_confirmed_at !== null && data.user.email_confirmed_at !== undefined;
    
    console.log("Email confirmation status:", {
      userId: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at,
      isEmailConfirmed,
    });

    if (isEmailConfirmed) {
      // L'email est confirmé, rediriger vers la page d'authentification avec un message de succès
      // L'utilisateur devra se connecter avec ses identifiants
      return NextResponse.redirect(
        new URL(
          "/auth?message=Votre email a été confirmé avec succès. Vous pouvez maintenant vous connecter.",
          baseUrl
        )
      );
    } else {
      // L'échange a réussi mais l'email n'est pas confirmé (cas rare)
      console.warn("Échange réussi mais email non confirmé:", data.user);
      return NextResponse.redirect(
        new URL(
          "/auth?error=L'email n'a pas pu être confirmé. Veuillez réessayer ou contacter le support.",
          baseUrl
        )
      );
    }
  }

  // Si pas de session ou pas d'utilisateur, rediriger vers la page d'authentification
  console.error("Échange réussi mais pas de session ou utilisateur:", { hasUser: !!data.user, hasSession: !!data.session });
  return NextResponse.redirect(
    new URL(
      "/auth?error=Erreur lors de la confirmation de l'email. Veuillez réessayer.",
      baseUrl
    )
  );
}

