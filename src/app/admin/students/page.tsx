"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type StudentSummary = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  courses_count: number;
  last_order_status: string | null;
  last_order_at: string | null;
  has_id_card_photo: boolean;
};

type StudentDetailResponse = {
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    id_card_photo_path: string | null;
    id_card_photo_signed_url: string | null;
  };
  accesses: Array<{
    id: string;
    course_id: string;
    granted_at: string;
    courses?: { id: string; title: string; price: number } | null;
  }>;
  orders: Array<{
    id: string;
    status: string;
    payment_method: string;
    created_at: string;
    paid_at?: string | null;
    courses?: { id: string; title: string; price: number } | null;
  }>;
};

const statusLabel: Record<string, string> = {
  paid: "Payé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    full_name: "",
    phone: "",
  });
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

  const debouncedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const loadStudents = async (currentToken: string, query = "") => {
    setStudentsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error || "Erreur lors du chargement des étudiants");
        return;
      }
      const data = (await res.json()) as StudentSummary[];
      setStudents(data || []);
    } catch {
      setError("Erreur réseau lors du chargement des étudiants");
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadStudentDetail = async (currentToken: string, studentId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setDetailError(b.error || "Erreur chargement profil étudiant");
        return;
      }
      const data = (await res.json()) as StudentDetailResponse;
      setSelectedStudentDetail(data);
    } catch {
      setDetailError("Erreur réseau lors du chargement du détail étudiant");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const currentToken = data.session?.access_token ?? null;
      const userId = data.session?.user?.id ?? null;
      setToken(currentToken);

      if (!currentToken || !userId) {
        setError("Connecte-toi en admin.");
        setLoading(false);
        return;
      }

      const { data: profile, error: roleErr } = await supabase
        .from("users_profile")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (roleErr) {
        setError(`Erreur lecture rôle: ${roleErr.message}`);
        setLoading(false);
        return;
      }

      const roleVal = typeof profile?.role === "string" ? profile.role.trim().toLowerCase() : null;
      setRole(roleVal);
      if (roleVal !== "admin") {
        setError("Accès admin requis.");
        setLoading(false);
        return;
      }

      await loadStudents(currentToken);
      const initialStudentId = new URLSearchParams(window.location.search).get("student");
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId);
        await loadStudentDetail(currentToken, initialStudentId);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!token || role !== "admin") return;
    void loadStudents(token, debouncedQuery);
  }, [debouncedQuery, token, role]);

  const openDetail = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentDetail(null);
    setDetailError(null);
    if (token) {
      void loadStudentDetail(token, studentId);
    }
    router.replace(`/admin/students?student=${studentId}`);
  };

  const closeDetail = () => {
    setSelectedStudentId(null);
    setSelectedStudentDetail(null);
    setDetailError(null);
    router.replace("/admin/students");
  };

  const handleCreateStudent = async () => {
    if (!token) return;

    setCreating(true);
    setError(null);
    setMessage(null);
    setCreatedTempPassword(null);

    try {
      let cardPath: string | null = null;
      if (cardFile) {
        const formData = new FormData();
        formData.append("file", cardFile);
        const uploadRes = await fetch("/api/students/upload-card", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          const b = await uploadRes.json().catch(() => ({}));
          setError(b.error || "Erreur upload photo de carte");
          setCreating(false);
          return;
        }
        const uploadData = (await uploadRes.json()) as { path: string };
        cardPath = uploadData.path;
      }

      const createRes = await fetch("/api/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createForm.email.trim() || null,
          full_name: createForm.full_name.trim() || null,
          phone: createForm.phone.trim() || null,
          id_card_photo_path: cardPath,
        }),
      });

      if (!createRes.ok) {
        const b = await createRes.json().catch(() => ({}));
        setError(b.error || "Erreur création étudiant");
        setCreating(false);
        return;
      }

      const created = (await createRes.json()) as { temp_password?: string | null };
      setCreatedTempPassword(created.temp_password ?? null);
      setMessage("Étudiant créé avec succès.");
      setCreateOpen(false);
      setCreateForm({ email: "", full_name: "", phone: "" });
      setCardFile(null);
      await loadStudents(token, searchQuery);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="layout-shell py-10">Chargement...</div>;
  }

  return (
    <div className="layout-shell py-10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gestion des étudiants</h1>
          <p className="text-sm text-neutral-600 mt-1">Liste, recherche, détail et création d&apos;étudiants.</p>
        </div>
        <div className="grid grid-cols-1 sm:flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button type="button" className="button-primary w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
            Ajouter un étudiant
          </button>
          <Link href="/admin" className="button-secondary w-full sm:w-auto text-center">
            Retour admin
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      {createdTempPassword && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          Mot de passe temporaire généré: <span className="font-semibold">{createdTempPassword}</span>
        </p>
      )}

      <section className="card p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Étudiants</h2>
          <input
            type="text"
            className="form-control sm:max-w-md"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {studentsLoading ? (
          <p className="text-sm text-neutral-600">Chargement des étudiants...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-neutral-600">Aucun étudiant trouvé.</p>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {students.map((student) => (
                <div key={student.id} className="rounded-xl border border-neutral-200 p-4 bg-white space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-neutral-900 break-words">
                      {student.full_name || "Étudiant"}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 whitespace-nowrap">
                      {student.courses_count} cours
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 break-all">{student.email || "Email non renseigné"}</p>
                  <p className="text-sm text-neutral-600">{student.phone || "Téléphone non renseigné"}</p>
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <p className="text-xs text-neutral-500">
                      Paiement: {student.last_order_status ? (statusLabel[student.last_order_status] || student.last_order_status) : "-"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Carte: {student.has_id_card_photo ? "Oui" : "Non"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button-secondary w-full mt-2"
                    onClick={() => openDetail(student.id)}
                  >
                    Voir profil
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="py-2 pr-3 font-semibold">Nom</th>
                  <th className="py-2 pr-3 font-semibold">Email</th>
                  <th className="py-2 pr-3 font-semibold">Téléphone</th>
                  <th className="py-2 pr-3 font-semibold">Cours</th>
                  <th className="py-2 pr-3 font-semibold">Dernier paiement</th>
                  <th className="py-2 pr-3 font-semibold">Carte ID</th>
                  <th className="py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-3">{student.full_name || "-"}</td>
                    <td className="py-3 pr-3 break-all">{student.email || "-"}</td>
                    <td className="py-3 pr-3">{student.phone || "-"}</td>
                    <td className="py-3 pr-3">{student.courses_count}</td>
                    <td className="py-3 pr-3">{student.last_order_status ? (statusLabel[student.last_order_status] || student.last_order_status) : "-"}</td>
                    <td className="py-3 pr-3">{student.has_id_card_photo ? "Oui" : "Non"}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="text-brand font-semibold hover:underline"
                        onClick={() => openDetail(student.id)}
                      >
                        Voir profil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={closeDetail}>
          <div className="w-full max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 h-[88vh] sm:h-auto sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">Détail étudiant</h3>
              <button type="button" onClick={closeDetail} className="button-secondary">
                Fermer
              </button>
            </div>

            {detailLoading && <p className="mt-4 text-sm text-neutral-600">Chargement du profil...</p>}
            {detailError && <p className="mt-4 text-sm text-red-600">{detailError}</p>}

            {!detailLoading && !detailError && selectedStudentDetail && (
              <div className="mt-5 space-y-6">
                <section className="space-y-2">
                  <h4 className="font-semibold text-neutral-900">Profil</h4>
                  <p><span className="font-medium">Nom:</span> {selectedStudentDetail.student.full_name || "-"}</p>
                  <p><span className="font-medium">Email:</span> {selectedStudentDetail.student.email || "-"}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedStudentDetail.student.phone || "-"}</p>
                  <p>
                    <span className="font-medium">Inscription:</span>{" "}
                    {new Date(selectedStudentDetail.student.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-neutral-900">Photo de carte</h4>
                  {selectedStudentDetail.student.id_card_photo_signed_url ? (
                    <a
                      href={selectedStudentDetail.student.id_card_photo_signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand font-semibold hover:underline"
                    >
                      Ouvrir la photo de carte
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-600">Aucune photo de carte fournie.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-neutral-900">Accès cours</h4>
                  {selectedStudentDetail.accesses.length === 0 ? (
                    <p className="text-sm text-neutral-600">Aucun accès accordé.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudentDetail.accesses.map((access) => (
                        <div key={access.id} className="rounded-lg border border-neutral-200 p-3">
                          <p className="font-medium">{access.courses?.title || "Cours supprimé"}</p>
                          <p className="text-xs text-neutral-500">
                            Accordé le {new Date(access.granted_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-neutral-900">Commandes</h4>
                  {selectedStudentDetail.orders.length === 0 ? (
                    <p className="text-sm text-neutral-600">Aucune commande.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudentDetail.orders.map((order) => (
                        <div key={order.id} className="rounded-lg border border-neutral-200 p-3">
                          <p className="font-medium">{order.courses?.title || "Cours supprimé"}</p>
                          <p className="text-sm">
                            Statut: <span className="font-semibold">{statusLabel[order.status] || order.status}</span> • Paiement: {order.payment_method}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Créée le {new Date(order.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setCreateOpen(false)}>
          <div className="w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 space-y-4 h-[88vh] sm:h-auto sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">Ajouter un étudiant</h3>
              <button type="button" className="button-secondary" onClick={() => setCreateOpen(false)}>
                Fermer
              </button>
            </div>

            <div className="grid gap-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email (optionnel)"
                value={createForm.email}
                onChange={(e) => setCreateForm((v) => ({ ...v, email: e.target.value }))}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Nom complet"
                value={createForm.full_name}
                onChange={(e) => setCreateForm((v) => ({ ...v, full_name: e.target.value }))}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Téléphone"
                value={createForm.phone}
                onChange={(e) => setCreateForm((v) => ({ ...v, phone: e.target.value }))}
              />
              <div>
                <label className="text-sm font-semibold block mb-1">Photo de carte (jpeg/png/webp, max 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="form-control"
                  onChange={(e) => setCardFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <button type="button" className="button-primary w-full" onClick={handleCreateStudent} disabled={creating}>
              {creating ? "Création..." : "Créer l'étudiant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

