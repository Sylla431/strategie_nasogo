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

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ title: "", price: 0, cover_url: "", video_url: [] as Array<{ title: string; video_url: string; position: number }> });
  const [tempVideo, setTempVideo] = useState({ title: "", video_url: "", position: 0 });
  const [grantAccessEmail, setGrantAccessEmail] = useState("");
  const [grantAccessCourseId, setGrantAccessCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      await Promise.all([loadOrders(tok), loadCourses(tok)]);
      setLoading(false);
    };
    load();
  }, []);

  const markPaid = async (id: string) => {
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
  };

  return (
    <div className="layout-shell py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard admin</h1>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      {role === "admin" && (
        <>
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

          {/* <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Gérer les vidéos d&apos;un cours</h2>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Sélectionner un cours</label>
                <select
                  className="form-control"
                  value={selectedCourseForVideos || ""}
                  onChange={(e) => setSelectedCourseForVideos(e.target.value || null)}
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
                    {courses
                      .find((c) => c.id === selectedCourseForVideos)
                      ?.course_videos?.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 border rounded mb-2">
                          <div>
                            <p className="font-medium">{v.title}</p>
                            <p className="text-xs text-neutral-600">{v.video_url}</p>
                          </div>
                          <span className="text-xs text-neutral-500">Position: {v.position}</span>
                        </div>
                      ))}
                    {!courses.find((c) => c.id === selectedCourseForVideos)?.course_videos?.length && (
                      <p className="text-sm text-neutral-600">Aucune vidéo pour ce cours.</p>
                    )}
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Ajouter une vidéo</h3>
                    <input
                      className="form-control mb-2"
                      placeholder="Titre de la vidéo"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo((v) => ({ ...v, title: e.target.value }))}
                    />
                    <input
                      className="form-control mb-2"
                      placeholder="URL vidéo (Vimeo/MP4)"
                      value={newVideo.video_url}
                      onChange={(e) => setNewVideo((v) => ({ ...v, video_url: e.target.value }))}
                    />
                    <input
                      className="form-control mb-2"
                      type="number"
                      placeholder="Position (ordre)"
                      value={newVideo.position}
                      onChange={(e) => setNewVideo((v) => ({ ...v, position: Number(e.target.value) }))}
                    />
                    <button className="button-secondary w-full sm:w-auto" onClick={addVideoToCourse}>
                      Ajouter la vidéo
                    </button>
                  </div>
                </>
              )}
            </div>
          </section> */}

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

          <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Cours existants</h2>
            <div className="grid gap-3">
              {courses.length === 0 && <p className="text-neutral-600">Aucun cours.</p>}
              {courses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-sm text-neutral-600">{c.price.toLocaleString("fr-FR")} F CFA</p>
                    </div>
                    {c.cover_url && (
                      <div className="relative h-12 w-20 overflow-hidden rounded border border-neutral-200">
                        <Image
                          src={c.cover_url}
                          alt={c.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {c.course_videos && c.course_videos.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-neutral-600 mb-1">
                        {c.course_videos.length} vidéo{c.course_videos.length > 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {c.course_videos.map((v) => (
                          <span key={v.id} className="text-xs bg-neutral-100 px-2 py-1 rounded">
                            {v.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

         {/*  <section className="card p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Commandes</h2>
            <div className="grid gap-3">
              {orders.length === 0 && <p className="text-neutral-600">Aucune commande.</p>}
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{order.courses?.title ?? "Cours"}</p>
                    <span className="badge-soft">
                      {order.status} • {order.payment_method}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600 space-y-1">
                    {order.users_profile ? (
                      <>
                        <p>
                          <span className="font-semibold">Email:</span> {order.users_profile.email || order.user_id}
                        </p>
                        <p>
                          <span className="font-semibold">Nom complet:</span> {order.users_profile.full_name || "Non renseigné"}
                        </p>
                        <p>
                          <span className="font-semibold">Téléphone:</span> {order.users_profile.phone || "Non renseigné"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <span className="font-semibold">User ID:</span> {order.user_id}
                        </p>
                        <p className="text-xs text-red-600">Profil utilisateur non trouvé</p>
                      </>
                    )}
                    <p>
                      <span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {order.status !== "paid" && (
                    <button
                      className="button-secondary w-fit"
                      onClick={() => markPaid(order.id)}
                    >
                      Confirmer paiement
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section> */}
        </>
      )}
    </div>
  );
}
