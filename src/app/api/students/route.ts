import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

type AdminUser = {
  id: string;
};

type AuthUserFallback = {
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

async function getAuthFallbackByUserId(userIds: string[]) {
  if (!supabaseAdmin || userIds.length === 0) return new Map<string, AuthUserFallback>();

  const fallbackMap = new Map<string, AuthUserFallback>();
  const uniqueIds = Array.from(new Set(userIds));

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error || !data?.users) return fallbackMap;

  for (const user of data.users) {
    if (uniqueIds.includes(user.id)) {
      fallbackMap.set(user.id, {
        email: user.email ?? null,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        phone: (user.user_metadata?.phone as string | undefined) ?? null,
      });
    }
  }

  return fallbackMap;
}

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

function generateTempPassword() {
  const random = Math.random().toString(36).slice(2, 10);
  return `Tmp#${random}A9!`;
}

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") ?? "").trim();
    const limitParam = Number(searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    // Compatibilité DB: certains environnements n'ont pas users_profile.email.
    // On essaie d'abord avec email, puis fallback sans email.
    let students: Array<{
      id: string;
      full_name: string | null;
      email?: string | null;
      phone: string | null;
      created_at: string;
      id_card_photo_path: string | null;
    }> | null = null;
    let studentsError: { message: string } | null = null;

    const withEmail = await supabaseAdmin
      .from("users_profile")
      .select("id, full_name, email, phone, created_at, id_card_photo_path")
      .eq("role", "client")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (withEmail.error && withEmail.error.message.toLowerCase().includes("column")) {
      const fallback = await supabaseAdmin
        .from("users_profile")
        .select("id, full_name, phone, created_at, id_card_photo_path")
        .eq("role", "client")
        .order("created_at", { ascending: false })
        .limit(limit);
      students = fallback.data as typeof students;
      studentsError = fallback.error ? { message: fallback.error.message } : null;
    } else {
      students = withEmail.data as typeof students;
      studentsError = withEmail.error ? { message: withEmail.error.message } : null;
    }

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 400 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json([]);
    }

    const studentIds = students.map((s) => s.id);
    const fallbackMap = await getAuthFallbackByUserId(studentIds);

    const [{ data: accessRows, error: accessError }, { data: orderRows, error: orderError }] = await Promise.all([
      supabaseAdmin.from("course_access").select("user_id").in("user_id", studentIds),
      supabaseAdmin
        .from("orders")
        .select("user_id, status, created_at")
        .in("user_id", studentIds)
        .order("created_at", { ascending: false }),
    ]);

    if (accessError) return NextResponse.json({ error: accessError.message }, { status: 400 });
    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });

    const accessCountByUser = new Map<string, number>();
    for (const row of accessRows ?? []) {
      accessCountByUser.set(row.user_id, (accessCountByUser.get(row.user_id) ?? 0) + 1);
    }

    const lastOrderByUser = new Map<string, { status: string; created_at: string }>();
    for (const row of orderRows ?? []) {
      if (!lastOrderByUser.has(row.user_id)) {
        lastOrderByUser.set(row.user_id, {
          status: row.status,
          created_at: row.created_at,
        });
      }
    }

    const normalized = students.map((student) => ({
      ...student,
      email:
        (typeof student.email === "string" ? student.email : null) ??
        fallbackMap.get(student.id)?.email ??
        null,
      full_name:
        (typeof student.full_name === "string" ? student.full_name : null) ??
        fallbackMap.get(student.id)?.full_name ??
        null,
      phone:
        (typeof student.phone === "string" ? student.phone : null) ??
        fallbackMap.get(student.id)?.phone ??
        null,
    }));

    const searched = query
      ? normalized.filter((student) => {
          const q = query.toLowerCase();
          return (
            (student.full_name ?? "").toLowerCase().includes(q) ||
            (student.email ?? "").toLowerCase().includes(q) ||
            (student.phone ?? "").toLowerCase().includes(q)
          );
        })
      : normalized;

    const response = searched.map((student) => {
      const lastOrder = lastOrderByUser.get(student.id);
      return {
        ...student,
        courses_count: accessCountByUser.get(student.id) ?? 0,
        last_order_status: lastOrder?.status ?? null,
        last_order_at: lastOrder?.created_at ?? null,
        has_id_card_photo: Boolean(student.id_card_photo_path),
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

type CreateStudentPayload = {
  email?: string;
  full_name?: string;
  phone?: string;
  id_card_photo_path?: string | null;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const body = (await req.json()) as CreateStudentPayload;
    const email = body.email?.trim().toLowerCase() || null;
    const fullName = body.full_name?.trim() || null;
    const phone = body.phone?.trim() || null;
    const idCardPhotoPath = body.id_card_photo_path?.trim() || null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const generatedEmail = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@no-email.local`;
    const authEmail = email ?? generatedEmail;
    const password = body.password?.trim() || generateTempPassword();

    const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        contact_email_provided: Boolean(email),
      },
    });

    if (createUserError || !createdUser.user) {
      const message = createUserError?.message ?? "Impossible de créer l'étudiant";
      const status = message.toLowerCase().includes("already") ? 409 : 400;
      return NextResponse.json({ error: message }, { status });
    }

    const userId = createdUser.user.id;

    const { error: upsertError } = await supabaseAdmin.from("users_profile").upsert({
      id: userId,
      role: "client",
      full_name: fullName,
      phone,
      id_card_photo_path: idCardPhotoPath,
    });

    if (upsertError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Erreur enregistrement profil: ${upsertError.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        id: userId,
        email: authEmail,
        contact_email_provided: Boolean(email),
        full_name: fullName,
        phone,
        id_card_photo_path: idCardPhotoPath,
        temp_password: body.password ? null : password,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

