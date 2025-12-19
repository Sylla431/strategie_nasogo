"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "register";

export default function AuthPage() {
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

  // Préremplir l'email depuis l'URL et basculer vers l'onglet inscription
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setMode("register");
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
        if (err) throw err;
        const userId = data.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await ensureProfile(userId);
        }
        setMessage("Connexion réussie.");
        router.push("/client");
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
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
        }
        
        setMessage("Compte créé. Vérifie tes emails si la confirmation est activée.");
        setMode("login");
      }
    } catch (err) {
      const e = err as { message?: string; code?: string };
      // Messages d'erreur plus clairs
      if (e.code === "23505") {
        setError("Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.");
      } else if (e.message?.includes("email")) {
        setError("Erreur avec l'email. Vérifie qu'il n'est pas déjà utilisé.");
      } else {
        setError(e.message ?? "Erreur lors de l'inscription. Réessaie.");
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
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>
          <Link href="/" className="text-sm text-brand">
            Retour à l&apos;accueil
          </Link>
        </div>
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
          <div className="space-y-2">
            <label className="text-sm font-semibold">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="button-primary w-full cta-pulse" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}

