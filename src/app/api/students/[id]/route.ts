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

type StudentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  id_card_photo_path: string | null;
};

type CourseRelation = {
  id: string;
  title: string;
  price: number;
  cover_url?: string | null;
};

type UpdateStudentPayload = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  course_id?: string | null;
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

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, full_name, email, phone, created_at, id_card_photo_path")
      .eq("id", id)
      .maybeSingle();

    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
    const currentStudent: StudentProfile = student;

    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("student_course_payments")
      .select("id, student_id, course_id, payment_status, amount_paid, remaining_amount, course_price, created_at, updated_at, courses(id, title, price, cover_url)")
      .eq("student_id", id)
      .order("created_at", { ascending: false });

    if (paymentsError) return NextResponse.json({ error: paymentsError.message }, { status: 400 });

    let idCardPhotoSignedUrl: string | null = null;
    if (currentStudent.id_card_photo_path) {
      const { data: signed, error: signedError } = await supabaseAdmin.storage
        .from(STUDENT_CARD_BUCKET)
        .createSignedUrl(currentStudent.id_card_photo_path, 60 * 30);
      if (!signedError) {
        idCardPhotoSignedUrl = signed.signedUrl;
      }
    }

    const mappedOrders = (payments ?? []).map((payment) => {
      const courseRelation = Array.isArray(payment.courses) ? payment.courses[0] : payment.courses;
      const course: CourseRelation | null =
        courseRelation && typeof courseRelation === "object"
          ? {
              id: String(courseRelation.id ?? payment.course_id),
              title:
                typeof courseRelation.title === "string" && courseRelation.title.trim().length > 0
                  ? courseRelation.title
                  : "Cours",
              price: Number(courseRelation.price ?? payment.course_price ?? 0),
              cover_url:
                typeof courseRelation.cover_url === "string"
                  ? courseRelation.cover_url
                  : null,
            }
          : null;

      return {
        id: payment.id,
        course_id: String(payment.course_id ?? ""),
        status: payment.payment_status,
        payment_method: "cash",
        created_at: payment.created_at,
        paid_at: payment.payment_status === "paid" ? payment.updated_at ?? payment.created_at : null,
        courses: course,
        amount_paid: Number(payment.amount_paid ?? 0),
        remaining_amount: Number(payment.remaining_amount ?? 0),
        course_price: Number(payment.course_price ?? 0),
      };
    });

    return NextResponse.json({
      student: {
        ...currentStudent,
        id_card_photo_signed_url: idCardPhotoSignedUrl,
      },
      accesses: mappedOrders.map((order) => ({
        id: order.id,
        course_id: order.courses?.id ?? "",
        granted_at: order.created_at,
        courses: order.courses,
      })),
      orders: mappedOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const body = (await req.json()) as UpdateStudentPayload;
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const hasCourseIdInPayload = Object.prototype.hasOwnProperty.call(body, "course_id");
    const courseId = typeof body.course_id === "string" ? body.course_id.trim() : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { data: updatedStudent, error: updateError } = await supabaseAdmin
      .from("students")
      .update({
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
      })
      .eq("id", id)
      .select("id, full_name, email, phone, created_at, id_card_photo_path")
      .maybeSingle();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    if (!updatedStudent) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

    if (hasCourseIdInPayload) {
      if (!courseId) {
        return NextResponse.json({ error: "Cours invalide" }, { status: 400 });
      }

      const { data: course, error: courseError } = await supabaseAdmin
        .from("courses")
        .select("id, price")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError || !course) {
        return NextResponse.json({ error: courseError?.message ?? "Cours introuvable" }, { status: 400 });
      }

      const coursePrice = Number(course.price ?? 0);
      if (!Number.isFinite(coursePrice) || coursePrice < 0) {
        return NextResponse.json({ error: "Prix du cours invalide" }, { status: 400 });
      }

      const { data: latestPayment, error: latestPaymentError } = await supabaseAdmin
        .from("student_course_payments")
        .select("id, amount_paid")
        .eq("student_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestPaymentError) {
        return NextResponse.json({ error: latestPaymentError.message }, { status: 400 });
      }

      if (!latestPayment) {
        const { error: insertPaymentError } = await supabaseAdmin.from("student_course_payments").insert([
          {
            student_id: id,
            course_id: courseId,
            course_price: coursePrice,
            amount_paid: 0,
            remaining_amount: coursePrice,
            payment_status: coursePrice === 0 ? "paid" : "pending",
          },
        ]);

        if (insertPaymentError) {
          return NextResponse.json({ error: insertPaymentError.message }, { status: 400 });
        }
      } else {
        const amountPaid = Number(latestPayment.amount_paid ?? 0);
        const remainingAmount = Math.max(coursePrice - amountPaid, 0);
        const paymentStatus = remainingAmount === 0 ? "paid" : "pending";

        const { error: updatePaymentError } = await supabaseAdmin
          .from("student_course_payments")
          .update({
            course_id: courseId,
            course_price: coursePrice,
            remaining_amount: remainingAmount,
            payment_status: paymentStatus,
          })
          .eq("id", latestPayment.id);

        if (updatePaymentError) {
          return NextResponse.json({ error: updatePaymentError.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

