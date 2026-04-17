import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const STUDENT_CARD_BUCKET = "student-cards";

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

type AdminUser = {
  id: string;
};

async function requireAdmin(req: NextRequest): Promise<{ user: AdminUser | null; error: NextResponse | null }> {
  if (!supabaseAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 }),
    };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { user: null, error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return { user: { id: user.id }, error: null };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    // Compatibilité DB: certains environnements n'ont pas users_profile.email.
    let student:
      | {
          id: string;
          full_name: string | null;
          email?: string | null;
          phone: string | null;
          created_at: string;
          role: string;
          id_card_photo_path: string | null;
        }
      | null = null;
    let studentError: { message: string } | null = null;

    const withEmail = await supabaseAdmin
      .from("users_profile")
      .select("id, full_name, email, phone, created_at, role, id_card_photo_path")
      .eq("id", id)
      .eq("role", "client")
      .maybeSingle();

    if (withEmail.error && withEmail.error.message.toLowerCase().includes("column")) {
      const fallback = await supabaseAdmin
        .from("users_profile")
        .select("id, full_name, phone, created_at, role, id_card_photo_path")
        .eq("id", id)
        .eq("role", "client")
        .maybeSingle();
      student = fallback.data as typeof student;
      studentError = fallback.error ? { message: fallback.error.message } : null;
    } else {
      student = withEmail.data as typeof student;
      studentError = withEmail.error ? { message: withEmail.error.message } : null;
    }

    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

    const [{ data: accesses, error: accessError }, { data: orders, error: ordersError }] = await Promise.all([
      supabaseAdmin
        .from("course_access")
        .select("id, user_id, course_id, granted_at, courses(id, title, price, cover_url)")
        .eq("user_id", id)
        .order("granted_at", { ascending: false }),
      supabaseAdmin
        .from("orders")
        .select("id, user_id, status, payment_method, payment_reference, created_at, paid_at, courses(id, title, price, cover_url)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (accessError) return NextResponse.json({ error: accessError.message }, { status: 400 });
    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 400 });

    let idCardPhotoSignedUrl: string | null = null;
    if (student.id_card_photo_path) {
      const { data: signed, error: signedError } = await supabaseAdmin.storage
        .from(STUDENT_CARD_BUCKET)
        .createSignedUrl(student.id_card_photo_path, 60 * 30);
      if (!signedError) {
        idCardPhotoSignedUrl = signed.signedUrl;
      }
    }

    const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(id);
    const email = (typeof student.email === "string" ? student.email : null) ?? authUserData?.user?.email ?? null;

    return NextResponse.json({
      student: {
        ...student,
        email,
        id_card_photo_signed_url: idCardPhotoSignedUrl,
      },
      accesses: accesses ?? [],
      orders: orders ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

