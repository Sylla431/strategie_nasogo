import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isUuid, isValidPhone, isValidStudentCardPath, sanitizePhoneInput, STUDENT_FIELD_LIMITS } from "@/lib/studentSecurity";

const STUDENT_CARD_BUCKET = "student-cards";

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
  id_card_photo_path?: string | null;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { id } = await params;
    if (!id || !isUuid(id)) return NextResponse.json({ error: "id invalide" }, { status: 400 });

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, full_name, email, phone, created_at, id_card_photo_path, linked_user_id")
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
    if (
      currentStudent.id_card_photo_path &&
      isValidStudentCardPath(currentStudent.id_card_photo_path)
    ) {
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
    if (!id || !isUuid(id)) return NextResponse.json({ error: "id invalide" }, { status: 400 });

    const body = (await req.json()) as UpdateStudentPayload;
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
    const phone = phoneRaw ? sanitizePhoneInput(phoneRaw) : "";
    const hasCourseIdInPayload = Object.prototype.hasOwnProperty.call(body, "course_id");
    const courseId = typeof body.course_id === "string" ? body.course_id.trim() : "";
    const hasCardPathInPayload = Object.prototype.hasOwnProperty.call(body, "id_card_photo_path");
    const cardPath = typeof body.id_card_photo_path === "string" ? body.id_card_photo_path.trim() : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (email && email.length > STUDENT_FIELD_LIMITS.email) {
      return NextResponse.json({ error: "Email trop long" }, { status: 400 });
    }
    if (fullName && fullName.length > STUDENT_FIELD_LIMITS.fullName) {
      return NextResponse.json({ error: "Nom trop long" }, { status: 400 });
    }
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide (8 à 30 chiffres)" },
        { status: 400 },
      );
    }
    if (hasCardPathInPayload && cardPath && !isValidStudentCardPath(cardPath, adminCheck.user?.id)) {
      return NextResponse.json({ error: "Chemin photo de carte invalide" }, { status: 400 });
    }

    const { data: updatedStudent, error: updateError } = await supabaseAdmin
      .from("students")
      .update({
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
        ...(hasCardPathInPayload ? { id_card_photo_path: cardPath || null } : {}),
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { id } = await params;
    if (!id || !isUuid(id)) return NextResponse.json({ error: "id invalide" }, { status: 400 });

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

    const { error: deletePaymentsError } = await supabaseAdmin
      .from("student_course_payments")
      .delete()
      .eq("student_id", id);
    if (deletePaymentsError) {
      return NextResponse.json({ error: deletePaymentsError.message }, { status: 400 });
    }

    const { error: deleteStudentError } = await supabaseAdmin.from("students").delete().eq("id", id);
    if (deleteStudentError) {
      return NextResponse.json({ error: deleteStudentError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

