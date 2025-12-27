import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Si erreur, rediriger vers la page d'authentification avec le message d'erreur
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }

  // Si pas de code, rediriger vers la page d'authentification sans message
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth", requestUrl.origin)
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
        requestUrl.origin
      )
    );
  }

  // Vérifier si l'email a été confirmé
  if (data.user && data.session) {
    // L'email est confirmé, rediriger vers la page d'authentification avec un message de succès
    // L'utilisateur devra se connecter avec ses identifiants
    return NextResponse.redirect(
      new URL(
        "/auth?message=Votre email a été confirmé avec succès. Vous pouvez maintenant vous connecter.",
        requestUrl.origin
      )
    );
  }

  // Si pas de session, rediriger vers la page d'authentification
  return NextResponse.redirect(
    new URL(
      "/auth?error=Erreur lors de la confirmation de l'email",
      requestUrl.origin
    )
  );
}

