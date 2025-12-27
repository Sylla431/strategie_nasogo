"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<"paid" | "pending" | "failed" | null>(null);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth");
          return;
        }

        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const orders = await res.json();
          type Order = {
            id: string;
            status: string;
          };
          const order = orders.find((o: Order) => o.id === orderId);
          if (order) {
            setOrderStatus(order.status);
          }
        }
      } catch (error) {
        console.error("Error checking order status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-neutral-50 to-white">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            orderStatus === "failed" 
              ? "bg-red-100" 
              : "bg-green-100"
          }`}>
            {orderStatus === "failed" ? (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            {orderStatus === "failed" 
              ? "Paiement échoué" 
              : "Paiement réussi !"}
          </h1>
          <p className="text-neutral-600 mb-6">
            {loading
              ? "Vérification en cours..."
              : orderStatus === "paid"
              ? "Votre paiement a été confirmé. Vous avez maintenant accès au cours."
              : orderStatus === "failed"
              ? "Votre paiement n&apos;a pas pu être traité. Veuillez réessayer ou contacter le support si le problème persiste."
              : "Votre paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement validé."}
          </p>
        </div>

        {orderStatus === "paid" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 text-center">
              ✓ Accès au cours accordé automatiquement
            </p>
          </div>
        )}

        {orderStatus === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 text-center">
              ⚠️ Le paiement n&apos;a pas pu être validé. Vous pouvez réessayer en créant une nouvelle commande.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {orderStatus === "paid" ? (
            <>
              <Link
                href="/client"
                className="button-primary w-full text-center block"
              >
                Accéder à mes cours
              </Link>
              <Link
                href="/"
                className="button-secondary w-full text-center block"
              >
                Retour à l&apos;accueil
              </Link>
            </>
          ) : orderStatus === "failed" ? (
            <>
              <Link
                href="/"
                className="button-primary w-full text-center block"
              >
                Réessayer le paiement
              </Link>
              <Link
                href="/client"
                className="button-secondary w-full text-center block"
              >
                Voir mes commandes
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/client"
                className="button-primary w-full text-center block"
              >
                Accéder à mes cours
              </Link>
              <Link
                href="/"
                className="button-secondary w-full text-center block"
              >
                Retour à l&apos;accueil
              </Link>
            </>
          )}
        </div>

        {orderId && (
          <p className="text-xs text-neutral-500 text-center mt-4">
            Référence: {orderId.substring(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Chargement...</h1>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}


