import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isUuid } from "@/lib/studentSecurity";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
    }

    const { id: studentId } = await params;
    if (!studentId || !isUuid(studentId)) {
      return NextResponse.json({ error: "id étudiant invalide" }, { status: 400 });
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();

    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

    const { data: rows, error: rowsError } = await supabaseAdmin
      .from("student_payment_installments")
      .select(
        "id, amount, created_at, student_course_payment_id, student_course_payments(id, course_id, courses(title))",
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (rowsError) return NextResponse.json({ error: rowsError.message }, { status: 400 });

    const installments = (rows ?? []).map((row) => {
      const paymentRel = Array.isArray(row.student_course_payments)
        ? row.student_course_payments[0]
        : row.student_course_payments;
      const courseRel =
        paymentRel && typeof paymentRel === "object" && "courses" in paymentRel
          ? Array.isArray(paymentRel.courses)
            ? paymentRel.courses[0]
            : paymentRel.courses
          : null;
      const title =
        courseRel && typeof courseRel === "object" && "title" in courseRel
          ? (courseRel.title as string | null)
          : null;

      return {
        id: row.id,
        amount: Number(row.amount ?? 0),
        created_at: row.created_at,
        payment_id: row.student_course_payment_id,
        course_title: title && title.trim() ? title : "Cours",
      };
    });

    return NextResponse.json({
      installments,
      total_count: installments.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}
