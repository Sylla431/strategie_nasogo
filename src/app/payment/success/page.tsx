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
  const [isVip, setIsVip] = useState(false);
  const orderId = searchParams.get("order_id");
  const vipPaymentId = searchParams.get("vip_payment_id");
  const paymentStatus = searchParams.get("paymentStatus");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    const checkStatus = async () => {
      if (!orderId && !vipPaymentId) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          const next = encodeURIComponent(
            `/payment/success?${vipPaymentId ? `vip_payment_id=${vipPaymentId}` : `order_id=${orderId}`}${
              paymentId ? `&paymentId=${paymentId}` : ""
            }`
          );
          router.push(`/auth?next=${next}`);
          return;
        }

        if (vipPaymentId) {
          setIsVip(true);
          try {
            const confirmRes = await fetch("/api/payments/moneroo/confirm", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ vipPaymentId, paymentId }),
            });
            if (confirmRes.ok) {
              const confirmData = await confirmRes.json();
              if (confirmData.status === "paid" || confirmData.status === "failed") {
                setOrderStatus(confirmData.status);
                setLoading(false);
                return;
              }
              setOrderStatus(confirmData.status === "pending" ? "pending" : null);
            } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
              setOrderStatus("failed");
            } else {
              setOrderStatus("pending");
            }
          } catch (confirmError) {
            console.error("Error confirming VIP payment:", confirmError);
            if (paymentStatus === "failed" || paymentStatus === "cancelled") {
              setOrderStatus("failed");
            }
          } finally {
            setLoading(false);
          }
          return;
        }

        if (paymentId || paymentStatus === "success") {
          try {
            const confirmRes = await fetch("/api/payments/moneroo/confirm", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderId, paymentId }),
            });
            if (confirmRes.ok) {
              const confirmData = await confirmRes.json();
              if (confirmData.product === "telegram_vip") {
                setIsVip(true);
              }
              if (confirmData.status === "paid" || confirmData.status === "failed") {
                setOrderStatus(confirmData.status);
                setLoading(false);
                return;
              }
            }
          } catch (confirmError) {
            console.error("Error confirming Moneroo payment:", confirmError);
          }
        }

        if (paymentStatus === "failed" || paymentStatus === "cancelled") {
          setOrderStatus("failed");
        }

        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const orders = await res.json();
          type Order = { id: string; status: string };
          const order = orders.find((o: Order) => o.id === orderId);
          if (order) {
            setOrderStatus(order.status as "paid" | "pending" | "failed");
          } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
            setOrderStatus("failed");
          }
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        if (paymentStatus === "failed" || paymentStatus === "cancelled") {
          setOrderStatus("failed");
        }
      } finally {
        setLoading(false);
      }
    };

    void checkStatus();
  }, [orderId, vipPaymentId, paymentStatus, paymentId, router]);

  const paidMessage = isVip
    ? "Abonnement VIP activé. Vous pouvez rejoindre le canal privé depuis votre espace client."
    : "Votre paiement a été confirmé. Vous avez maintenant accès au cours.";

  const paidBadge = isVip ? "✓ Abonnement VIP activé" : "✓ Accès au cours accordé automatiquement";

  const primaryPaidHref = "/client";
  const primaryPaidLabel = isVip ? "Espace client — VIP" : "Accéder à mes cours";

  const retryHref = isVip
    ? "/vip/checkout"
    : `/services/strategie-nasongon${orderId ? `?retry_order=${orderId}` : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-neutral-50 to-white">
      <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              orderStatus === "failed" ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {orderStatus === "failed" ? (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            {orderStatus === "failed" ? "Paiement échoué" : "Paiement réussi !"}
          </h1>
          <p className="text-neutral-600 mb-6">
            {loading
              ? "Vérification en cours..."
              : orderStatus === "paid"
                ? paidMessage
                : orderStatus === "failed"
                  ? "Votre paiement n'a pas pu être traité. Cela peut être dû à plusieurs raisons : fonds insuffisants, problème de connexion, ou annulation de votre part. Veuillez réessayer ou contacter le support si le problème persiste."
                  : "Votre paiement est en cours de traitement. Vous recevrez une confirmation une fois le paiement validé."}
          </p>
        </div>

        {orderStatus === "paid" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 text-center">{paidBadge}</p>
          </div>
        )}

        {orderStatus === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 space-y-2">
            <p className="text-sm text-red-800 text-center font-medium">
              ⚠️ Le paiement n&apos;a pas pu être validé
            </p>
            <p className="text-xs text-red-700 text-center">
              Vous pouvez réessayer. Si le problème persiste, contactez notre support.
            </p>
            {paymentId && (
              <p className="text-xs text-red-600 text-center mt-2">ID de transaction: {paymentId}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {orderStatus === "paid" ? (
            <>
              <Link href={primaryPaidHref} className="button-primary w-full text-center block">
                {primaryPaidLabel}
              </Link>
              <Link href="/" className="button-secondary w-full text-center block">
                Retour à l&apos;accueil
              </Link>
            </>
          ) : orderStatus === "failed" ? (
            <>
              <Link href={retryHref} className="button-primary w-full text-center block">
                Réessayer le paiement
              </Link>
              <Link href="/client" className="button-secondary w-full text-center block">
                Espace client
              </Link>
              <a
                href="https://wa.me/+22373695125"
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary w-full text-center block border-green-200 text-green-700 hover:bg-green-50"
              >
                Contacter le support
              </a>
            </>
          ) : (
            <>
              <Link href="/client" className="button-primary w-full text-center block">
                Espace client
              </Link>
              <Link href="/" className="button-secondary w-full text-center block">
                Retour à l&apos;accueil
              </Link>
            </>
          )}
        </div>

        {(orderId || vipPaymentId) && (
          <p className="text-xs text-neutral-500 text-center mt-4">
            Référence: {(vipPaymentId || orderId || "").substring(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900">Chargement...</h1>
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
