import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { insertStudentPaymentInstallment } from "@/lib/studentInstallments";
import { isUuid } from "@/lib/studentSecurity";

type RecordPaymentPayload = {
  payment_id?: string;
  amount?: number | string;
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin) return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });

    const { id: studentId } = await params;
    if (!studentId || !isUuid(studentId)) {
      return NextResponse.json({ error: "id étudiant invalide" }, { status: 400 });
    }

    const body = (await req.json()) as RecordPaymentPayload;
    const paymentId = typeof body.payment_id === "string" ? body.payment_id.trim() : "";
    const parsedAmount = body.amount === null || body.amount === undefined || body.amount === "" ? Number.NaN : Number(body.amount);

    if (!paymentId || !isUuid(paymentId)) {
      return NextResponse.json({ error: "payment_id invalide" }, { status: 400 });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Le montant du versement est invalide" }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("student_course_payments")
      .select("id, student_id, course_price, amount_paid, remaining_amount, payment_status")
      .eq("id", paymentId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
    if (!payment) return NextResponse.json({ error: "Paiement introuvable pour cet étudiant" }, { status: 404 });

    if (payment.payment_status === "paid") {
      return NextResponse.json({ error: "Ce cours est déjà entièrement payé" }, { status: 400 });
    }

    const coursePrice = Number(payment.course_price ?? 0);
    const currentPaid = Number(payment.amount_paid ?? 0);
    const currentRemaining = Number(payment.remaining_amount ?? 0);

    if (parsedAmount > currentRemaining) {
      return NextResponse.json(
        { error: `Le versement ne peut pas dépasser le reste à payer (${currentRemaining} FCFA)` },
        { status: 400 },
      );
    }

    const newAmountPaid = currentPaid + parsedAmount;
    const newRemaining = Math.max(coursePrice - newAmountPaid, 0);
    const paymentStatus = newRemaining === 0 ? "paid" : "pending";

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("student_course_payments")
      .update({
        amount_paid: newAmountPaid,
        remaining_amount: newRemaining,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select("id, amount_paid, remaining_amount, payment_status, course_price")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message ?? "Erreur enregistrement versement" }, { status: 400 });
    }

    const installmentResult = await insertStudentPaymentInstallment(supabaseAdmin, {
      studentCoursePaymentId: paymentId,
      studentId,
      amount: parsedAmount,
      recordedBy: adminCheck.user?.id ?? null,
    });
    if (installmentResult.error) {
      return NextResponse.json(
        { error: `Versement enregistré mais historique non sauvegardé: ${installmentResult.error}` },
        { status: 400 },
      );
    }

    return NextResponse.json({
      payment: {
        id: updated.id,
        amount_paid: Number(updated.amount_paid),
        remaining_amount: Number(updated.remaining_amount),
        course_price: Number(updated.course_price),
        payment_status: updated.payment_status,
      },
      recorded_amount: parsedAmount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}
