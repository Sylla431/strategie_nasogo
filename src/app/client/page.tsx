"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
  courses?: Course;
};

type CourseAccess = {
  id: string;
  course_id: string;
  granted_at: string;
  courses?: Course;
};

export default function ClientSpace() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accessGrants, setAccessGrants] = useState<CourseAccess[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        
        await Promise.all([fetchOrders(token), fetchCourses(token), fetchAccessGrants(token)]);
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
  }, [fetchOrders, fetchCourses, fetchAccessGrants]);

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

  return (
    <div className="layout-shell py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Espace client</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/" className="pill-neutral text-sm sm:text-base">
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

      {/* <section className="card p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Nouvelle commande (paiement en espèces)</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Cours</label>
            <select
              className="form-control"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} — {course.price.toLocaleString("fr-FR")} F CFA
                </option>
              ))}
            </select>
          </div>
          <button className="button-primary cta-pulse w-full sm:w-auto" onClick={createOrder}>
            Créer la commande
          </button>
        </div>
        <p className="text-sm text-neutral-600">
          Une fois la commande validée par l&apos;admin, tu verras le cours dans la liste ci-dessous.
        </p>
      </section> */}

      <section className="card p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">Mes cours</h2>
        <div className="grid gap-4">
          {allAccessibleCourses.length === 0 && (
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">Aucun cours accessible. Si vous avez payez veuillez patientez qu&apos;un admin t&apos;accorde l&apos;accès.</p>
          )}
          {allAccessibleCourses.map((course) => {
            // Utiliser video_url (JSONB) en priorité, sinon course_videos (table séparée)
            // video_url peut être un tableau JSONB, une string JSON, null ou undefined
            let videosFromJson: Array<{ title: string; video_url: string; position: number }> = [];
            
            if (course.video_url) {
              if (Array.isArray(course.video_url)) {
                videosFromJson = course.video_url;
              } else if (typeof course.video_url === "string") {
                // Si c'est une string JSON, la parser
                try {
                  const parsed = JSON.parse(course.video_url);
                  videosFromJson = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  // Ignore les erreurs de parsing
                }
              }
            }
            
            const videosFromTable = course.course_videos || [];
            
            // Combiner les deux sources et créer un format unifié
            // Utiliser des IDs uniques pour éviter les doublons
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
            
            // Supprimer les doublons basés sur l'ID ou le titre (pas sur video_url car elle peut être vide)
            const uniqueVideos = allVideos.filter((video, index, self) => 
              index === self.findIndex((v) => {
                // Si les IDs correspondent, c'est un doublon
                if (v.id === video.id) return true;
                // Si les titres correspondent et les positions aussi, c'est probablement un doublon
                if (v.title === video.title && v.position === video.position) return true;
                return false;
              })
            );
            
            // S'assurer que les IDs sont vraiment uniques en ajoutant un index final
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

      {/* <section className="card p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Mes commandes</h2>
        <div className="grid gap-4">
          {orders.length === 0 && <p className="text-neutral-600">Aucune commande.</p>}
          {orders.map((order) => {
            const course = order.courses;
            const isPaid = order.status === "paid";
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{course?.title ?? "Cours"}</p>
                  <span className="badge-soft text-brand">
                    {isPaid ? "Payé" : "En attente"} • {order.payment_method}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">
                  Commande du {new Date(order.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            );
          })}
        </div>
      </section> */}
    </div>
  );
}
