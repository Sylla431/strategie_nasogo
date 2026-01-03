"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  price: number;
  cover_url: string | null;
  video_url?: Array<{ title: string; video_url: string; position: number }> | null;
  course_videos?: CourseVideo[];
};

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role?: string | null;
};

type Order = {
  id: string;
  status: string;
  payment_method: string;
  created_at: string;
  user_id: string;
  courses?: Course;
  users_profile?: UserProfile;
};

type CourseAccess = {
  id: string;
  user_id: string;
  course_id: string;
  granted_by: string | null;
  granted_at: string;
  courses?: Course;
  users_profile?: UserProfile;
};

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseAccesses, setCourseAccesses] = useState<CourseAccess[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [newCourse, setNewCourse] = useState({ title: "", price: 0, cover_url: "", video_url: [] as Array<{ title: string; video_url: string; position: number }> });
  const [tempVideo, setTempVideo] = useState({ title: "", video_url: "", position: 0 });
  const [grantAccessEmail, setGrantAccessEmail] = useState("");
  const [grantAccessCourseId, setGrantAccessCourseId] = useState<string>("");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; video_url: string } | null>(null);
  const [selectedCourseForVideos, setSelectedCourseForVideos] = useState<string>("");
  const [newVideo, setNewVideo] = useState({ title: "", video_url: "", position: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // États pour l'envoi d'emails promotionnels
  const [emailPromoData, setEmailPromoData] = useState({
    promoEndDate: "",
    promoPrice: "27 500 F CFA",
    originalPrice: "39 700 F CFA",
    productName: "Stratégie Nasongon",
    productUrl: "https://vbsniperacademie.com/services/strategie-nasongon",
    testEmail: "",
  });
  const [sendingEmails, setSendingEmails] = useState(false);
  const [exportedEmails, setExportedEmails] = useState<string>("");
  const [exportingEmails, setExportingEmails] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const loadOrders = async (tok: string) => {
    const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${tok}` } });
    if (!res.ok) return setError("Erreur chargement commandes");
    const data = await res.json();
    setOrders(data);
  };

  const loadCourses = async (tok: string) => {
    const res = await fetch("/api/courses", { headers: { Authorization: `Bearer ${tok}` } });
    if (!res.ok) return;
    const data = await res.json();
    setCourses(data);
  };

  const loadCourseAccesses = async (tok: string) => {
    try {
      const res = await fetch("/api/access", { headers: { Authorization: `Bearer ${tok}` } });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Erreur inconnue" }));
        console.error("Erreur chargement accès:", res.status, errorData);
        setError(`Erreur chargement accès: ${errorData.error || res.status}`);
        return;
      }
      const data = await res.json();
      console.log("Accès chargés:", data);
      setCourseAccesses(data || []);
    } catch (err) {
      console.error("Erreur réseau lors du chargement des accès:", err);
      setError("Erreur de connexion lors du chargement des accès.");
    }
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const tok = data.session?.access_token ?? null;
      const userId = data.session?.user?.id ?? null;
      setToken(tok);
      if (!tok) {
        setError("Connecte-toi en admin.");
        setLoading(false);
        return;
      }
      if (!userId) {
        setError("Session invalide (userId manquant).");
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("users_profile")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (!profile) {
        const { error: upErr } = await supabase.from("users_profile").upsert({ id: userId });
        if (upErr) {
          setError(`Erreur création profil: ${upErr.message}`);
          setLoading(false);
          return;
        }
      }
      const { data: profile2, error: roleErr } = await supabase
        .from("users_profile")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (roleErr) {
        setError(`Erreur lecture rôle: ${roleErr.message}`);
        setLoading(false);
        return;
      }
      const roleVal =
        (profile2?.role && typeof profile2.role === "string"
          ? profile2.role.trim().toLowerCase()
          : null) ?? null;
      setRole(roleVal);
      if (roleVal !== "admin") {
        setError("Accès admin requis.");
        setLoading(false);
        return;
      }
      await Promise.all([loadOrders(tok), loadCourses(tok), loadCourseAccesses(tok)]);
      setLoading(false);
    };
    load();
  }, []);

  // Fonction pour marquer une commande comme payée (non utilisée actuellement)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _markPaid = async (id: string) => {
    if (!token) return;
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/orders/${id}/pay`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Erreur validation paiement");
      return;
    }
    setMessage("Paiement validé et accès accordé.");
    await loadOrders(token);
  };

  const addVideoToNewCourse = () => {
    if (!tempVideo.title || !tempVideo.video_url) {
      setError("Titre et URL vidéo requis");
      return;
    }
    setNewCourse((c) => ({
      ...c,
      video_url: [...c.video_url, { ...tempVideo }],
    }));
    setTempVideo({ title: "", video_url: "", position: newCourse.video_url.length });
  };

  const removeVideoFromNewCourse = (index: number) => {
    setNewCourse((c) => ({
      ...c,
      video_url: c.video_url.filter((_, i) => i !== index),
    }));
  };

  const createCourse = async () => {
    if (!token) return;
    setError(null);
    setMessage(null);
    
    // Créer le cours avec la liste de vidéos
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Erreur création cours");
      return;
    }
    
    setMessage(`Cours créé${newCourse.video_url.length > 0 ? ` avec ${newCourse.video_url.length} vidéo${newCourse.video_url.length > 1 ? "s" : ""}` : ""}`);
    setNewCourse({ title: "", price: 0, cover_url: "", video_url: [] });
    setTempVideo({ title: "", video_url: "", position: 0 });
    await loadCourses(token);
  };


  const grantAccess = async () => {
    if (!token || !grantAccessEmail || !grantAccessCourseId) {
      setError("Email et cours requis");
      return;
    }
    setError(null);
    setMessage(null);
    const res = await fetch("/api/access", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: grantAccessEmail, course_id: grantAccessCourseId }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Erreur attribution accès");
      return;
    }
    setMessage(`Accès accordé à ${grantAccessEmail}`);
    setGrantAccessEmail("");
    setGrantAccessCourseId("");
    // Recharger les accès après attribution
    if (token) await loadCourseAccesses(token);
  };

  const addVideoToCourse = async () => {
    if (!token || !selectedCourseForVideos || !newVideo.title || !newVideo.video_url) {
      setError("Cours, titre et URL vidéo requis");
      return;
    }
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/courses/${selectedCourseForVideos}/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newVideo.title,
        video_url: newVideo.video_url,
        position: newVideo.position || 0,
      }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Erreur ajout vidéo");
      return;
    }
    setMessage("Vidéo ajoutée au cours avec succès");
    setNewVideo({ title: "", video_url: "", position: 0 });
    await loadCourses(token);
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const loadEmailTemplate = async () => {
    if (!emailPromoData.promoEndDate) {
      setError("Date de fin de promotion requise pour générer le template");
      return;
    }

    setLoadingTemplate(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        promoEndDate: emailPromoData.promoEndDate,
        promoPrice: emailPromoData.promoPrice,
        originalPrice: emailPromoData.originalPrice,
        productName: emailPromoData.productName,
        productUrl: emailPromoData.productUrl,
      });

      const res = await fetch(`/api/email/get-template?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la génération du template");
        return;
      }

      setEmailTemplate(data.html);
      setMessage("✅ Template généré avec succès ! Copiez le HTML ci-dessous.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du template");
    } finally {
      setLoadingTemplate(false);
    }
  };

  const exportEmails = async () => {
    if (!token) {
      setError("Token manquant");
      return;
    }

    setExportingEmails(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/users/export-emails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'export des emails");
        return;
      }

      setExportedEmails(data.emails);
      setMessage(`✅ ${data.total} emails exportés avec succès ! Copiez la liste ci-dessous.`);
      
      // Télécharger le CSV
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `emails_utilisateurs_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'export");
    } finally {
      setExportingEmails(false);
    }
  };

  const sendPromoEmails = async (testMode = false) => {
    if (!token) {
      setError("Token manquant");
      return;
    }

    if (!emailPromoData.promoEndDate) {
      setError("Date de fin de promotion requise");
      return;
    }

    if (testMode && !emailPromoData.testEmail) {
      setError("Email de test requis");
      return;
    }

    setSendingEmails(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/email/send-promo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emailPromoData,
          testEmail: testMode ? emailPromoData.testEmail : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi des emails");
        return;
      }

      setMessage(
        testMode
          ? `Email de test envoyé avec succès à ${emailPromoData.testEmail}`
          : `Emails envoyés : ${data.successCount} réussis, ${data.failureCount} échoués sur ${data.total}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSendingEmails(false);
    }
  };

  const getAllVideosForCourse = (course: Course): Array<{ title: string; video_url: string; position: number; source: string }> => {
    const videos: Array<{ title: string; video_url: string; position: number; source: string }> = [];
    
    // Vidéos depuis course_videos (table)
    if (course.course_videos && course.course_videos.length > 0) {
      course.course_videos.forEach((v) => {
        videos.push({
          title: v.title,
          video_url: v.video_url,
          position: v.position,
          source: "table",
        });
      });
    }
    
    // Vidéos depuis video_url (JSONB)
    if (course.video_url && Array.isArray(course.video_url)) {
      course.video_url.forEach((v) => {
        videos.push({
          title: v.title || "Sans titre",
          video_url: v.video_url,
          position: v.position ?? 999,
          source: "jsonb",
        });
      });
    }
    
    // Trier par position
    return videos.sort((a, b) => a.position - b.position);
  };

  return (
    <div className="layout-shell py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard admin</h1>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      {role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Créer un cours</h2>
            <div className="grid gap-3">
              <input
                className="form-control"
                placeholder="Titre"
                value={newCourse.title}
                onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Prix (F CFA)"
                value={newCourse.price}
                onChange={(e) => setNewCourse((c) => ({ ...c, price: Number(e.target.value) }))}
              />
              <input
                className="form-control"
                placeholder="Cover URL"
                value={newCourse.cover_url}
                onChange={(e) => setNewCourse((c) => ({ ...c, cover_url: e.target.value }))}
              />
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Ajouter des vidéos au cours</h3>
                <div className="grid gap-3 mb-3">
                  <input
                    className="form-control"
                    placeholder="Titre de la vidéo"
                    value={tempVideo.title}
                    onChange={(e) => setTempVideo((v) => ({ ...v, title: e.target.value }))}
                  />
                  <input
                    className="form-control"
                    placeholder="URL vidéo (Vimeo/MP4)"
                    value={tempVideo.video_url}
                    onChange={(e) => setTempVideo((v) => ({ ...v, video_url: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Position (ordre)"
                      value={tempVideo.position}
                      onChange={(e) => setTempVideo((v) => ({ ...v, position: Number(e.target.value) }))}
                    />
                    <button
                      type="button"
                      className="button-secondary whitespace-nowrap"
                      onClick={addVideoToNewCourse}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                
                {newCourse.video_url.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium">Vidéos à ajouter ({newCourse.video_url.length}):</p>
                    {newCourse.video_url.map((video, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded bg-neutral-50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{video.title}</p>
                          <p className="text-xs text-neutral-600 truncate">{video.video_url}</p>
                        </div>
                        <span className="text-xs text-neutral-500 mr-2">Pos: {video.position}</span>
                        <button
                          type="button"
                          onClick={() => removeVideoFromNewCourse(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="button-primary w-full sm:w-auto" onClick={createCourse}>
                Créer le cours{newCourse.video_url.length > 0 ? ` avec ${newCourse.video_url.length} vidéo${newCourse.video_url.length > 1 ? "s" : ""}` : ""}
              </button>
            </div>
          </section>

          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Ajouter des vidéos à un cours existant</h2>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Sélectionner un cours</label>
                <select
                  className="form-control"
                  value={selectedCourseForVideos}
                  onChange={(e) => {
                    setSelectedCourseForVideos(e.target.value);
                    setNewVideo({ title: "", video_url: "", position: 0 });
                  }}
                >
                  <option value="">-- Choisir un cours --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCourseForVideos && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Vidéos existantes</h3>
                    {(() => {
                      const course = courses.find((c) => c.id === selectedCourseForVideos);
                      const allVideos = course ? getAllVideosForCourse(course) : [];
                      return allVideos.length > 0 ? (
                        <div className="space-y-2">
                          {allVideos.map((video, index) => (
                            <div
                              key={`${course?.id}-${index}-${video.source}`}
                              className="flex items-center justify-between p-2 border rounded bg-neutral-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{video.title}</p>
                                <p className="text-xs text-neutral-600 truncate">{video.video_url}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-neutral-500">Pos: {video.position}</span>
                                <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                                  {video.source === "table" ? "Table" : "JSONB"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-600">Aucune vidéo pour ce cours.</p>
                      );
                    })()}
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Ajouter une nouvelle vidéo</h3>
                    <div className="grid gap-3">
                      <input
                        className="form-control"
                        placeholder="Titre de la vidéo"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo((v) => ({ ...v, title: e.target.value }))}
                      />
                      <input
                        className="form-control"
                        placeholder="URL vidéo (Vimeo/MP4)"
                        value={newVideo.video_url}
                        onChange={(e) => setNewVideo((v) => ({ ...v, video_url: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Position (ordre)"
                          value={newVideo.position}
                          onChange={(e) => setNewVideo((v) => ({ ...v, position: Number(e.target.value) }))}
                        />
                        <button
                          className="button-primary whitespace-nowrap"
                          onClick={addVideoToCourse}
                          disabled={!newVideo.title || !newVideo.video_url}
                        >
                          Ajouter la vidéo
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Donner accès à un cours (Orange Money)</h2>
            <div className="grid gap-3">
              <input
                className="form-control"
                type="email"
                placeholder="Email de l'utilisateur"
                value={grantAccessEmail}
                onChange={(e) => setGrantAccessEmail(e.target.value)}
              />
              <select
                className="form-control"
                value={grantAccessCourseId}
                onChange={(e) => setGrantAccessCourseId(e.target.value)}
              >
                <option value="">-- Choisir un cours --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button className="button-primary w-full sm:w-auto" onClick={grantAccess}>
                Accorder l&apos;accès
              </button>
            </div>
          </section>
          </div>

          <div className="space-y-6">
          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Liste des cours et vidéos</h2>
            <div className="space-y-3">
              {courses.length === 0 && <p className="text-neutral-600">Aucun cours.</p>}
              {courses.map((course) => {
                const allVideos = getAllVideosForCourse(course);
                const isExpanded = expandedCourses.has(course.id);
                
                return (
                  <div key={course.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {course.cover_url && (
                          <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border border-neutral-200">
                            <Image
                              src={course.cover_url}
                              alt={course.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold truncate">{course.title}</p>
                          <p className="text-sm text-neutral-600">
                            {course.price.toLocaleString("fr-FR")} F CFA • {allVideos.length} vidéo{allVideos.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                        {allVideos.length === 0 ? (
                          <p className="text-sm text-neutral-600">Aucune vidéo pour ce cours.</p>
                        ) : (
                          <div className="space-y-2">
                            {allVideos.map((video, index) => (
                              <div
                                key={`${course.id}-${index}-${video.source}`}
                                className="flex items-start gap-3 p-3 bg-white rounded border border-neutral-200 hover:border-brand transition-colors cursor-pointer"
                                onClick={() => setSelectedVideo({ title: video.title, video_url: video.video_url })}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-neutral-900">{video.title}</p>
                                    <svg
                                      className="w-4 h-4 text-brand flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs text-neutral-600 truncate mt-1">{video.video_url}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-neutral-500">Position: {video.position}</span>
                                    <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                                      {video.source === "table" ? "Table" : "JSONB"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-4 sm:p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-xl font-semibold text-neutral-900">Utilisateurs avec accès aux cours</h2>
              {courseAccesses.length > 0 && (() => {
                // Exclure les admins du calcul (ils n'ont pas payé)
                const nonAdminAccesses = courseAccesses.filter(
                  (access) => access.users_profile?.role !== 'admin'
                );
                
                // Trier les accès par date d'accès accordé (les plus anciens en premier)
                const sortedAccesses = [...nonAdminAccesses].sort((a, b) => 
                  new Date(a.granted_at).getTime() - new Date(b.granted_at).getTime()
                );
                
                // Calculer le total : 10 premiers = 25000, les autres = 27500
                const total = sortedAccesses.reduce((sum, access, index) => {
                  const price = index < 10 ? 25000 : 27500;
                  return sum + price;
                }, 0);
                
                return (
                  <div className="bg-brand/10 border border-brand/20 rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                    <p className="text-xs sm:text-sm text-neutral-600 mb-1">Total</p>
                    <p className="text-lg sm:text-base font-bold text-brand">
                      {total.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                );
              })()}
            </div>
            
            {/* Barre de recherche */}
            {courseAccesses.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone ou cours..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="form-control w-full pl-10 pr-4"
                />
                {/* <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg> */}
              </div>
            )}

            {/* Filtrer les résultats */}
            {(() => {
              // Exclure les admins du calcul (ils n'ont pas payé)
              const nonAdminAccesses = courseAccesses.filter(
                (access) => access.users_profile?.role !== 'admin'
              );
              
              // Trier les accès par date d'accès accordé (les plus anciens en premier)
              const sortedAccesses = [...nonAdminAccesses].sort((a, b) => 
                new Date(a.granted_at).getTime() - new Date(b.granted_at).getTime()
              );
              
              // Créer un map pour obtenir le prix de chaque accès
              const accessPriceMap = new Map<string, number>();
              sortedAccesses.forEach((access, index) => {
                accessPriceMap.set(access.id, index < 10 ? 25000 : 27500);
              });
              
              const filteredAccesses = sortedAccesses.filter((access) => {
                if (!searchUserQuery.trim()) return true;
                
                const query = searchUserQuery.toLowerCase();
                const user = access.users_profile;
                const course = access.courses;
                
                const fullName = user?.full_name?.toLowerCase() || "";
                const email = user?.email?.toLowerCase() || "";
                const phone = user?.phone?.toLowerCase() || "";
                const courseTitle = course?.title?.toLowerCase() || "";
                
                return (
                  fullName.includes(query) ||
                  email.includes(query) ||
                  phone.includes(query) ||
                  courseTitle.includes(query)
                );
              });

              return filteredAccesses.length === 0 ? (
                <p className="text-sm sm:text-base text-neutral-600">
                  {courseAccesses.length === 0
                    ? "Aucun utilisateur n'a encore accès à un cours."
                    : "Aucun résultat trouvé pour votre recherche."}
                </p>
              ) : (
                <>
                  {/* Afficher le total si on filtre */}
                  {searchUserQuery.trim() && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                      <p className="text-xs sm:text-sm text-neutral-600 mb-1">
                        Total des revenus ({filteredAccesses.length} accès)
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-brand">
                        {filteredAccesses.reduce((sum, access) => {
                          const price = accessPriceMap.get(access.id) || 27500;
                          return sum + price;
                        }, 0).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  )}
                  <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredAccesses.map((access) => {
                      const user = access.users_profile;
                      const course = access.courses;
                      const price = accessPriceMap.get(access.id) || 27500;
                      const isEarlyBird = price === 25000;
                    return (
                      <div
                        key={access.id}
                        className="border border-neutral-200 rounded-lg p-3 sm:p-4 bg-white hover:border-brand/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm sm:text-base text-neutral-900 truncate">
                                  {user?.full_name || user?.email || "Utilisateur"}
                                </p>
                                <p className="text-xs sm:text-sm text-neutral-600 break-all mt-1">
                                  {user?.email || "Email non disponible"}
                                </p>
                                {user?.phone && (
                                  <p className="text-xs text-neutral-500 mt-1">{user.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-neutral-100">
                              <p className="text-xs sm:text-sm font-medium text-neutral-700">
                                Accès au cours :
                              </p>
                              <p className="text-sm sm:text-base font-semibold text-brand mt-1">
                                {course?.title || "Cours supprimé"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-sm sm:text-base font-semibold text-neutral-900">
                                  {price.toLocaleString("fr-FR")} FCFA
                                </p>
                                {isEarlyBird && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                    Précommande 
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                Accès accordé le {new Date(access.granted_at).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </>
              );
            })()}
          </section>

          {/* Section Envoi d'emails promotionnels */}
          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">📧 Envoyer un email promotionnel</h2>
            <p className="text-sm text-neutral-600">
              Envoyer un email à tous les utilisateurs inscrits pour les informer que la promotion se termine bientôt.
            </p>
            
            {/* Export des emails et template pour Resend */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold">Option : Utiliser l&apos;interface Resend</h3>
              <p className="text-xs text-neutral-600">
                Si vous préférez utiliser l&apos;interface web de Resend, vous pouvez exporter la liste des emails et le template HTML ici.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={exportEmails}
                  disabled={exportingEmails}
                  className="button-secondary"
                >
                  {exportingEmails ? "Export..." : "📥 Exporter les emails"}
                </button>
                <button
                  type="button"
                  onClick={loadEmailTemplate}
                  disabled={loadingTemplate || !emailPromoData.promoEndDate}
                  className="button-secondary"
                >
                  {loadingTemplate ? "Génération..." : "📄 Générer le template"}
                </button>
              </div>
              
              {exportedEmails && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium">Emails (copiez dans Resend) :</label>
                  <textarea
                    readOnly
                    value={exportedEmails}
                    className="form-control h-24 text-xs font-mono"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <p className="text-xs text-neutral-500">
                    💡 Dans Resend, créez un nouveau Broadcast, collez cette liste dans le champ &quot;To&quot; (séparés par des virgules).
                  </p>
                </div>
              )}
              
              {emailTemplate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium">Template HTML (copiez dans Resend) :</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(emailTemplate);
                        setMessage("✅ Template copié dans le presse-papiers !");
                      }}
                      className="text-xs button-secondary px-2 py-1"
                    >
                      📋 Copier
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={emailTemplate}
                    className="form-control h-64 text-xs font-mono"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <p className="text-xs text-neutral-500">
                    💡 Dans Resend, créez un nouveau Broadcast, allez dans &quot;HTML&quot; et collez ce template. Vous pouvez ensuite le personnaliser avec l&apos;éditeur visuel.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Option : Envoyer via l&apos;API (automatique)</h3>
              
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de fin de promotion *</label>
                <input
                  type="date"
                  className="form-control"
                  value={emailPromoData.promoEndDate}
                  onChange={(e) => setEmailPromoData((d) => ({ ...d, promoEndDate: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix promotionnel</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailPromoData.promoPrice}
                    onChange={(e) => setEmailPromoData((d) => ({ ...d, promoPrice: e.target.value }))}
                    placeholder="27 500 F CFA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix original</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailPromoData.originalPrice}
                    onChange={(e) => setEmailPromoData((d) => ({ ...d, originalPrice: e.target.value }))}
                    placeholder="39 700 F CFA"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nom du produit</label>
                <input
                  type="text"
                  className="form-control"
                  value={emailPromoData.productName}
                  onChange={(e) => setEmailPromoData((d) => ({ ...d, productName: e.target.value }))}
                  placeholder="Stratégie Nasongon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL du produit</label>
                <input
                  type="url"
                  className="form-control"
                  value={emailPromoData.productUrl}
                  onChange={(e) => setEmailPromoData((d) => ({ ...d, productUrl: e.target.value }))}
                  placeholder="https://vbsniperacademie.com/services/strategie-nasongon"
                />
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold">Mode test (optionnel)</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Email de test</label>
                  <input
                    type="email"
                    className="form-control"
                    value={emailPromoData.testEmail}
                    onChange={(e) => setEmailPromoData((d) => ({ ...d, testEmail: e.target.value }))}
                    placeholder="test@example.com"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Si rempli, l&apos;email sera envoyé uniquement à cette adresse pour tester.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  {emailPromoData.testEmail && (
                    <button
                      type="button"
                      onClick={() => sendPromoEmails(true)}
                      disabled={sendingEmails}
                      className="button-secondary flex-1"
                    >
                      {sendingEmails ? "Envoi..." : "Envoyer un email de test"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => sendPromoEmails(false)}
                    disabled={sendingEmails}
                    className="button-primary flex-1"
                  >
                    {sendingEmails ? "Envoi en cours..." : "Envoyer à tous les utilisateurs"}
                  </button>
                </div>
              </div>
              </div>
            </div>
          </section>
          </div>
        </div>
      )}

      {/* Modal pour lire la vidéo */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              {(() => {
                const url = selectedVideo.video_url;
                // Vimeo
                if (url.includes("vimeo.com")) {
                  const vimeoIdMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
                  if (vimeoIdMatch) {
                    return (
                      <iframe
                        src={`https://player.vimeo.com/video/${vimeoIdMatch[1]}`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    );
                  }
                }
                // YouTube
                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                  let videoId = "";
                  if (url.includes("youtube.com/watch?v=")) {
                    videoId = url.split("v=")[1]?.split("&")[0] || "";
                  } else if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
                  } else if (url.includes("youtube.com/embed/")) {
                    videoId = url.split("embed/")[1]?.split("?")[0] || "";
                  }
                  if (videoId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    );
                  }
                }
                // Vidéo directe (MP4, etc.)
                return (
                  <video
                    src={url}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                );
              })()}
            </div>
            <div className="mt-4">
              <p className="text-sm text-neutral-600 break-all">{selectedVideo.video_url}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
