"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-neutral-50 to-white">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
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
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-neutral-600 mb-6">
            Votre paiement a été annulé. Aucun montant n&apos;a été débité.
            Vous pouvez réessayer à tout moment.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800 text-center">
            Votre commande reste en attente. Vous pouvez compléter le paiement plus tard.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/client"
            className="button-primary w-full text-center block"
          >
            Voir mes commandes
          </Link>
          <Link
            href="/"
            className="button-secondary w-full text-center block"
          >
            Retour à l&apos;accueil
          </Link>
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

export default function PaymentCancelPage() {
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
      <PaymentCancelContent />
    </Suspense>
  );
}


