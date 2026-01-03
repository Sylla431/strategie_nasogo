"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ServiceCard from "@/components/ServiceCard";

const store = {
  name: "VB Sniper Académie",
  description:
    "À travers mes divers programmes de formation et de coaching, j'accompagne des traders particuliers depuis 2022.",
  logoUrl: "/logo/logo.png",
  support: {
    whatsapp: "https://wa.me/+22373695125",
    email: "mailto:vbsnipergroupe@gmail.com",
    phone: "+223 73 69 51 25",
  },
};

const founderInfo = {
  name: "Modibo Ongoiba",
  title: "Fondateur & Mentor",
  photo: "/images/instructeur2.jpg",
  bio: `Je suis Modibo Ongoiba, fondateur de VB Sniper Académie. Depuis 2022, j'accompagne des traders particuliers dans leur parcours vers la réussite en trading. Ma mission est de partager des stratégies éprouvées et de fournir un accompagnement personnalisé pour aider chaque trader à atteindre ses objectifs.

À travers mes formations et mon coaching, j'ai aidé des centaines de traders à transformer leur approche du trading, à réduire leurs pertes et à développer une discipline de trading solide. Je crois fermement que le trading n'est pas une question de chance, mais de méthode, de discipline et d'accompagnement adapté.

Mon expertise se concentre sur les indices synthétiques et les stratégies mécaniques qui permettent de générer des résultats constants avec un capital raisonnable.`,
  expertise: [
    "Trading sur indices synthétiques",
    "Formation et coaching personnalisé",
    "Stratégies mécaniques et réplicables",
    "Gestion du risque et discipline",
  ],
  achievements: [
    "Accompagnement de traders depuis 2022",
    "Formations complètes avec résultats garantis",
    "Communauté active de traders performants",
  ],
  stats: {
    tradersAccompanied: "Centaines",
    yearsExperience: "Depuis 2022",
  },
};

const services = [
  {
    id: "strategie-nasongon",
    name: "Stratégie Nasongon",
    slug: "strategie-nasongon",
    description: "5 vidéos pour apprendre ma nouvelle stratégie nasongon. Objectif : 100$ par jour avec 20$ de capital.",
    cover: "/images/3.jpg",
    price: 27500,
    featured: true,
    available: true,
  },
  // {
  //   id: "formation-complete",
  //   name: "Forex Académie",
  //   slug: "formation-complete",
  //   description: "Formation complete pour tout savoir sur le marché des Forex",
  //   cover: "/images/bientot.jpg",
  //   price: 0,
  //   featured: false,
  //   available: false,
  // },
  {
    id: "journal-de-trading",
    name: "Journal de Trading",
    slug: "journal-de-trading",
    description: "un outil d'auto-analyse qui sert à documenter vos trades, vos stratégies et vos émotions afin d'identifier vos erreurs et de mesurer objectivement vos performances pour devenir un trader rentable.",
    cover: "/images/trading_journal.png",
    price: 10000,
    featured: false,
    available: true,
    externalUrl: "https://journal.vbsniperacademie.com/",
  },
  {
    id:"formation-en-presentiel",
    name:"Formation en Présentiel",
    slug:"formation-en-presentiel",
    description:"Devenez autonome sur les marchés financiers grâce à une immersion totale de 1 mois en présentiel. Oubliez les vidéos pré-enregistrées : apprenez, analysez et tradez en direct avec un expert à vos côtés.",
    cover: "/images/presentiel.jpeg",
    price: 125000,
    featured: false,
    available: true,
    externalUrl: `${store.support.whatsapp}`,
  },
  {
    id:"coaching-en-personnel",
    name:"Coaching Personnel",
    slug:"coaching-en-personnel",
    description:"Vous plafonnez dans vos résultats ? Vous maîtrisez la technique mais vos émotions prennent le dessus ? Le coaching personnel est le levier le plus rapide pour passer du statut de trader amateur à celui de trader rentable et serein.Ici, pas de cours magistral. Nous travaillons exclusivement sur votre capital, votre psychologie et votre plan de trading.",
    cover: "/images/coaching.jpeg",
    price: 250000,
    featured: false,
    available: true,
    externalUrl: `${store.support.whatsapp}`,
  },
  
];

const testimonials = [
  "IMG-20251213-WA0002.jpg",
  "IMG-20251213-WA0003.jpg",
  "IMG-20251213-WA0004.jpg",
  "IMG-20251213-WA0005.jpg",
  "IMG-20251213-WA0006.jpg",
  "IMG-20251213-WA0007.jpg",
  "IMG-20251213-WA0008.jpg",
  "IMG-20251213-WA0009.jpg",
  "IMG-20251213-WA0011.jpg",
  "IMG-20251213-WA0012.jpg",
  "WhatsApp Image 2025-07-13 at 16.25.18.jpeg",
  "WhatsApp Image 2025-07-13 at 16.25.19.jpeg",


];

export default function Home() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(null);

  return (
    <div className="bg-transparent text-neutral-900">
      {/* Section Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Logo en arrière-plan */}
        <div className="absolute inset-0 z-0">
          {/* Logo principal centré et agrandi en filigrane */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl max-h-4xl opacity-80">
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
          </div>
          {/* Pattern répété du logo (optionnel) */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url(${store.logoUrl})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
              backgroundPosition: 'center',
            }}
          />
          {/* Overlay avec gradient pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
          {/* Overlay avec effet de vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_80%)]" />
        </div>

        {/* Logo en haut à gauche */}
        <div className="absolute top-6 left-6 z-20">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#d4af37]/60 bg-black/50 backdrop-blur-sm shadow-md">
            <Image
              src={store.logoUrl}
              alt={store.name}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Contact en haut à droite */}
        <div className="absolute top-6 right-6 z-20 text-right">
          <p className="text-sm text-white font-medium mb-1">Contactez-moi</p>
          <a 
            href={store.support.email.replace("mailto:", "")}
            className="text-base text-brand font-semibold hover:text-[#f4d03f] transition-colors"
          >
            {store.support.email.replace("mailto:", "")}
          </a>
        </div>

        {/* Contenu centré en bas de la page */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="space-y-8">
            <p className="text-[#d4af37] text-lg sm:text-xl font-light tracking-wider uppercase">
              Nous sommes
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight drop-shadow-2xl">
              VB SNIPER ACADEMIE
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              {founderInfo.title}
            </p>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {store.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#f4d03f] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Mes services</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href={store.support.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
              >
                <span className="text-brand">Me contacter</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Section Vidéo de présentation */}
      <section className="py-16 md:py-24 bg-white">
        <div className="layout-shell">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
              Vidéo de présentation
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Découvrez en vidéo comment VB Sniper Académie accompagne les traders vers la réussite.
            </p>
                      </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-[#0f1016] shadow-md max-w-5xl mx-auto">
            <div className="relative w-full aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://player.vimeo.com/video/1150995934"
                title="Présentation VB Sniper Académie"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section À propos du fondateur */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="layout-shell">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden">
              <Image
                src={founderInfo.photo}
                alt={founderInfo.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-2">
                  {founderInfo.name}
                </h2>
                <p className="text-xl text-brand font-medium mb-6">
                  {founderInfo.title}
                </p>
              </div>

              <div className="space-y-4 text-neutral-700 leading-relaxed">
                {founderInfo.bio.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Expertise
                </h3>
                <ul className="space-y-2">
                  {founderInfo.expertise.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-brand mt-1">•</span>
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 shadow-sm border border-neutral-200">
                  <p className="text-2xl font-bold text-brand mb-1">
                    {founderInfo.stats.tradersAccompanied}
                  </p>
                  <p className="text-sm text-neutral-600">Traders accompagnés</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm border border-neutral-200">
                  <p className="text-2xl font-bold text-brand mb-1">
                    {founderInfo.stats.yearsExperience}
                  </p>
                  <p className="text-sm text-neutral-600">D&apos;expérience</p>
                </div>
              </div>
            </div>
              </div>
            </div>
        </section>

      {/* Section Services */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="layout-shell">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
              Nos Services
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Services disponibles et à venir
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          </div>
        </section>

      {/* Section Livre */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="layout-shell">
          <div className="max-w-5xl mx-auto">
            <div className="card overflow-hidden">
              <div className=" p-5 grid md:grid-cols-2 gap-8 items-center">
                {/* Image bientôt pour le livre */}
                <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
                  <Image
                    src="/images/livre_cover.jpg"
                    alt="Bientôt disponible"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                {/* Contenu */}
                <div className="space-y-6 p-6">
                  <div>
                    <span className="badge-soft text-brand mb-3">Livre</span>
                    <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
                      Découvrez notre livre
                    </h2>
                    <p className="text-lg text-neutral-600 leading-relaxed mb-4">
                    Le Processus d’un Trader Rentable est un guide clair et réaliste pour ceux qui veulent structurer leur trading et gagner en constance.
Ce livre t’aide à comprendre l’importance de la discipline, de la gestion du risque et d’un plan précis pour durer sur les marchés financiers.
La rentabilité n’est pas une question de chance, mais de processus.                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <span className="text-brand mt-1">✓</span>
                        <span className="text-neutral-700">Stratégies détaillées et expliquées pas à pas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand mt-1">✓</span>
                        <span className="text-neutral-700">Gestion du risque et psychologie du trading</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand mt-1">✓</span>
                        <span className="text-neutral-700">Exemples concrets et cas pratiques</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand mt-1">✓</span>
                        <span className="text-neutral-700">Accessible aux débutants comme aux traders expérimentés</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        className="button-primary cta-pulse"
                        disabled
                      >
                        Bientôt disponible
                      </button>
                      <Link
                        href={store.support.whatsapp}
                        target="_blank"
                        className="button-secondary text-center"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="layout-shell">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
              Ce que disent nos traders
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Témoignages visuels de nos élèves partagés depuis MT5 mobile
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((file) => (
              <div
                key={file}
                className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-[#0b0b10] shadow-md cursor-pointer transition hover:scale-[1.01] hover:border-brand"
                onClick={() => setSelectedTestimonial(file)}
              >
                <div className="relative min-h-[400px] w-full bg-black">
                  <Image
                    src={`/testimonial/${file}`}
                    alt={`Témoignage - ${file}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

      {/* Lightbox pour témoignages */}
        {selectedTestimonial && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedTestimonial(null)}
          >
            <div
              className="relative w-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
                onClick={() => setSelectedTestimonial(null)}
              >
                Fermer
              </button>
            <div className="relative h-[75vh] w-full bg-black rounded-2xl overflow-hidden">
            <Image
                  src={`/testimonial/${selectedTestimonial}`}
                alt={`Témoignage - ${selectedTestimonial}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        )}

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="layout-shell">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="relative h-12 w-12 mb-4 overflow-hidden rounded-full border border-[#d4af37]/60">
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{store.name}</h3>
              <p className="text-neutral-400 text-sm">{store.description}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <a href={store.support.whatsapp} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                  WhatsApp: {store.support.phone}
                </a>
                <a href={store.support.email} className="block hover:text-white">
                  Email: {store.support.email.replace("mailto:", "")}
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <div className="space-y-2 text-sm">
                <Link href="/" className="block text-neutral-400 hover:text-white">
                  Accueil
                </Link>
                <Link href="#services" className="block text-neutral-400 hover:text-white">
                  Services
                </Link>
                <Link href="/auth" className="block text-neutral-400 hover:text-white">
                  Connexion
                </Link>
                  </div>
                </div>
              </div>
          
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
            <p>&copy; {new Date().getFullYear()} {store.name}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
