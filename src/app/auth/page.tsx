"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "register" | "forgot-password";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Préremplir l'email depuis l'URL et basculer vers l'onglet inscription
  // Afficher les messages d'erreur et de succès depuis l'URL
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setMode("register");
    }

    // Afficher les messages depuis l'URL (pour les callbacks)
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  const ensureProfile = async (userId: string, fullNameValue?: string, phoneValue?: string) => {
    try {
      // Le trigger handle_new_user crée automatiquement le profil
      // On essaie juste de mettre à jour les métadonnées si nécessaire
      const { error } = await supabase.from("users_profile").upsert({
        id: userId,
        email: email || null,
        full_name: fullNameValue || null,
        phone: phoneValue || null,
      }, {
        onConflict: "id",
      });
      // Ignore les erreurs de contrainte unique (23505) et les erreurs si le profil n'existe pas encore
      if (error && error.code !== "23505" && error.code !== "PGRST116") {
        console.error("Error ensuring profile:", error);
      }
    } catch (err) {
      // Ignore les erreurs, le trigger devrait créer le profil
      console.log("Profile update skipped:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          // Vérifier si l'erreur est due à un email non confirmé
          if (err.message?.includes("email not confirmed") || err.message?.includes("Email not confirmed")) {
            setError("Votre email n'a pas encore été confirmé. Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.");
          } else {
            throw err;
          }
          return;
        }
        const userId = data.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await ensureProfile(userId);
        }
        setMessage("Connexion réussie.");
        router.push("/client");
      } else if (mode === "forgot-password") {
        console.log("Requesting password reset for email:", email);
        // Utiliser NEXT_PUBLIC_APP_URL si disponible, sinon window.location.origin
        // Note: NEXT_PUBLIC_APP_URL est injectée au build time et accessible côté client
        const appUrl = typeof window !== "undefined" 
          ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
          : (process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com");
        const redirectUrl = `${appUrl}/auth/reset-password`;
        const { data, error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        
        console.log("Reset password response:", { data, error: err });
        
        if (err) {
          console.error("Reset password error:", err);
          console.error("Error details:", {
            message: err.message,
            status: err.status,
            name: err.name,
          });
          
          // Erreur 504 = timeout (connexion SMTP échoue ou prend trop de temps)
          if (err.status === 504 || err.name === "AuthRetryableFetchError") {
            setError(
              "Timeout lors de la connexion au serveur email. " +
              "Vérifiez la configuration SMTP dans Supabase :\n" +
              "- Host SMTP correct (mail.votre-domaine.com)\n" +
              "- Port correct (465 pour SSL ou 587 pour STARTTLS)\n" +
              "- Identifiants corrects\n" +
              "- Firewall qui n'bloque pas la connexion\n\n" +
              "Consultez les logs Supabase (Dashboard > Logs > Auth) pour plus de détails."
            );
            setLoading(false);
            return;
          }
          
          // Erreur 500 = problème serveur (généralement configuration SMTP)
          if (err.status === 500 || err.message?.includes("Error sending recovery email") || err.message?.includes("sending") || err.message?.includes("SMTP")) {
            setError(
              "Erreur d'envoi d'email. Le service d'email n'est pas configuré correctement. " +
              "Vérifiez la configuration SMTP dans Supabase (Project Settings > Auth > SMTP Settings). " +
              "Consultez les logs Supabase pour plus de détails."
            );
            setLoading(false);
            return;
          }
          
          // Pour les autres erreurs, on affiche un message générique pour la sécurité
          // (pour éviter l'énumération d'emails)
          setResetEmailSent(true);
          setMessage("Si cet email existe dans notre système, un email de réinitialisation a été envoyé. Vérifie ta boîte de réception (y compris les spams).");
          return;
        }
        
        console.log("Password reset email sent successfully");
        setResetEmailSent(true);
        setMessage("Un email de réinitialisation a été envoyé. Vérifie ta boîte de réception (y compris les spams).");
      } else {
        // Construire l'URL de redirection pour la confirmation d'email
        const redirectUrl = typeof window !== "undefined" 
          ? `${window.location.origin}/auth/callback`
          : `${process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com"}/auth/callback`;

        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName || null,
              phone: phone || null,
            },
          },
        });
        if (err) throw err;
        
        // Le trigger handle_new_user créera automatiquement le profil
        // On attend un peu pour laisser le trigger s'exécuter, puis on met à jour les métadonnées
        if (data.user?.id) {
          // Attendre un peu pour laisser le trigger s'exécuter
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Mettre à jour les métadonnées (full_name, phone) si le trigger ne les a pas encore prises
          await ensureProfile(data.user.id, fullName, phone);
          
          // Ajouter le contact à Resend (en arrière-plan, ne pas bloquer l'inscription)
          if (email) {
            fetch("/api/resend/add-contact", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
                fullName: fullName || null,
                phone: phone || null,
              }),
            }).catch((error) => {
              // Ne pas bloquer l'inscription si l'ajout à Resend échoue
              console.error("Erreur lors de l'ajout du contact à Resend:", error);
            });
          }
        }
        
        // Vérifier si l'email doit être confirmé
        if (data.user && !data.session) {
          // L'utilisateur existe mais n'a pas de session = email non confirmé
          setMessage("Un email de confirmation a été envoyé. Vérifie ta boîte de réception (y compris les spams) et clique sur le lien pour confirmer ton compte avant de te connecter.");
        } else {
          // L'utilisateur a une session = email déjà confirmé ou confirmation désactivée
          setMessage("Compte créé avec succès !");
        setMode("login");
        }
      }
    } catch (err) {
      const e = err as { message?: string; code?: string };
      // Messages d'erreur plus clairs
      if (mode === "forgot-password") {
        // Pour la réinitialisation, on ne révèle pas si l'email existe
        setResetEmailSent(true);
        setMessage("Si cet email existe dans notre système, un email de réinitialisation a été envoyé. Vérifie ta boîte de réception.");
      } else if (e.code === "23505") {
        setError("Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.");
      } else if (e.message?.includes("email") && mode === "register") {
        setError("Erreur avec l'email. Vérifie qu'il n'est pas déjà utilisé.");
      } else if (e.message?.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(e.message ?? (mode === "login" ? "Erreur lors de la connexion. Réessaie." : "Erreur lors de l'inscription. Réessaie."));
      }
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {mode === "login"
              ? "Connexion"
              : mode === "forgot-password"
              ? "Mot de passe oublié"
              : "Créer un compte"}
          </h1>
          <Link href="/" className="text-sm text-brand">
            Retour à l&apos;accueil
          </Link>
        </div>
        {mode !== "forgot-password" && (
        <div className="flex gap-2">
          <button
            type="button"
            className={`pill-neutral ${mode === "login" ? "border border-brand bg-[rgba(212,175,55,0.12)]" : ""}`}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`pill-neutral ${mode === "register" ? "border border-brand bg-[rgba(212,175,55,0.12)]" : ""}`}
            onClick={() => setMode("register")}
          >
            Inscription
          </button>
        </div>
        )}

        {resetEmailSent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                Vérifie ta boîte de réception et clique sur le lien pour réinitialiser ton mot de passe.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary w-full"
              onClick={() => {
                setMode("login");
                setResetEmailSent(false);
                setEmail("");
              }}
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nom complet</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Mamadou Sylla"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Téléphone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+223..."
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
            {mode !== "forgot-password" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Mot de passe</label>
            <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
              required
              minLength={6}
                className="form-control pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
            )}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-sm text-brand hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          <button type="submit" className="button-primary w-full cta-pulse" disabled={loading}>
              {loading
                ? "..."
                : mode === "login"
                ? "Se connecter"
                : mode === "forgot-password"
                ? "Envoyer l'email de réinitialisation"
                : "Créer mon compte"}
            </button>
            {mode === "forgot-password" && (
              <button
                type="button"
                className="button-secondary w-full"
                onClick={() => setMode("login")}
              >
                Retour à la connexion
          </button>
            )}
        </form>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Chargement...</h1>
            <Link href="/" className="text-sm text-brand">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}

