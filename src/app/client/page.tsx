"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { VIP_ADHESION_AMOUNT, VIP_RENEWAL_AMOUNT } from "@/lib/telegram/pricing";

type CourseVideo = {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  position: number;
};

type Course = {
  id: string;
  title: string;
  cover_url: string | null;
  video_url?: Array<{ title: string; video_url: string; position: number }> | null;
  course_videos?: CourseVideo[];
  price: number;
};

type Order = {
  id: string;
  status: string;
  payment_method: string;
  course_id: string;
  created_at: string;
  paid_at?: string | null;
  payment_reference?: string | null;
  courses?: Course;
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  moneroo: "Moneroo",
  paytech: "PayTech",
  orange_money: "Orange Money",
  cash: "Espèces",
};

function paymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABELS[method] || method;
}

function orderStatusLabel(status: string) {
  if (status === "paid") return "Payé";
  if (status === "failed") return "Échoué";
  if (status === "pending") return "En attente";
  return status;
}

function orderStatusClass(status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

type CourseAccess = {
  id: string;
  course_id: string;
  granted_at: string;
  courses?: Course;
};

const NASONGON_COURSE_COMMUNITY_TELEGRAM_URL = "https://t.me/+Zi7RkQ3TAY5hY2Rk";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221c-.129 1.726-.722 5.982-.901 7.068-.139.855-.413 1.14-.678 1.168-.577.055-1.014-.384-1.572-.752-.87-.574-1.363-.931-2.207-1.494-.959-.641-.337-.994.209-1.57.144-.19 2.595-2.38 2.644-2.584.006-.027.011-.125-.047-.185-.058-.06-.144-.037-.207-.022-.088.02-1.494.95-4.216 2.787-.399.238-.76.354-1.083.348-.357-.006-1.043-.201-1.551-.367-.625-.204-1.121-.312-1.08-.658.025-.216.325-.437.895-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559.099.015.321.06.465.277.12.18.155.415.108.644z" />
    </svg>
  );
}

export default function ClientSpace() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accessGrants, setAccessGrants] = useState<CourseAccess[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [telegramActive, setTelegramActive] = useState(false);
  const [telegramHasSubscription, setTelegramHasSubscription] = useState(false);
  const [telegramExpiresAt, setTelegramExpiresAt] = useState<string | null>(null);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramOpening, setTelegramOpening] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [paymentsSidebarOpen, setPaymentsSidebarOpen] = useState(false);

  const fetchOrders = useCallback(async (token: string) => {
      try {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
        
    if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }));
          console.error("Erreur chargement commandes:", errorData);
          
          // Si la session a expiré, rediriger vers la page d'accueil
          if (res.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.");
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
            return;
          }
          
          setError(`Impossible de charger les commandes: ${errorData.error || "Erreur serveur"}`);
      return;
    }
        
    const data = await res.json();
        setOrders(data || []);
      } catch (err) {
      console.error("Erreur réseau lors du chargement des commandes:", err);
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    }
  }, []);

  const fetchAccessGrants = useCallback(async (token: string) => {
      try {
    const res = await fetch("/api/access", {
      headers: { Authorization: `Bearer ${token}` },
    });
        if (!res.ok) {
          console.error("Erreur chargement accès:", res.status);
          return;
        }
    const data = await res.json();
        setAccessGrants(data || []);
      } catch (err) {
        console.error("Erreur réseau lors du chargement des accès:", err);
      }
  }, []);

  const fetchTelegramSubscription = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/telegram/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTelegramActive(Boolean(data.active));
      setTelegramHasSubscription(Boolean(data.subscription));
      setTelegramExpiresAt(data.subscription?.subscription_expires_at ?? null);
      setTelegramLinked(Boolean(data.subscription?.telegram_linked));
      setAccountEmail(data.account_email ?? null);
    } catch (err) {
      console.error("Erreur chargement abonnement Telegram:", err);
    }
  }, []);

  const fetchCourses = useCallback(async (token: string) => {
      try {
    const res = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });
        if (!res.ok) {
          console.error("Erreur chargement cours:", res.status);
          return;
        }
    const data = await res.json();
        setCourses(data || []);
        if (data && data.length > 0) setSelectedCourse(data[0].id);
      } catch (err) {
        console.error("Erreur réseau lors du chargement des cours:", err);
      }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur session:", sessionError);
          setError("Erreur de session. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
      const token = data.session?.access_token ?? null;
      setSessionToken(token);
        
      if (!token) {
        setLoading(false);
        setError("Connecte-toi pour voir tes cours.");
        return;
      }
        
        // Vérifier que le token n'est pas expiré
        const expiresAt = data.session?.expires_at;
        if (expiresAt && expiresAt * 1000 < Date.now()) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
          await supabase.auth.signOut();
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }
        
      await Promise.all([
        fetchOrders(token),
        fetchCourses(token),
        fetchAccessGrants(token),
        fetchTelegramSubscription(token),
      ]);
      setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement des données.");
        setLoading(false);
      }
    };
    
    load();
    
    // Écouter les changements de session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setSessionToken(null);
        setOrders([]);
        setAccessGrants([]);
        setCourses([]);
        setError("Vous avez été déconnecté.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Recharger les données si la session change
        load();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders, fetchCourses, fetchAccessGrants, fetchTelegramSubscription]);

  // Fonction pour créer une commande (actuellement commentée dans le JSX)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createOrder = async () => {
    if (!sessionToken) return;
    if (!selectedCourse) {
      setError("Choisis un cours");
      return;
    }
    setError(null);
    setMessage(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: selectedCourse }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Erreur lors de la création de la commande");
      return;
    }
    setMessage("Commande créée. Attends la validation admin.");
    await fetchOrders(sessionToken);
  };

  const handleLogout = async () => {
    try {
      // Nettoyer l'état local d'abord
      setSessionToken(null);
      setOrders([]);
      setAccessGrants([]);
      setCourses([]);
      
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

  const handleTelegramAccess = async () => {
    if (!sessionToken) return;
    setTelegramOpening(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const hint = typeof data.hint === "string" ? ` ${data.hint}` : "";
        const emailNote =
          typeof data.account_email === "string"
            ? ` (compte connecté : ${data.account_email})`
            : accountEmail
              ? ` (compte connecté : ${accountEmail})`
              : "";
        setError((data.error || "Impossible d'ouvrir l'accès Telegram.") + emailNote + hint);
        return;
      }
      if (typeof data.bot_url === "string") {
        window.open(data.bot_url, "_blank", "noopener,noreferrer");
        setMessage("Ouvrez Telegram, appuyez sur Démarrer, puis utilisez le lien personnel envoyé par le bot.");
      }
    } catch {
      setError("Erreur de connexion lors de l'accès Telegram.");
    } finally {
      setTelegramOpening(false);
    }
  };

  // Combiner les cours payés (orders avec status=paid) et les accès accordés
  const paidCourses = orders.filter((o) => o.status === "paid").map((o) => o.courses).filter(Boolean) as Course[];
  const grantedCourses = accessGrants.map((a) => a.courses).filter(Boolean) as Course[];
  
  // Récupérer les IDs uniques des cours accessibles
  const allAccessibleCoursesIds = new Set([
    ...paidCourses.map((c) => c?.id).filter(Boolean),
    ...grantedCourses.map((c) => c?.id).filter(Boolean),
  ]) as Set<string>;
  
  // Enrichir les cours avec les données complètes depuis la liste des cours
  // Prioriser les cours depuis accessGrants/orders car ils ont les course_videos avec les vraies URLs
  const allAccessibleCourses = Array.from(allAccessibleCoursesIds)
    .map((courseId) => {
      // Prioriser les cours depuis accessGrants/orders car ils ont les course_videos complets
      const fromGranted = grantedCourses.find((c) => c?.id === courseId);
      const fromPaid = paidCourses.find((c) => c?.id === courseId);
      
      // Si on a un cours depuis accessGrants ou orders, l'utiliser (il a les course_videos)
      if (fromGranted || fromPaid) {
        return fromGranted || fromPaid;
      }
      
      // Sinon, utiliser le cours depuis la liste générale (mais il n'aura pas les URLs des vidéos)
      const fullCourse = courses.find((c) => c.id === courseId);
      return fullCourse;
    })
    .filter(Boolean) as Course[];

  const hasNasongonCourseAccess = allAccessibleCourses.some((course) =>
    course.title.toLowerCase().includes("nasongon"),
  );

  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;

  const paymentsList = (
    <div className="flex flex-col gap-2.5">
      {orders.length === 0 && (
        <p className="text-sm text-neutral-500 px-1">Aucun paiement pour le moment.</p>
      )}
      {orders.map((order) => {
        const course = order.courses;
        const amount = course?.price;
        const dateSource = order.paid_at || order.created_at;
        return (
          <div
            key={order.id}
            className="rounded-xl border border-neutral-200 bg-white p-3 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-2">
                {course?.title ?? "Cours"}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${orderStatusClass(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {new Date(dateSource).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {" · "}
              {paymentMethodLabel(order.payment_method)}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-800">
                {amount != null ? `${Number(amount).toLocaleString("fr-FR")} F CFA` : "—"}
              </p>
              <p className="text-[10px] text-neutral-400 font-mono">
                {order.id.slice(0, 8)}…
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="layout-shell py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Espace client</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            className="pill-neutral text-sm lg:hidden"
            onClick={() => setPaymentsSidebarOpen(true)}
          >
            Paiements{orders.length > 0 ? ` (${orders.length})` : ""}
          </button>
          <Link href="/services/strategie-nasongon" className="pill-neutral text-sm sm:text-base">
            Accueil
          </Link>
          <button
            type="button"
            className="button-primary cta-pulse text-sm sm:text-base"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
      {loading && <p className="text-sm sm:text-base text-neutral-600">Chargement...</p>}
      {error && <p className="text-sm sm:text-base text-red-600 font-medium px-4 py-3 bg-red-50 border border-red-200 rounded-lg">{error}</p>}
      {message && <p className="text-sm sm:text-base text-green-700 font-medium px-4 py-3 bg-green-50 border border-green-200 rounded-lg">{message}</p>}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Contenu principal */}
        <div className="min-w-0 flex-1 space-y-6 w-full">
          {hasNasongonCourseAccess && (
            <section className="card p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TelegramIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">Communauté formation</h2>
                  <p className="text-sm sm:text-base text-neutral-600 mt-1">
                    Rejoins le groupe Telegram réservé aux élèves de la Stratégie Nasongon pour échanger avec les autres
                    traders et bénéficier du coaching collectif.
                  </p>
                </div>
              </div>
              <a
                href={NASONGON_COURSE_COMMUNITY_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-center"
              >
                <TelegramIcon className="w-5 h-5" />
                Rejoindre le groupe Telegram
              </a>
            </section>
          )}

          <section className="card p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">Mes cours</h2>
            <div className="grid gap-4">
              {allAccessibleCourses.length === 0 && (
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">Aucun cours accessible. Si vous avez payez veuillez patientez qu&apos;un admin t&apos;accorde l&apos;accès.</p>
              )}
              {allAccessibleCourses.map((course) => {
                let videosFromJson: Array<{ title: string; video_url: string; position: number }> = [];

                if (course.video_url) {
                  if (Array.isArray(course.video_url)) {
                    videosFromJson = course.video_url;
                  } else if (typeof course.video_url === "string") {
                    try {
                      const parsed = JSON.parse(course.video_url);
                      videosFromJson = Array.isArray(parsed) ? parsed : [];
                    } catch {
                      // Ignore
                    }
                  }
                }

                const videosFromTable = course.course_videos || [];
                const allVideos = [
                  ...videosFromJson.map((v, index) => ({
                    id: `json-${course.id}-vid-${index}`,
                    title: v.title || `Vidéo ${index + 1}`,
                    video_url: v.video_url,
                    position: v.position ?? index,
                  })),
                  ...videosFromTable.map((v, index) => ({
                    id: `table-${course.id}-${v.id}-${index}`,
                    title: v.title,
                    video_url: v.video_url,
                    position: v.position,
                  })),
                ];

                const uniqueVideos = allVideos.filter((video, index, self) =>
                  index === self.findIndex((v) => {
                    if (v.id === video.id) return true;
                    if (v.title === video.title && v.position === video.position) return true;
                    return false;
                  })
                );

                const videosWithUniqueIds = uniqueVideos.map((video, finalIndex) => ({
                  ...video,
                  id: `${video.id}-idx${finalIndex}`,
                }));

                const sortedVideos = [...videosWithUniqueIds].sort((a, b) => a.position - b.position);

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-neutral-200 p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base sm:text-lg text-neutral-900 leading-tight">{course.title}</h3>
                    </div>
                    {sortedVideos.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm sm:text-base font-semibold text-neutral-800">
                          {sortedVideos.length} vidéo{sortedVideos.length > 1 ? "s" : ""} disponible{sortedVideos.length > 1 ? "s" : ""}:
                        </p>
                        <div className="grid gap-2.5 sm:gap-3">
                          {sortedVideos.map((video) => (
                            <Link
                              key={video.id}
                              href={`/course/${course.id}/video/${video.id}`}
                              className="button-secondary w-full text-left px-4 py-3 sm:px-5 sm:py-3.5"
                            >
                              <span className="font-semibold text-base sm:text-sm text-brand block leading-snug">{video.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-neutral-600">Aucune vidéo disponible pour ce cours.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TelegramIcon className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">VIP</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">Canal privé — signaux</h2>
                {telegramActive ? (
                  <p className="text-sm sm:text-base text-neutral-600 mt-1">
                    Accès actif
                    {telegramExpiresAt
                      ? ` jusqu'au ${new Date(telegramExpiresAt).toLocaleDateString("fr-FR")}`
                      : ""}
                    . Cliquez ci-dessous pour ouvrir le bot et recevoir votre lien personnel vers le canal VIP.
                  </p>
                ) : telegramHasSubscription ? (
                  <p className="text-sm sm:text-base text-neutral-600 mt-1">
                    Abonnement expiré
                    {telegramExpiresAt
                      ? ` depuis le ${new Date(telegramExpiresAt).toLocaleDateString("fr-FR")}`
                      : ""}
                    . Renouvelez pour {VIP_RENEWAL_AMOUNT.toLocaleString("fr-FR")} F CFA / mois.
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-neutral-600 mt-1">
                    Adhésion {VIP_ADHESION_AMOUNT.toLocaleString("fr-FR")} F CFA (1er mois inclus), puis{" "}
                    {VIP_RENEWAL_AMOUNT.toLocaleString("fr-FR")} F CFA / mois.
                  </p>
                )}
                {accountEmail && telegramActive && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Compte site : <span className="font-medium">{accountEmail}</span> — l&apos;admin doit valider avec cet
                    email exact.
                  </p>
                )}
                {telegramLinked && telegramActive && (
                  <p className="text-xs text-green-700 mt-1">Compte Telegram déjà lié — vous pouvez regénérer un lien si besoin.</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {telegramActive && (
                <button
                  type="button"
                  onClick={handleTelegramAccess}
                  disabled={telegramOpening}
                  className="button-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-center disabled:opacity-60"
                >
                  <TelegramIcon className="w-5 h-5" />
                  {telegramOpening ? "Ouverture..." : "Accès canal VIP"}
                </button>
              )}
              <Link
                href="/vip/checkout"
                className={`${telegramActive ? "button-secondary" : "button-primary"} w-full sm:w-auto inline-flex items-center justify-center gap-2 text-center`}
              >
                <TelegramIcon className="w-5 h-5" />
                {telegramHasSubscription
                  ? `Renouveler — ${VIP_RENEWAL_AMOUNT.toLocaleString("fr-FR")} F`
                  : `Adhérer — ${VIP_ADHESION_AMOUNT.toLocaleString("fr-FR")} F`}
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar paiements — desktop */}
        <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
          <div className="sticky top-6 card overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="border-b border-neutral-200 px-4 py-4 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Historique</p>
              <h2 className="text-lg font-semibold text-neutral-900 mt-0.5">Mes paiements</h2>
              {orders.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {paidOrdersCount} payé{paidOrdersCount > 1 ? "s" : ""} · {orders.length} total
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0">
              {paymentsList}
            </div>
          </div>
        </aside>
      </div>

      {/* Drawer paiements — mobile */}
      {paymentsSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fermer les paiements"
          onClick={() => setPaymentsSidebarOpen(false)}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 right-0 z-50 w-[min(340px,92vw)] p-3 transition-transform lg:hidden",
          paymentsSidebarOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="card h-full flex flex-col overflow-hidden">
          <div className="border-b border-neutral-200 px-4 py-4 flex items-start justify-between gap-2 shrink-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Historique</p>
              <h2 className="text-lg font-semibold text-neutral-900 mt-0.5">Mes paiements</h2>
              {orders.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {paidOrdersCount} payé{paidOrdersCount > 1 ? "s" : ""} · {orders.length} total
                </p>
              )}
            </div>
            <button
              type="button"
              className="pill-neutral text-xs px-2.5 py-1"
              onClick={() => setPaymentsSidebarOpen(false)}
            >
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {paymentsList}
          </div>
        </div>
      </aside>
    </div>
  );
}
