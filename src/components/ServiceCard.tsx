import Image from "next/image";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover: string;
  price?: number;
  featured?: boolean;
  available?: boolean;
  externalUrl?: string; // URL externe si le service est sur un autre site
};

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} F CFA`;

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-white">
        {service.available === false ? (
          <Image
            src="/images/bientot.png"
            alt="Bientôt disponible"
            fill
            className="object-contain transition-transform group-hover:scale-105"
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
        
        {service.available !== false ? (
          service.externalUrl ? (
            <a
              href={service.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full button-primary text-center cta-pulse"
            >
              Découvrir
            </a>
          ) : (
            <Link
              href={`/services/${service.slug}`}
              className="block w-full button-primary text-center cta-pulse"
            >
              Découvrir
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled
            className="block w-full button-secondary text-center opacity-50 cursor-not-allowed"
          >
            Bientôt disponible
          </button>
        )}
      </div>
    </div>
  );
}

