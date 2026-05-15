import type { SupabaseClient } from "@supabase/supabase-js";

type InsertInstallmentParams = {
  studentCoursePaymentId: string;
  studentId: string;
  amount: number;
  recordedBy?: string | null;
};

export async function insertStudentPaymentInstallment(
  supabase: SupabaseClient,
  params: InsertInstallmentParams,
): Promise<{ error: string | null }> {
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    return { error: null };
  }

  const { error } = await supabase.from("student_payment_installments").insert([
    {
      student_course_payment_id: params.studentCoursePaymentId,
      student_id: params.studentId,
      amount: params.amount,
      recorded_by: params.recordedBy ?? null,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}
