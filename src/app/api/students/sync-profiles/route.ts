import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

async function requireAdmin(req: NextRequest) {
  if (!supabaseAdmin) {
    return { error: NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 }) };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return { error: null, userId: user.id };
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

/** Compatibilité DB : certains environnements n'ont pas la colonne users_profile.email. */
async function loadProfilesByUserIds(userIds: string[]): Promise<{ rows: ProfileRow[]; error: string | null }> {
  if (!supabaseAdmin || userIds.length === 0) {
    return { rows: [], error: null };
  }

  const withEmail = await supabaseAdmin
    .from("users_profile")
    .select("id, full_name, email, phone")
    .in("id", userIds);

  if (!withEmail.error) {
    return { rows: (withEmail.data ?? []) as ProfileRow[], error: null };
  }

  const msg = withEmail.error.message.toLowerCase();
  const missingEmailColumn =
    msg.includes("email") && (msg.includes("column") || msg.includes("does not exist"));

  if (!missingEmailColumn) {
    return { rows: [], error: withEmail.error.message };
  }

  const { data: fallbackRows, error: fbError } = await supabaseAdmin
    .from("users_profile")
    .select("id, full_name, phone")
    .in("id", userIds);

  if (fbError) {
    return { rows: [], error: fbError.message };
  }

  const enriched: ProfileRow[] = [];
  for (const r of fallbackRows ?? []) {
    let email: string | null = null;
    const { data: emailFromAuth } = await supabaseAdmin.rpc("get_user_email", { user_id: r.id });
    if (typeof emailFromAuth === "string" && emailFromAuth.trim()) {
      email = emailFromAuth.trim();
    }
    enriched.push({
      id: r.id,
      full_name: r.full_name ?? null,
      phone: r.phone ?? null,
      email,
    });
  }

  return { rows: enriched, error: null };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
    }

    const { data: accessRows, error: accessError } = await supabaseAdmin
      .from("course_access")
      .select("user_id, course_id, courses(price)")
      .order("granted_at", { ascending: false });

    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 400 });
    }

    const rows = accessRows ?? [];
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        imported_students: 0,
        synced_payments: 0,
        total_access_rows: 0,
      });
    }

    const uniqueUserIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
    const { rows: profileRows, error: profilesError } = await loadProfilesByUserIds(uniqueUserIds);

    if (profilesError) {
      return NextResponse.json({ error: profilesError }, { status: 400 });
    }

    const profileByUserId = new Map<
      string,
      { full_name: string | null; email: string | null; phone: string | null }
    >();
    for (const profile of profileRows) {
      profileByUserId.set(profile.id, {
        full_name: profile.full_name ?? null,
        email: profile.email ?? null,
        phone: profile.phone ?? null,
      });
    }

    const { data: existingStudents, error: existingStudentsError } = await supabaseAdmin
      .from("students")
      .select("id, linked_user_id")
      .in("linked_user_id", uniqueUserIds);

    if (existingStudentsError) {
      return NextResponse.json({ error: existingStudentsError.message }, { status: 400 });
    }

    const studentIdByUserId = new Map<string, string>();
    for (const student of existingStudents ?? []) {
      if (student.linked_user_id) {
        studentIdByUserId.set(student.linked_user_id, student.id);
      }
    }

    let importedStudents = 0;

    for (const row of rows) {
      const userId = row.user_id;
      if (!userId || studentIdByUserId.has(userId)) continue;

      const profile = profileByUserId.get(userId);
      const fullName = profile?.full_name ?? null;
      const email = profile?.email ?? null;
      const phone = profile?.phone ?? null;

      const { data: insertedStudent, error: insertStudentError } = await supabaseAdmin
        .from("students")
        .insert([
          {
            full_name: fullName,
            email,
            phone,
            linked_user_id: userId,
            created_by: auth.userId,
          },
        ])
        .select("id, linked_user_id")
        .single();

      if (insertStudentError || !insertedStudent) {
        continue;
      }

      studentIdByUserId.set(userId, insertedStudent.id);
      importedStudents += 1;
    }

    let syncedPayments = 0;

    for (const row of rows) {
      const userId = row.user_id;
      if (!userId) continue;
      const studentId = studentIdByUserId.get(userId);
      if (!studentId) continue;

      const course = Array.isArray(row.courses) ? row.courses[0] : row.courses;
      const coursePrice =
        course && typeof course === "object" && "price" in course
          ? Number(course.price ?? 0)
          : 0;
      const normalizedCoursePrice = Number.isFinite(coursePrice) && coursePrice >= 0 ? coursePrice : 0;

      const { error: paymentUpsertError } = await supabaseAdmin
        .from("student_course_payments")
        .upsert(
          [
            {
              student_id: studentId,
              course_id: row.course_id,
              course_price: normalizedCoursePrice,
              amount_paid: normalizedCoursePrice,
              remaining_amount: 0,
              payment_status: "paid",
            },
          ],
          { onConflict: "student_id,course_id" },
        );

      if (!paymentUpsertError) {
        syncedPayments += 1;
      }
    }

    return NextResponse.json({
      success: true,
      imported_students: importedStudents,
      synced_payments: syncedPayments,
      total_access_rows: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

