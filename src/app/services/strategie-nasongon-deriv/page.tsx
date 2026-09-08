"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ScrollReveal from "@/components/ScrollReveal";
import SiteHeader from "@/components/SiteHeader";

const store = {
  name: "VB Sniper Academie",
  description:
    "À travers mes divers programmes de formation et de coaching, j'accompagne des traders particuliers depuis 2022.",
  logoUrl: "/logo/logo.png",
  support: {
    whatsapp: "https://wa.me/+22373695125",
    email: "mailto:vbsnipergroupe@gmail.com",
    phone: "+223 73 69 51 25",
  },
};

const product = {
  id: "prd_nasongon_deriv",
  name: "Indices Synthétiques",
  cover: "/images/INDICES SYNTHÉTIQUES.jpg",
  description: "Indices Synthétiques",
  price: 74500,
  type: "Programme de formation",
  customCtaText: "Rejoindre le programme",
};

/** Trouve le cours Nasongon Deriv en DB (par titre, sinon par prix). */
function findNasongonDerivCourse(
  courses: Array<{ id: string; title?: string; price?: number }>
): { id: string; title?: string; price?: number } | undefined {
  const byTitle = courses.find((c) =>
    (c.title || "").toLowerCase().includes("deriv")
  );
  if (byTitle) return byTitle;

  const byPrice = courses.find((c) => Number(c.price) === product.price);
  if (byPrice) return byPrice;

  return undefined;
}

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} F CFA`;

export default function StrategieNasongonDerivPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionToken(data.session?.access_token ?? null);
      setUserId(data.session?.user?.id ?? null);
    };
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setSessionToken(null);
        setUserId(null);
        setHasPaidAccess(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkPaidAccess = async () => {
      if (!userId || !sessionToken) {
        setHasPaidAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      setIsCheckingAccess(true);
      try {
        const coursesRes = await fetch("/api/courses", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (!coursesRes.ok) {
          setHasPaidAccess(false);
          setIsCheckingAccess(false);
          return;
        }

        const courses = await coursesRes.json();
        const course = findNasongonDerivCourse(courses || []);
        if (!course) {
          setHasPaidAccess(false);
          setIsCheckingAccess(false);
          return;
        }

        const ordersRes = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          const hasPaidOrder = orders.some(
            (o: { course_id: string; status: string }) =>
              o.course_id === course.id && o.status === "paid"
          );

          const { data: accessData } = await supabase
            .from("course_access")
            .select("course_id")
            .eq("user_id", userId)
            .eq("course_id", course.id)
            .maybeSingle();

          setHasPaidAccess(hasPaidOrder || !!accessData);
        } else {
          setHasPaidAccess(false);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'accès:", err);
        setHasPaidAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkPaidAccess();
  }, [userId, sessionToken]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    const currentToken = currentSession?.access_token;
    const currentUserId = currentSession?.user?.id;

    if (!currentToken || !currentUserId) {
      router.push("/auth");
      return;
    }

    setSessionToken(currentToken);
    setUserId(currentUserId);

    if (!paymentInfo) {
      setError("Veuillez choisir un moyen de paiement.");
      return;
    }

    const paymentMethodMap: Record<string, string> = {
      "Orange Money": "moneroo",
    };

    const paymentMethodCode = paymentMethodMap[paymentInfo || ""];
    if (paymentMethodCode) {
      try {
        setSubmitted(true);
        setError(null);

        const coursesRes = await fetch("/api/courses", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (!coursesRes.ok) {
          throw new Error("Erreur lors de la récupération des cours");
        }

        const courses = await coursesRes.json();
        const course = findNasongonDerivCourse(courses || []);
        if (!course) {
          throw new Error("Cours Stratégie Nasongon Deriv introuvable");
        }

        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: course.id,
            payment_method: paymentMethodCode,
          }),
        });

        if (!orderRes.ok) {
          const errorData = await orderRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Erreur lors de la création de la commande");
        }

        const orderData = await orderRes.json();

        if (orderData.payment_url) {
          window.location.href = orderData.payment_url;
        } else if (orderData.payment_initiation_error) {
          setError(`Erreur: ${orderData.payment_initiation_error}`);
          setSubmitted(false);
        } else {
          router.push("/client");
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du traitement du paiement");
        setSubmitted(false);
      }
      return;
    }

    setError("Moyen de paiement non reconnu. Veuillez en choisir un autre.");
  };

  return (
    <div className="bg-transparent text-neutral-900">
      <SiteHeader />

      <main className="layout-shell py-10 md:py-14 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start pt-5">
          <ScrollReveal className="card overflow-hidden">
            <div className="relative h-[360px] w-full bg-dotted">
              <Image
                src={product.cover}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="pill-neutral text-xs sm:text-sm">{product.type}</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-neutral-900">
                  {product.name}
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl font-semibold text-brand">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal
            as="aside"
            id="checkout"
            translate={false}
            delayMs={150}
            className="card sticky top-20 sm:top-24 space-y-4 sm:space-y-5 p-4 sm:p-6 md:p-7"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-brand">
                  Offre VB SNIPER
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{formatPrice(product.price)}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 rounded-2xl bg-[rgba(212,175,55,0.08)] p-4 sm:p-5 border border-brand/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="badge-soft text-brand text-xs sm:text-sm">Paiement</span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-700">
                  Choisissez votre moyen de paiement
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[{ label: "Orange Money", enabled: true }].map((method) => (
                  <button
                    key={method.label}
                    type="button"
                    disabled={!method.enabled}
                    className={`pill-neutral text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all ${
                      !method.enabled
                        ? "opacity-60 cursor-not-allowed bg-neutral-100 text-neutral-500 border-neutral-200"
                        : paymentInfo === method.label
                          ? "bg-brand text-white border-brand shadow-md scale-105"
                          : "hover:bg-brand/10 hover:border-brand/40 cursor-pointer"
                    }`}
                    onClick={() => method.enabled && setPaymentInfo(method.label)}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
              {paymentInfo && (
                <div className="mt-2 pt-3 border-t border-brand/20">
                  <p className="text-xs sm:text-sm text-neutral-600">
                    <span className="font-semibold text-brand">Moyen sélectionné :</span> {paymentInfo}
                  </p>
                </div>
              )}
            </div>

            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
              <button
                type="submit"
                className="button-primary w-full cta-pulse text-base sm:text-lg font-semibold"
                disabled={submitted || hasPaidAccess || isCheckingAccess}
              >
                {isCheckingAccess
                  ? "Vérification en cours..."
                  : hasPaidAccess
                    ? "Accès déjà obtenu"
                    : submitted
                      ? "Traitement en cours..."
                      : product.customCtaText}
              </button>

              {hasPaidAccess && (
                <div className="rounded-2xl bg-green-50 p-3 sm:p-4 text-sm text-green-700 border border-green-200">
                   Vous avez déjà accès à ce cours ! <Link href="/client" className="underline font-semibold">Accéder à mes cours</Link>
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-red-50 p-3 sm:p-4 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {submitted && paymentInfo === "Orange Money" && !error && (
                <div className="rounded-2xl bg-blue-50 p-3 sm:p-4 text-sm text-blue-700 border border-blue-200">
                  Redirection vers Orange Money en cours...
                </div>
              )}
            </form>
            <div className="rounded-2xl border border-neutral-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-neutral-500">
                Besoin de plus d&apos;information ?
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={store.support.whatsapp} className="pill-neutral" target="_blank">
                  💬 WhatsApp
                </Link>
                <Link href={store.support.email} className="pill-neutral">
                  ✉️ Email
                </Link>
                <span className="pill-neutral">📞 {store.support.phone}</span>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 md:hidden">
        <div className="card flex items-center justify-between gap-3 p-4 shadow-lg">
          <div>
            <p className="text-sm font-semibold text-brand">Offre VB Sniper</p>
            <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
          </div>
          {hasPaidAccess ? (
            <Link href="/client" className="button-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              Mes cours
            </Link>
          ) : sessionToken ? (
            <Link href="#checkout" className="button-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              {product.customCtaText}
            </Link>
          ) : (
            <Link href="/auth" className="button-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              {product.customCtaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
