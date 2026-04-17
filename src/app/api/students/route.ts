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

type StudentListItem = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  id_card_photo_path: string | null;
  linked_user_id?: string | null;
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

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") ?? "").trim();
    const limitParam = Number(searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("id, full_name, email, phone, created_at, id_card_photo_path, linked_user_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 400 });
    }

    const safeStudents = (students ?? []) as StudentListItem[];

    if (safeStudents.length === 0) {
      return NextResponse.json([]);
    }

    const searched = query
      ? safeStudents.filter((student) => {
          const q = query.toLowerCase();
          return (
            (student.full_name ?? "").toLowerCase().includes(q) ||
            (student.email ?? "").toLowerCase().includes(q) ||
            (student.phone ?? "").toLowerCase().includes(q)
          );
        })
      : safeStudents;

    if (searched.length === 0) {
      return NextResponse.json([]);
    }

    const studentIds = searched.map((s) => s.id);

    const { data: paymentRows, error: paymentsError } = await supabaseAdmin
      .from("student_course_payments")
      .select("student_id, payment_status, created_at, courses(title)")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false });

    if (paymentsError) return NextResponse.json({ error: paymentsError.message }, { status: 400 });

    const coursesCountByStudent = new Map<string, number>();
    const lastPaymentByStudent = new Map<string, { status: string; created_at: string }>();
    const lastCourseTitleByStudent = new Map<string, string | null>();

    for (const row of paymentRows ?? []) {
      coursesCountByStudent.set(row.student_id, (coursesCountByStudent.get(row.student_id) ?? 0) + 1);
      if (!lastPaymentByStudent.has(row.student_id)) {
        lastPaymentByStudent.set(row.student_id, {
          status: row.payment_status,
          created_at: row.created_at,
        });
      }
      if (!lastCourseTitleByStudent.has(row.student_id)) {
        const courseRelation = Array.isArray(row.courses) ? row.courses[0] : row.courses;
        const title =
          courseRelation && typeof courseRelation === "object" && "title" in courseRelation
            ? (courseRelation.title as string | null)
            : null;
        lastCourseTitleByStudent.set(row.student_id, title);
      }
    }

    /** Utilisateurs liés à un compte site : compter aussi les cours depuis course_access (source de vérité accès). */
    type AccessAgg = { distinctCourses: Set<string>; latestTitle: string | null; latestGrantedAt: string | null };
    const accessByUserId = new Map<string, AccessAgg>();

    const linkedUserIds = Array.from(
      new Set(searched.map((s) => s.linked_user_id).filter((id): id is string => Boolean(id))),
    );

    if (linkedUserIds.length > 0) {
      const { data: accessRows, error: accessError } = await supabaseAdmin
        .from("course_access")
        .select("user_id, course_id, granted_at, courses(title)")
        .in("user_id", linkedUserIds);

      if (accessError) return NextResponse.json({ error: accessError.message }, { status: 400 });

      for (const row of accessRows ?? []) {
        const uid = row.user_id as string;
        if (!uid || !row.course_id) continue;

        let agg = accessByUserId.get(uid);
        if (!agg) {
          agg = { distinctCourses: new Set(), latestTitle: null, latestGrantedAt: null };
          accessByUserId.set(uid, agg);
        }
        agg.distinctCourses.add(row.course_id as string);

        const grantedAt = typeof row.granted_at === "string" ? row.granted_at : null;
        const courseRel = Array.isArray(row.courses) ? row.courses[0] : row.courses;
        const title =
          courseRel && typeof courseRel === "object" && "title" in courseRel
            ? (courseRel.title as string | null)
            : null;

        if (grantedAt && (!agg.latestGrantedAt || grantedAt > agg.latestGrantedAt)) {
          agg.latestGrantedAt = grantedAt;
          agg.latestTitle = title && title.trim() ? title : agg.latestTitle;
        }
      }
    }

    const response = searched.map((student) => {
      const lastPayment = lastPaymentByStudent.get(student.id);
      const paymentCourseCount = coursesCountByStudent.get(student.id) ?? 0;
      const titleFromPayments = lastCourseTitleByStudent.get(student.id) ?? null;

      const linkedId = student.linked_user_id ?? null;
      const accessAgg = linkedId ? accessByUserId.get(linkedId) : undefined;
      const accessCourseCount = accessAgg?.distinctCourses.size ?? 0;

      const coursesCount = Math.max(paymentCourseCount, accessCourseCount);
      const lastCourseTitle = titleFromPayments ?? accessAgg?.latestTitle ?? null;

      let lastOrderStatus = lastPayment?.status ?? null;
      let lastOrderAt = lastPayment?.created_at ?? null;
      if (!lastPayment && accessCourseCount > 0) {
        lastOrderStatus = "paid";
        lastOrderAt = accessAgg?.latestGrantedAt ?? null;
      }

      return {
        ...student,
        courses_count: coursesCount,
        last_course_title: lastCourseTitle,
        last_order_status: lastOrderStatus,
        last_order_at: lastOrderAt,
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
  course_id?: string | null;
  initial_paid_amount?: number | string | null;
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
    const courseId = body.course_id?.trim() || null;
    const parsedInitialPaidRaw =
      body.initial_paid_amount === null || body.initial_paid_amount === undefined || body.initial_paid_amount === ""
        ? 0
        : Number(body.initial_paid_amount);
    const initialPaidAmount = Number.isFinite(parsedInitialPaidRaw) ? parsedInitialPaidRaw : Number.NaN;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!Number.isFinite(initialPaidAmount) || initialPaidAmount < 0) {
      return NextResponse.json({ error: "Le montant payé initial est invalide" }, { status: 400 });
    }

    const { data: createdStudent, error: createStudentError } = await supabaseAdmin
      .from("students")
      .insert([
        {
          full_name: fullName,
          email,
          phone,
          id_card_photo_path: idCardPhotoPath,
          created_by: adminCheck.user?.id ?? null,
        },
      ])
      .select("id, full_name, email, phone, id_card_photo_path, created_at")
      .single();

    if (createStudentError || !createdStudent) {
      const message = createStudentError?.message ?? "Impossible d'enregistrer l'étudiant";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let createdPayment:
      | {
          id: string;
          course_id: string;
          payment_status: "pending" | "paid";
          amount_paid: number;
          remaining_amount: number;
          course_price: number;
        }
      | null = null;

    if (courseId) {
      const { data: course, error: courseError } = await supabaseAdmin
        .from("courses")
        .select("id, price")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError || !course) {
        await supabaseAdmin.from("students").delete().eq("id", createdStudent.id);
        return NextResponse.json(
          { error: courseError?.message || "Cours introuvable" },
          { status: 400 },
        );
      }

      const coursePrice = Number(course.price ?? 0);
      if (!Number.isFinite(coursePrice) || coursePrice < 0) {
        await supabaseAdmin.from("students").delete().eq("id", createdStudent.id);
        return NextResponse.json({ error: "Prix du cours invalide" }, { status: 400 });
      }

      if (initialPaidAmount > coursePrice) {
        await supabaseAdmin.from("students").delete().eq("id", createdStudent.id);
        return NextResponse.json(
          { error: "Le montant payé ne peut pas dépasser le prix du cours" },
          { status: 400 },
        );
      }

      const remainingAmount = Math.max(coursePrice - initialPaidAmount, 0);
      const paymentStatus: "pending" | "paid" = remainingAmount === 0 ? "paid" : "pending";

      const { data: paymentData, error: paymentError } = await supabaseAdmin
        .from("student_course_payments")
        .insert([
          {
            student_id: createdStudent.id,
            course_id: courseId,
            course_price: coursePrice,
            amount_paid: initialPaidAmount,
            remaining_amount: remainingAmount,
            payment_status: paymentStatus,
          },
        ])
        .select("id, course_id, payment_status, amount_paid, remaining_amount, course_price")
        .single();

      if (paymentError || !paymentData) {
        await supabaseAdmin.from("students").delete().eq("id", createdStudent.id);
        return NextResponse.json(
          { error: `Erreur enregistrement paiement étudiant: ${paymentError?.message ?? "unknown"}` },
          { status: 400 },
        );
      }

      createdPayment = {
        id: paymentData.id,
        course_id: paymentData.course_id,
        payment_status: paymentData.payment_status as "pending" | "paid",
        amount_paid: Number(paymentData.amount_paid ?? initialPaidAmount),
        remaining_amount: Number(paymentData.remaining_amount ?? remainingAmount),
        course_price: Number(paymentData.course_price ?? coursePrice),
      };
    }

    return NextResponse.json(
      {
        ...createdStudent,
        created_payment: createdPayment,
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

