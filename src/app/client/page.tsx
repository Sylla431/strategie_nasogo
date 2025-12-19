"use client";

import { useEffect, useState } from "react";
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

  const fetchOrders = async (token: string) => {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Impossible de charger les commandes");
      return;
    }
    const data = await res.json();
    setOrders(data);
  };

  const fetchAccessGrants = async (token: string) => {
    const res = await fetch("/api/access", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setAccessGrants(data);
  };

  const fetchCourses = async (token: string) => {
    const res = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setCourses(data);
    if (data.length > 0) setSelectedCourse(data[0].id);
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      setSessionToken(token);
      if (!token) {
        setLoading(false);
        setError("Connecte-toi pour voir tes cours.");
        return;
      }
      await Promise.all([fetchOrders(token), fetchCourses(token), fetchAccessGrants(token)]);
      setLoading(false);
    };
    load();
  }, []);

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
    await supabase.auth.signOut();
    window.location.href = "/";
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
  const allAccessibleCourses = Array.from(allAccessibleCoursesIds)
    .map((courseId) => {
      // Chercher dans les cours complets chargés (qui ont video_url)
      const fullCourse = courses.find((c) => c.id === courseId);
      if (fullCourse) return fullCourse;
      
      // Sinon, utiliser le cours depuis orders/accessGrants
      const fromPaid = paidCourses.find((c) => c?.id === courseId);
      const fromGranted = grantedCourses.find((c) => c?.id === courseId);
      return fromPaid || fromGranted;
    })
    .filter(Boolean) as Course[];

  return (
    <div className="layout-shell py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Espace client</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="pill-neutral">
            Accueil
          </Link>
          <button
            type="button"
            className="button-primary cta-pulse"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

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

      <section className="card p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Mes cours</h2>
        <div className="grid gap-4">
          {allAccessibleCourses.length === 0 && (
            <p className="text-neutral-600">Aucun cours accessible. Crée une commande ou attends qu&apos;un admin t&apos;accorde l&apos;accès.</p>
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
            
            // Supprimer les doublons basés sur video_url pour éviter les clés dupliquées
            const uniqueVideos = allVideos.filter((video, index, self) => 
              index === self.findIndex((v) => v.video_url === video.video_url)
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
                className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{course.title}</p>
                </div>
                {sortedVideos.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">
                      {sortedVideos.length} vidéo{sortedVideos.length > 1 ? "s" : ""} disponible{sortedVideos.length > 1 ? "s" : ""}:
                    </p>
                    <div className="grid gap-2">
                      {sortedVideos.map((video) => (
                        <Link
                          key={video.id}
                          href={`/course/${course.id}/video/${video.id}`}
                          className="button-secondary w-full text-left"
                        >
                          <span className="font-medium text-brand">{video.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">Aucune vidéo disponible pour ce cours.</p>
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
