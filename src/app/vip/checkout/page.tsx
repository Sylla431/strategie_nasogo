"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { VIP_ADHESION_AMOUNT, VIP_RENEWAL_AMOUNT } from "@/lib/telegram/pricing";

function VipCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [kindLabel, setKindLabel] = useState<string>("");

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session?.access_token) {
          const next = encodeURIComponent("/vip/checkout");
          router.replace(`/auth?next=${next}`);
          return;
        }

        setStatus("redirecting");
        const res = await fetch("/api/telegram/vip/checkout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Impossible d'initier le paiement VIP");
        }

        if (data.kind === "adhesion") {
          setKindLabel(`Adhésion — ${VIP_ADHESION_AMOUNT.toLocaleString("fr-FR")} F CFA`);
        } else {
          setKindLabel(`Renouvellement — ${VIP_RENEWAL_AMOUNT.toLocaleString("fr-FR")} F CFA`);
        }

        if (!data.payment_url) {
          throw new Error("URL de paiement manquante");
        }

        window.location.href = data.payment_url;
      } catch (err) {
        console.error("VIP checkout error:", err);
        setError(err instanceof Error ? err.message : "Erreur de paiement");
        setStatus("error");
      }
    };

    void startCheckout();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-amber-50 to-white">
      <div className="w-full max-w-md space-y-5 bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">VIP Telegram</p>
          <h1 className="text-2xl font-bold text-neutral-900">Paiement canal signaux</h1>
          {kindLabel && <p className="text-sm text-neutral-600">{kindLabel}</p>}
        </div>

        {status === "loading" || status === "redirecting" ? (
          <p className="text-center text-neutral-600 text-sm">
            {status === "redirecting"
              ? "Redirection vers Moneroo…"
              : "Préparation du paiement…"}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="button-primary w-full"
                onClick={() => {
                  setError(null);
                  setStatus("loading");
                  window.location.reload();
                }}
              >
                Réessayer
              </button>
              <Link href="/client" className="button-secondary w-full text-center">
                Espace client
              </Link>
              <Link href="/" className="pill-neutral w-full text-center py-2">
                Accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VipCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <p className="text-neutral-600">Chargement…</p>
        </div>
      }
    >
      <VipCheckoutContent />
    </Suspense>
  );
}
