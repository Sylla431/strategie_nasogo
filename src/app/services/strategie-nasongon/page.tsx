"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

const store = {
  name: "VB Sniper Academie",
  description:
    "À travers mes divers programmes de formation et de coaching, j'accompagne des traders particuliers depuis 2022.",
  url: "#",
  logoUrl: "/logo/logo.png",
  socialLinks: {
    // telegram: "https://t.me/+0NJDYbSz2BM0MTI0",
    // instagram: "https://www.instagram.com/geoffroyboko",
    // facebook: "https://facebook.com/geoffroy.bk08",
    // youtube: "https://youtube.com/@geoffroybk",
    // tiktok: "https://www.tiktok.com/@geoffroyboko_",
  },
  support: {
    whatsapp: "https://wa.me/+22373695125",
    email: "mailto:vbsnipergroupe@gmail.com",
    phone: "+223 73 69 51 25",
  },
};

const productDescription = `<h3 class="ql-align-center"><strong style="color: rgb(230, 0, 0);">TU NE PRENDS AUCUN RISQUE EN REJOIGNANT CE PROGRAMME</strong></h3><p class="ql-align-center"><strong style="color: rgb(0, 0, 0);">Je te rembourse intégralement ton achat si, dans les 48 heures qui suivent, tu estimes que ce programme ne t’apporte pas la valeur attendue.</strong></p><p><br></p><p><span style="color: rgb(0, 0, 0);">Savais-tu que la plupart des Traders en Afrique perdent entre 100 et 300€ par mois sans comprendre pourquoi ? En Europe et aux États-Unis, c'est encore pire.. Il y a une étude de l'AMF (Autorité des Marchés Financiers en France) qui a montré que sur une période d'observation de 4 ans, il apparait que près de 9 Traders sur 10 sont perdants. Ces 90 % de Traders perdants qui se disaient être "Intermédiaires", perdent en moyenne 11 500 € par an, c'est-à-dire environ 1 000 € par mois, sans savoir réellement pourquoi...</span></p><p><span style="color: rgb(0, 0, 0);">Ces chiffres parlent d’eux-mêmes, mais attention : Ces statistiques ne sont pas là pour te faire peur, je veux plutôt que tu prennes conscience de l'urgence d'agir correctement dès maintenant, si tu veux réellement réussir en Trading. C'est la décision que tu prendras aujourd'hui qui déterminera le type de Trader que tu seras dans quelques mois, voire quelques années. Aujourd'hui, tu n'as que deux issus possibles :</span></p><p><span style="color: rgb(0, 0, 0);">👉 Soit tu décides d’investir en toi, de te former sérieusement et d’être accompagné par un mentor expérimenté qui accompagne qui encadre des traders francophones depuis 2020.</span></p><p><span style="color: rgb(0, 0, 0);">👉 Soit tu persistes à essayer seul, en espérant t’en sortir… jusqu’au jour où tu réaliseras que tu auras perdu non seulement beaucoup d’argent, mais surtout du temps — ce temps précieux que tu ne pourras jamais rattraper."</span></p><p><br></p><h3 class="ql-align-center"><strong style="color: rgb(107, 36, 178);">Regarde cette vidéo de 5 min pour éviter de perdre du temps : je t'explique en détail comment se déroule le programme "VPS"</strong></h3><p><br></p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/UmrDc5F2j78?showinfo=0"></iframe><p><br></p><p><br></p><p><br></p><h3 class="ql-align-center"><strong style="color: rgb(0, 97, 0);">J'ai accompagné des centaines de Traders avant Toi, je te laisse découvrir ce qu'ils pensent de mon Mentorat...</strong></h3><p><br></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/RBBueXhVy0A1l7CEFNh3iK7MPOyn0ENhTABCbBRk.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/Zm3e9YeyTF5VvV9GYdhUrF3DUrfjRLoOTiAIIwWv.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/VciNE8LRPZhV8FOVMBUA7YgM3JNgQFJ3sfnARzkF.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/eRx4csOVzVMaRzVWUqNAFtk0oTVcn8UFDMojDwTJ.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/Jvt9o7GcbJhumu6OtdvZ6hN7Ba88eiY015KgzDIv.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/DVun0t1qKRgsvrVrJEDQ7AYIsmU2QKbQbh2qgS60.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/6YWaiLJqUFFwVJEcsddwnuWWwJeUfZxjZJAWs7Tg.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/pR0oR2Mp11mnompOzfxs2QbMb43t9Nimsfh6sa74.png"></p><p><br></p><p><strong style="color: rgb(0, 0, 0);">Tous ces traders étaient exactement comme toi.</strong><span style="color: rgb(0, 0, 0);"> Ils avaient la passion, la volonté, mais peinaient à obtenir des résultats constants sur les indices synthétiques.</span></p><p><span style="color: rgb(0, 0, 0);">Et puis un jour, ils ont décidé de se faire accompagner par moi. Ils ont rejoint ma formation… et c’est là que tout a changé. Aujourd’hui, leurs résultats parlent pour eux.</span></p><p><span style="color: rgb(0, 0, 0);">Ce n’est pas moi qui le dis, ce sont </span><strong style="color: rgb(0, 0, 0);">leurs témoignages</strong><span style="color: rgb(0, 0, 0);"> que tu peux lire ici même. Et j’en suis convaincu : grâce à ce programme, </span><strong style="color: rgb(230, 0, 0);">le prochain témoignage que nous publierons pourrait bien être le tien.</strong></p><p><br></p><p><strong style="color: rgb(0, 97, 0);">Il y a tellement de témoignages que je ne pourrais pas tous les publier ici. Mais je t’en laisse encore quelques-uns, juste pour te montrer à quel point ce programme a transformé des traders comme toi. Tout devient possible quand on applique vraiment ma méthode telle que je l'enseigne.</strong></p><p><br></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/WXCy2fZnpRbHBrOibydgLyZfbyxCfOAFgALfZrIE.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/YLMx7hkYxTkTHlkTbk5P7Xyk50UsK6Z8ZcCzVxQk.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/XVz6UVvnKuhDy7vClMBk99APyNKt915fzFBCNFsc.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/syaIxtMXR2ZHHbtascUnpHkWRibzlntvMVxUdcKz.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/tuBhhBzGRGVoVHO4hWSKQV1y5Un2FQ1eEvFi0XuL.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/rbl7jExI4FTNt4Ywj60AgmxsUMNdq7qLjimHEJr2.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/6zDPH6No7AAE9Todq4k4aNv6EvWVlBuZryCCA4m8.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/YiiUYsE8SzyYVwaO00gfn7yUzKkNTFn7nCcMBtRz.png"></p><p><img src="https://images.chariow.com/cdn-cgi/image/format=auto,onerror=redirect,quality=medium-high,slow-connection-quality=50/https://assets.cdn.chariow.com/assets/store_x02kq87vz7rf/lr8xU8nFdbYWiK2boONWOeDp2jJjOuHYrHSntG9X.png"></p><h2 class="ql-align-center"><br></h2><h1 class="ql-align-center"><strong style="color: rgb(107, 36, 178);">Bilan de Tout ce à quoi Tu auras Accès</strong></h1><p><br></p><p><strong style="color: rgb(0, 0, 0);">🎯 </strong><strong style="color: rgb(230, 0, 0);">07 Jours de Formation Intensifs pour Maitriser 02 Stratégies clés</strong></p><p><span style="color: rgb(0, 0, 0);">→ Tu vas pouvoir identifier avec précision les zones à haute probabilité d’exécution</span></p><p><span style="color: rgb(0, 0, 0);">→ Tu ne feras plus de prises de position émotionnelles, mais fondées sur une lecture intelligente du marché.</span></p><p><span style="color: rgb(0, 0, 0);">→ Tu ne prendras plus de trades hasardeux ; je t’apprendrai à analyser, planifier et frapper au bon moment.</span></p><p><span style="color: rgb(0, 0, 0);">→ </span>Avec ces deux stratégies mécaniques, tu pourras réduire ton stress et devenir plus régulier sur les marchés.</p><p><span style="color: rgb(0, 0, 0);">→ Résultats mesurables en peu de temps si tu prends le travail très au sérieux.</span></p><h3><br></h3><h3><strong style="color: rgb(0, 97, 0);">🎁 BONUS EXCLUSIFS</strong></h3><p><br></p><p><strong style="color: rgb(0, 0, 0);">🎯 </strong><strong style="color: rgb(230, 0, 0);">BONUS 1 : Accès à ma communauté privée — 30 jours offerts</strong></p><p><span style="color: rgb(0, 0, 0);">→ Il s'agit d'un espace réservé aux traders sérieux ayant terminé la formation de 7 jours.</span></p><p><span style="color: rgb(0, 0, 0);">→ Nous organisons des séances d’analyse de marché hebdomadaires en direct, via visioconférence.</span></p><p><span style="color: rgb(0, 0, 0);">→ Tu bénéficies également d’un coaching collectif durant ces 30 jours.</span></p><p><span style="color: rgb(0, 0, 0);">→ Nos coachs expérimentés corrigeront tes analyses au quotidien afin de t’aider à améliorer ta compréhension du marché, et cela très rapidement.</span></p><p><span style="color: rgb(0, 0, 0);">→ Tu ne seras pas seul(e) durant cette période et tu progresseras aux côtés d’autres traders du programme.</span></p><p><br></p><p><strong style="color: rgb(0, 0, 0);">🎯 </strong><strong style="color: rgb(230, 0, 0);">BONUS 2 : Appel BILAN privé avec moi après ta période d’intégration</strong></p><p><span style="color: rgb(0, 0, 0);">→ Il s’agit d’un entretien stratégique individuel et personnalisé destiné à corriger, optimiser et accélérer tes résultats.</span></p><p><span style="color: rgb(0, 0, 0);">→ Cet appel est réalisé directement avec le Gouverneur, en visioconférence sur Zoom.</span></p><p><span style="color: rgb(0, 0, 0);">→ Ce bonus est réservé aux participants sérieux ayant terminé le programme.</span></p><p><br></p><p class="ql-align-center"><strong style="color: rgb(0, 0, 0);"><em>*** VOLATILITY PRO SECRETS n’est pas une simple formation, c’est ton déclic, le point de bascule où tout change pour toi. Dans ce programme, pas de bla-bla, pas de théorie infinie. Je t'apprends à jouer dans la cour des grands, avec une pratique sur les marchés sans équivalent.***</em></strong></p><p><br></p><h2><strong style="color: rgb(107, 36, 178);">💥 OFFRE ACTUELLE (LIMITÉE)</strong><strong style="color: rgb(0, 0, 0);"> </strong><span style="color: rgb(0, 0, 0);"> </span></h2><p><span style="color: rgb(0, 0, 0);">❌ </span><strong style="color: rgb(0, 0, 0);">Prix officiel : <s>49 700 FCFA</s> </strong><span style="color: rgb(0, 0, 0);"> </span></p><p><span style="color: rgb(0, 0, 0);">✅ </span><strong style="color: rgb(0, 0, 0);">Ton Accès maintenant : </strong><strong style="color: rgb(0, 97, 0);">19 700 FCFA</strong><span style="color: rgb(0, 0, 0);"> </span></p><blockquote><span style="color: rgb(0, 0, 0);">⚠️ Offre valable que pendant une durée déterminée </span></blockquote><p><br></p><h3><span style="color: rgb(0, 0, 0);">🚨 </span><strong style="color: rgb(107, 36, 178);">Garantie 100% sereine : Satisfait ou remboursé </strong><span style="color: rgb(0, 0, 0);">😯</span></h3><p><span style="color: rgb(0, 0, 0);">Tu ne prends littéralement </span><strong style="color: rgb(0, 0, 0);">aucun risque. </strong><span style="color: rgb(0, 0, 0);">Si tu n'es pas satisfait dans les 48 heures, tu peux demander le </span><strong style="color: rgb(0, 0, 0);">remboursement</strong><span style="color: rgb(0, 0, 0);"> de ton achat.</span></p><p><br></p><h3><span style="color: rgb(0, 0, 0);">🔥 Prêt à passer du</span><strong style="color: rgb(0, 0, 0);"> </strong><strong style="color: rgb(230, 0, 0);">mode amateur</strong><strong style="color: rgb(0, 0, 0);"> → </strong><span style="color: rgb(0, 0, 0);">au</span><strong style="color: rgb(0, 0, 0);"> </strong><strong style="color: rgb(0, 97, 0);">mode Pro </strong>?</h3><h3><span style="color: rgb(0, 0, 0);">Tout commence ici. Clique sur le bouton « </span><strong style="color: rgb(153, 51, 255);">Profiter de l'offre </strong><span style="color: rgb(0, 0, 0);">» et rejoins dès maintenant le programme VPS </span><strong style="color: rgb(255, 255, 255);">🚀</strong></h3><p><br></p><p><br></p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/JSSaWZ7_W9w?showinfo=0"></iframe>`;

const product = {
  id: "prd_6dq35w",
  name: "VB Sniper : 5 videos pour Apprendre ma nouvelle stratégie nasongon",
  slug: "vps-v1",
  cover: "/images/3.jpg",
  thumbnail: "/images/Instructeur.jpg",
  description: productDescription,
  price: 27500,
  originalPrice: 37500,
  salePercent: 30,
  saleEndsAt: "2025-12-31T00:00:00Z",
  category: "Business & Finance",
  type: "Programme de formation",
  customCtaText: "Profiter de l'offre",
  field: {
    label: "Niveau",
    placeholder: "Débutant, intermédiaire ou avancé",
    help: "Dites-nous où vous en êtes pour personnaliser votre plan d'action.",
  },
  badges: [
    "Livraison immédiate",
    "Resultat Garantie",
    "Accès communauté privée (30 jours)",
    "Appel bilan personnalisé",
  ],
  bullets: [
    "Identifier les zones à haute probabilité d'exécution",
    "Arrêter les prises de position émotionnelles",
    "Deux stratégies mécaniques et réplicables",
    "Résultats mesurables si tu appliques le plan pendant 7 jours",
  ],
};

const otherProducts = [
  {
    id: "prd_kcloen",
    name: "Formation Complète sur le trading",
    price: 0,
    originalPrice: 0,
    cover:
      "/images/bientot.jpg",
    description:
      "Le système complet pour documenter, analyser et répéter ce qui fonctionne afin de trader sans émotions.",
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
];

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} F CFA`;

function useCountdown(targetDate: string): Countdown {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);

  const compute = () => {
    const diff = target - Date.now();
    if (Number.isNaN(target) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, expired: false };
  };

  const [state, setState] = useState<Countdown>(compute);

  useEffect(() => {
    const timer = setInterval(() => setState(compute), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return state;
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5 rounded-xl bg-white p-2.5 sm:p-3 text-center shadow-sm border border-[#e1e3eb]">
    <span className="text-lg sm:text-xl md:text-2xl font-bold text-brand leading-none">{value}</span>
    <span className="text-xs sm:text-sm text-neutral-700 font-medium">{label}</span>
  </div>
);

export default function Home() {
  const router = useRouter();
  // Email pour préremplir le formulaire d'authentification (actuellement commenté dans le JSX)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(
    null,
  );
  const [paymentInfo, setPaymentInfo] = useState<string | null>(null);
  const [videoZoomOpen, setVideoZoomOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roleLoadError, setRoleLoadError] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const countdown = useCountdown(product.saleEndsAt);

  const savings = product.originalPrice - product.price;

  const siteUrl = "https://vbsniperacademie.com";
  const toAbs = (path: string) =>
    path.startsWith("http")
      ? path
      : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const ldProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      "Stratégie Nasongon : 5 vidéos + coaching, resultat garantie, objectif 100$ par jour avec 20$ de capital.",
    image: [toAbs(product.cover), toAbs(product.thumbnail)],
    brand: {
      "@type": "Organization",
      name: "VB Sniper Academie",
      logo: toAbs(store.logoUrl),
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      url: siteUrl,
      priceCurrency: "XOF",
      price: product.price,
      availability: "https://schema.org/InStock",
      priceValidUntil: product.saleEndsAt,
    },
  };

  const ldOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VB Sniper Academie",
    url: siteUrl,
    logo: toAbs(store.logoUrl),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: store.support.phone,
        contactType: "customer support",
        areaServed: "FR",
        availableLanguage: ["fr"],
      },
    ],
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      const uid = data.session?.user?.id ?? null;
      const emailVal = data.session?.user?.email ?? null;
      setSessionToken(token);
      setUserEmail(emailVal);
      setUserId(uid);
      setRoleLoadError(null);
      if (token && uid) {
        const readRole = async () => {
          const { data: profile, error } = await supabase
            .from("users_profile")
            .select("role")
            .eq("id", uid)
            .maybeSingle();
          if (error) {
            setRoleLoadError(error.message);
            return null;
          }
          const roleVal =
            (profile?.role && typeof profile.role === "string"
              ? profile.role.trim().toLowerCase()
              : null) ?? null;
          return roleVal;
        };

        let roleVal = await readRole();
        if (!roleVal) {
          const { error: upErr } = await supabase
            .from("users_profile")
            .upsert({ id: uid });
          if (upErr) {
            setRoleLoadError(upErr.message);
          } else {
            roleVal = await readRole();
          }
        }
        setUserRole(roleVal === "admin" ? "admin" : roleVal);
      } else {
        setUserRole(null);
        setUserId(null);
        setUserEmail(null);
        setRoleLoadError(null);
        setUserMenuOpen(false);
        setHasPaidAccess(false);
      }
    };
    
    loadSession();
    
    // Écouter les changements de session (déconnexion, expiration, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setSessionToken(null);
        setUserRole(null);
        setUserId(null);
        setUserEmail(null);
        setRoleLoadError(null);
        setUserMenuOpen(false);
        setHasPaidAccess(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Vérifier si l'utilisateur a déjà payé pour le cours
  useEffect(() => {
    const checkPaidAccess = async () => {
      if (!userId || !sessionToken) {
        setHasPaidAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      setIsCheckingAccess(true);
      try {
        // Récupérer les cours disponibles
        const coursesRes = await fetch("/api/courses", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        
        if (!coursesRes.ok) {
          setHasPaidAccess(false);
          setIsCheckingAccess(false);
          return;
        }

        const courses = await coursesRes.json();
        if (!courses || courses.length === 0) {
          setHasPaidAccess(false);
          setIsCheckingAccess(false);
          return;
        }

        const courseId = courses[0].id;

        // Vérifier les commandes payées
        const ordersRes = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          const hasPaidOrder = orders.some(
            (o: { course_id: string; status: string }) => 
              o.course_id === courseId && o.status === "paid"
          );

          // Vérifier aussi les accès accordés
          const { data: accessData } = await supabase
            .from("course_access")
            .select("course_id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();

          const hasAccess = hasPaidOrder || !!accessData;
          setHasPaidAccess(hasAccess);
        } else {
          setHasPaidAccess(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'accès:", error);
        setHasPaidAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkPaidAccess();
  }, [userId, sessionToken]);

  const handleLogout = async () => {
    try {
      // Nettoyer l'état local d'abord
      setSessionToken(null);
      setUserRole(null);
      setUserEmail(null);
      setUserId(null);
      setRoleLoadError(null);
      setUserMenuOpen(false);
      
      // Déconnexion Supabase avec nettoyage complet
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
      
      // Forcer le rechargement pour nettoyer complètement la session
      window.location.href = "/";
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      // Forcer le rechargement même en cas d'erreur
      window.location.href = "/";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Vérifier la session directement pour avoir la version la plus récente
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    const currentToken = currentSession?.access_token;
    const currentUserId = currentSession?.user?.id;
    
    // Si l'utilisateur n'est pas connecté, rediriger vers l'authentification
    if (!currentToken || !currentUserId) {
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
      router.push(`/auth${emailParam}`);
      return;
    }
    
    // Mettre à jour les états locaux avec la session actuelle
    setSessionToken(currentToken);
    setUserId(currentUserId);
    setUserEmail(currentSession?.user?.email ?? null);

    // Vérifier qu'un moyen de paiement est sélectionné
    if (!paymentInfo) {
      setError("Veuillez choisir un moyen de paiement.");
      return;
    }

    // Mapping des moyens de paiement vers leurs codes
    const paymentMethodMap: Record<string, string> = {
      "Mobile Money (Orange money)": "orange_money",
      "PayTech": "paytech",
      "Moneroo": "moneroo",
    };

    // Si c'est un paiement en ligne (Orange Money, PayTech, Moneroo)
    const paymentMethodCode = paymentMethodMap[paymentInfo || ""];
    if (paymentMethodCode) {
      try {
        setSubmitted(true);
        setError(null);
        
        // Récupérer le premier cours disponible (ou le cours principal)
        const coursesRes = await fetch("/api/courses", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        
        if (!coursesRes.ok) {
          throw new Error("Erreur lors de la récupération des cours");
        }
        
        const courses = await coursesRes.json();
        if (!courses || courses.length === 0) {
          throw new Error("Aucun cours disponible");
        }
        
        // Utiliser le premier cours disponible
        const courseId = courses[0].id;
        
        // Créer la commande avec le moyen de paiement sélectionné
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            payment_method: paymentMethodCode,
          }),
        });
        
        if (!orderRes.ok) {
          const errorData = await orderRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Erreur lors de la création de la commande");
        }
        
        const orderData = await orderRes.json();
        
        // Si une URL de paiement est retournée, rediriger vers le provider
        if (orderData.payment_url) {
          window.location.href = orderData.payment_url;
        } else if (orderData.payment_initiation_error) {
          setError(`Erreur: ${orderData.payment_initiation_error}`);
          setSubmitted(false);
        } else {
          // Fallback: rediriger vers la page client
          router.push("/client");
        }
      } catch (error) {
        console.error(`Error processing ${paymentInfo} payment:`, error);
        setError(error instanceof Error ? error.message : "Erreur lors du traitement du paiement");
        setSubmitted(false);
      }
      return;
    }
    
    // Si aucun moyen de paiement reconnu, afficher une erreur
    setError("Moyen de paiement non reconnu. Veuillez en choisir un autre.");
  };

  return (
    <div className="bg-transparent text-neutral-900">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg p-4 border-b border-[#e1e3eb]">
        <div className="layout-shell flex flex-wrap items-center justify-between gap-3 sm:gap-4 py-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#d4af37]/60 bg-black shadow-md">
        <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              {/* <p className="text-sm font-semibold text-brand">Boutique officielle</p> */}
              <p className="text-lg font-semibold tracking-tight">{store.name}</p>
              <p className="text-xs text-neutral-700 sm:hidden">
                Formations et coaching depuis 2022.
              </p>
              <p className="hidden sm:block text-sm text-neutral-800">
                {store.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-nowwrap">
            <Link
              href={store.support.whatsapp}
              target="_blank"
              className="pill-neutral text-xs sm:text-sm whitespace-nowrap"
            >
              Besoin d&apos;aide ?
            </Link>
            {sessionToken ? (
              <>
                {userRole !== "admin" && (
                  <Link href="/client" className="pill-neutral text-xs sm:text-sm whitespace-nowrap">
                    Espace client
                  </Link>
                )}
                {userRole === "admin" && (
                  <>
                    <Link href="/admin" className="pill-neutral text-xs sm:text-sm whitespace-nowrap">
                      Admin
                    </Link>
                    <Link href="/admin/students" className="pill-neutral text-xs sm:text-sm whitespace-nowrap">
                      Étudiants
                    </Link>
                  </>
                )}
                <div className="relative">
                  <button
                    type="button"
                    className="h-10 w-10 rounded-full border border-[#d4af37]/40 bg-white shadow-sm grid place-items-center hover:bg-[rgba(212,175,55,0.08)]"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="Profil"
                    aria-haspopup="dialog"
                    aria-expanded={userMenuOpen}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 22a8 8 0 1 0-16 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      {/* Overlay pour fermer la popup en cliquant à l'extérieur */}
                      <div
                        className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div
                        role="dialog"
                        aria-label="Profil utilisateur"
                        className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-64 max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 sm:p-4 shadow-xl z-50"
                      >
                        <p className="text-sm sm:text-sm text-neutral-600 font-medium">Connecté en tant que</p>
                        <p className="font-semibold text-base sm:text-base break-all mt-1 text-neutral-900">
                          {userEmail ?? "Utilisateur"}
                        </p>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="badge-soft text-brand text-xs sm:text-sm">
                            Rôle : {userRole ?? "client"}
                          </span>
                        </div>
                        {userId && (
                          <p className="mt-2 text-xs text-neutral-500 break-all">
                            ID: {userId}
                          </p>
                        )}
                        {roleLoadError && (
                          <p className="mt-2 text-xs text-red-600 break-all">
                            Erreur rôle: {roleLoadError}
                          </p>
                        )}
                        <div className="mt-4 flex flex-col gap-2">
                          <Link 
                            href="/client" 
                            className="pill-neutral w-full text-center text-sm sm:text-base"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Espace client
                          </Link>
                          {userRole === "admin" && (
                            <>
                              <Link 
                                href="/admin" 
                                className="pill-neutral w-full text-center text-sm sm:text-base"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                Admin
                              </Link>
                              <Link 
                                href="/admin/students" 
                                className="pill-neutral w-full text-center text-sm sm:text-base"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                Étudiants
                              </Link>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className="mt-4 button-primary w-full cta-pulse text-sm sm:text-base"
                          onClick={handleLogout}
                        >
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth" className="button-primary cta-pulse text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="layout-shell py-10 md:py-14 space-y-10 ">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
        />
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start pt-5">
          <div className="card overflow-hidden">
            <div className="relative h-[360px] w-full bg-dotted">
              <Image
                src={product.cover}
                alt={product.name}
                fill
                className="object-cover"
          priority
        />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
              <div className="absolute right-4 top-4 z-10 rounded-xl border border-[#d4af37] bg-white/95 px-3 py-2 backdrop-blur max-sm:hidden">
                <p className="text-xs text-neutral-800 leading-tight">Stratégie Nasongon</p>
                <p className="text-sm font-semibold text-brand leading-tight">
                  100$ / jour avec 20$
                </p>
              </div>
              <div className="absolute left-4 bottom-4 max-sm:left-4 max-sm:right-4 max-sm:bottom-3 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 backdrop-blur max-sm:w-[90%]">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#d4af37]/60 shadow-md">
                  <Image
                    src={store.logoUrl}
                    alt={`${store.name} logo`}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="block sm:hidden">
                    <p className="text-xs text-neutral-800 truncate">100$ / jour avec 20$</p>
                    <p className="text-sm font-semibold text-brand truncate">Stratégie nasongon</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-neutral-800 truncate">Programme exclusif</p>
                    <p className="text-sm font-semibold text-brand truncate">VB Sniper</p>
                  </div>
                </div>
              </div>
              {/* <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="badge-soft">Version 1</span>
                <span className="pill-neutral">{product.category}</span>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="badge-soft">🎯 7 jours intensifs</span>
                <span className="badge-soft">⚡ Accès immédiat</span>
              </div> */}
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="pill-neutral text-xs sm:text-sm">{product.type}</span>
                <span className="pill-neutral text-xs sm:text-sm">
                  🔥 Offre limitée jusqu&apos;au 31 décembre 2025
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-neutral-900">
                  {product.name}
          </h1>
                <p className="text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
                  Ma nouvelle stratégie nasongon au quotidien sur les
                  indices synthétiques, distillées sur 5 video, avec coaching,
                  communauté privée et résultat garantie.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl font-semibold text-brand">
                    {formatPrice(product.price)}
                  </span>
                <span className="text-base sm:text-lg text-neutral-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
                <span className="badge-soft text-xs sm:text-sm">-{product.salePercent}%</span>
              <span className="text-xs sm:text-sm text-neutral-700 font-medium">
                  Économisez {formatPrice(savings)}
                </span>
              </div>

              {/* <div className="flex flex-wrap gap-3">
                <Link href="#checkout" className="button-primary cta-pulse">
                  🚀 {product.customCtaText}
                </Link>
                <Link
                  href={store.support.whatsapp}
            target="_blank"
                  className="button-secondary"
                >
                  💬 Parler à un conseiller
                </Link>
              </div> */}

              {/* <div className="grid gap-3 sm:grid-cols-2">
                {product.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-start gap-3 rounded-2xl bg-[#1b1b25] p-4 shadow-sm"
                  >
                    <span className="mt-0.5 text-brand">•</span>
                    <p className="text-neutral-100">{bullet}</p>
                  </div>
                ))}
              </div> */}
              <div className="space-y-3">
          
                <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-3xl leading-relaxed">
                Formation Nasongon est une formation basée sur une stratégie simple et testée sur les indices synthétiques, conçue pour générer jusqu&apos;à 100$ par jour avec un petit capital. Elle repose sur l&apos;analyse des zones, la répétition des mouvements du marché et une gestion du risque stricte.

Cette formation t&apos;apprend à entrer avec précision, à sécuriser rapidement tes profits et à construire une routine de trading claire et disciplinée. Elle s&apos;adresse aux débutants sérieux comme aux traders intermédiaires qui veulent arrêter de compliquer le trading et se concentrer sur ce qui fonctionne réellement.

Nasongon n&apos;est pas une promesse, c&apos;est une méthode. Une approche réaliste pour ceux qui veulent de la constance et des résultats.

                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-brand bg-[rgba(212,175,55,0.08)] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-brand">
                      Offre à durée limitée
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-neutral-900">
                      L&apos;offre se termine dans :
                    </p>
                  </div>
                  <div className="grid w-full sm:w-auto grid-cols-4 gap-2 text-center">
                    {["J", "H", "Min", "Sec"].map((label, index) => {
                      const values = [
                        countdown.days,
                        countdown.hours,
                        countdown.minutes,
                        countdown.seconds,
                      ];
                      return (
                        <Stat
                          key={label}
                          value={String(values[index]).padStart(2, "0")}
                          label={label}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside
            id="checkout"
            className="card sticky top-20 sm:top-24 space-y-4 sm:space-y-5 p-4 sm:p-6 md:p-7"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-brand">
                  Offre spéciale VB SNIPER
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{formatPrice(product.price)}</p>
                {/* <p className="text-sm text-neutral-300">
                  Paiement simulé pour cette démo • accès immédiat
                </p> */}
              </div>
              <div className="badge-soft text-brand text-xs sm:text-sm flex-shrink-0">Garantie 48h</div>
            </div>

            {/* Section de sélection du moyen de paiement - AVANT le formulaire */}
            <div className="space-y-3 sm:space-y-4 rounded-2xl bg-[rgba(212,175,55,0.08)] p-4 sm:p-5 border border-brand/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="badge-soft text-brand text-xs sm:text-sm">Paiement</span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-700">
                  Choisissez votre moyen de paiement
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 italic">
                Bientôt disponible
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "Mobile Money (Orange money)",
                  "PayTech",
                  "Moneroo",
                  // "Carte bancaire (Visa / MasterCard)", // Pas encore intégrée
                ].map((method) => (
                  <button
                    key={method}
                    type="button"
                    disabled
                    className="pill-neutral text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all opacity-60 cursor-not-allowed bg-neutral-100 text-neutral-500 border-neutral-200"
                    onClick={() => {}}
                    title="Bientôt disponible"
                  >
                    {method}
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
              {/* <div className="space-y-2">
                <label className="text-sm font-semibold">Adresse email</label>
                <input
                  
                  type="email"
                  className="form-control"
                  placeholder="ton.email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div> */}
            

              <button 
                type="submit" 
                className="button-primary w-full cta-pulse text-base sm:text-lg font-semibold"
                disabled={submitted || hasPaidAccess || isCheckingAccess}
              >
                {isCheckingAccess 
                  ? "Vérification en cours..." 
                  : hasPaidAccess 
                    ? "✅ Accès déjà obtenu" 
                    : submitted 
                      ? "Traitement en cours..." 
                      : product.customCtaText}
              </button>
              
              {hasPaidAccess && (
                <div className="rounded-2xl bg-green-50 p-3 sm:p-4 text-sm text-green-700 border border-green-200">
                  🎉 Vous avez déjà accès à ce cours ! <Link href="/client" className="underline font-semibold">Accéder à mes cours</Link>
                </div>
              )}
              
              {/* Messages d'erreur */}
              {error && (
                <div className="rounded-2xl bg-red-50 p-3 sm:p-4 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              
              {/* Messages de succès */}
              {message && (
                <div className="rounded-2xl bg-green-50 p-3 sm:p-4 text-sm text-green-700 border border-green-200">
                  {message}
                </div>
              )}
              
              {/* Messages de chargement */}
              {submitted && paymentInfo === "Mobile Money (Orange money)" && !error && (
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
          </aside>
        </section>

        <section className="card p-4 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand">Ce que tu vas maîtriser</p>
              <h2 className="text-2xl font-semibold">Découvre la stratégie Nasongon</h2>
              <p className="text-neutral-500">
                Vidéo de présentation et d&apos;exemples concrets de la méthode.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-[#0f1016] shadow-md">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-black focus:outline-none focus:ring-2 focus:ring-brand"
              onClick={() => setVideoZoomOpen(true)}
            >
              Agrandir
            </button>
            <div className="relative w-full aspect-[16/9] sm:aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full rounded-2xl"
                  src="https://player.vimeo.com/video/1147397571?title=0&byline=0&portrait=0"
                  title="Stratégie Nasongon"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
            </div>
          </div>
        </section>

        {videoZoomOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setVideoZoomOpen(false)}
          >
            <div
              className="relative w-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-black focus:outline-none focus:ring-2 focus:ring-brand"
                onClick={() => setVideoZoomOpen(false)}
              >
                Fermer
              </button>
              <div className="relative w-full h-[80vh]">
                <iframe
                  className="absolute inset-0 h-full w-full rounded-2xl"
                  src="https://player.vimeo.com/video/1147397571?title=0&byline=0&portrait=0"
                  title="Stratégie Nasongon"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* <section className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-brand">Programme détaillé</p>
              <h2 className="text-2xl font-semibold">Découvre le contenu complet</h2>
              <p className="text-neutral-300">
                La page ci-dessous reprend exactement la description originale du
                produit VPS (texte, images, vidéos, garanties).
              </p>
            </div>
            <Link href="#checkout" className="button-secondary">
              🚀 Rejoindre le programme
            </Link>
          </div>
          <div
            className="rich-text"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section> */}

        <section className="card p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-brand">Résultats en direct</p>
              <h2 className="text-2xl font-semibold p-3">Trades pris sur MT5 mobile</h2>
              <p className="text-neutral-500">
                Témoignages visuels issus de MT5 mobile partagé par les élèves.
          </p>
        </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((file) => (
              <div
                key={file}
                className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-[#0b0b10] shadow-md cursor-pointer transition hover:scale-[1.01] hover:border-brand"
                onClick={() => setSelectedTestimonial(file)}
              >
                <div className="relative min-h-[540px] w-full bg-black">
                  <Image
                    src={`/testimonial/${file}`}
                    alt={`Résultat MT5 - ${file}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

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
              <div className="relative h-[75vh] w-full bg-black">
            <Image
                  src={`/testimonial/${selectedTestimonial}`}
                  alt={`Résultat MT5 - ${selectedTestimonial}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>
          </div>
        )}


        <section className="card p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-brand">Autres ressources</p>
              <h2 className="text-2xl font-semibold">
                Bientôt sur VB SNIPER
              </h2>
            </div>
            {/* <Link href={store.url} className="button-secondary" target="_blank">
              Voir la boutique
            </Link> */}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {otherProducts.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-[#1b1b25] p-4 shadow-sm flex gap-4"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-neutral-200">
                  <Image
                    src={item.cover}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold leading-snug">{item.name}</p>
                  <p className="text-sm text-neutral-300">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-brand font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        </section>
      </main>

      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 md:hidden">
        <div className="card flex items-center justify-between gap-3 p-4 shadow-lg">
          <div>
            <p className="text-sm font-semibold text-brand">Offre VB Sniper</p>
            <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
          </div>
          <Link href="/auth" className="button-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
            {product.customCtaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
