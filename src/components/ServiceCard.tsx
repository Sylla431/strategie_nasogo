"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover: string;
  price?: number;
  featured?: boolean;
  available?: boolean;
  externalUrl?: string;
  /** Affiche une popup avant redirection (ex. checkout VIP) */
  confirmBeforeCheckout?: boolean;
};

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} F CFA`;

export default function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const href = service.externalUrl
    ? service.externalUrl
    : `/services/${service.slug}`;
  const isInternal = href.startsWith("/");
  const needsConfirm = Boolean(service.confirmBeforeCheckout && service.externalUrl);

  const goToCheckout = () => {
    setConfirmOpen(false);
    if (isInternal) {
      router.push(href);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  const cta = (() => {
    if (service.available === false) {
      return (
        <button
          type="button"
          disabled
          className="block w-full button-secondary text-center opacity-50 cursor-not-allowed"
        >
          Bientôt disponible
        </button>
      );
    }

    if (needsConfirm) {
      return (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="block w-full button-primary text-center cta-pulse"
        >
          Découvrir
        </button>
      );
    }

    if (service.externalUrl) {
      if (isInternal) {
        return (
          <Link
            href={service.externalUrl}
            className="block w-full button-primary text-center cta-pulse"
          >
            Découvrir
          </Link>
        );
      }
      return (
        <a
          href={service.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full button-primary text-center cta-pulse"
        >
          Découvrir
        </a>
      );
    }

    return (
      <Link
        href={`/services/${service.slug}`}
        className="block w-full button-primary text-center cta-pulse"
      >
        Découvrir
      </Link>
    );
  })();

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
          {service.available === false ? (
            <Image
              src="/images/bientot.png"
              alt="Bientôt disponible"
              fill
              className="object-cover object-center transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <Image
              src={service.cover}
              alt={service.name}
              fill
              className="object-cover object-center transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          {service.available !== false && (
            <div className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Disponible
            </div>
          )}
          {service.available === false && (
            <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Bientôt disponible
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {service.name}
            </h3>
            <p className="text-sm text-neutral-600 line-clamp-2">
              {service.description}
            </p>
          </div>

          {service.price !== undefined && service.price > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-brand">
                {formatPrice(service.price)}
              </span>
            </div>
          )}

          {cta}
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-checkout-title"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-neutral-200 shadow-xl p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                VIP Telegram
              </p>
              <h2
                id="vip-checkout-title"
                className="text-xl font-semibold text-neutral-900"
              >
                Redirection vers le paiement
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Vous allez être redirigé vers la page de paiement sécurisée pour
                adhérer au canal VIP Signaux
                {service.price
                  ? ` (${formatPrice(service.price)} — 1er mois inclus)`
                  : ""}
                . Après validation, vous pourrez accéder au canal privé depuis
                votre espace client.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                className="button-secondary w-full sm:flex-1 text-center"
                onClick={() => setConfirmOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="button-primary w-full sm:flex-1 text-center"
                onClick={goToCheckout}
              >
                Continuer vers le paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
