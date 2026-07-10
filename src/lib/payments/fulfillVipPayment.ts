import type { SupabaseClient } from "@supabase/supabase-js";
import { grantOrExtendSubscription } from "@/lib/telegram/subscription";
import { notifyAdminPaymentSuccess } from "@/lib/payments/notifyPaymentSuccess";

export type VipPaymentRow = {
  id: string;
  user_id: string;
  kind: "adhesion" | "renewal";
  amount: number;
  months: number;
  status: string;
  payment_reference: string | null;
};

/**
 * Marque un paiement VIP comme payé et active/prolonge l'abonnement Telegram.
 */
export async function fulfillVipPayment(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>;
  payment: VipPaymentRow;
  monerooPaymentId: string;
  confirmedVia?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { serviceClient, payment, monerooPaymentId, confirmedVia } = params;

  if (payment.status === "paid") {
    return { ok: true };
  }

  let paymentData: Record<string, unknown> = {};
  if (payment.payment_reference) {
    try {
      paymentData = JSON.parse(payment.payment_reference);
    } catch {
      paymentData = {};
    }
  }
  paymentData.moneroo_id = monerooPaymentId;
  paymentData.payment_id = monerooPaymentId;
  paymentData.completed_at = new Date().toISOString();
  if (confirmedVia) paymentData.confirmed_via = confirmedVia;

  const { error: updateError } = await serviceClient
    .from("telegram_vip_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_reference: JSON.stringify(paymentData),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("fulfillVipPayment update error:", updateError);
    return { ok: false, error: updateError.message };
  }

  const months = payment.months > 0 ? payment.months : 1;
  const { error: grantError } = await grantOrExtendSubscription(payment.user_id, months);

  if (grantError) {
    console.error("fulfillVipPayment grant error:", grantError);
    return { ok: false, error: grantError };
  }

  console.log("✅ VIP Telegram activé/prolongé pour", payment.user_id, `(${payment.kind})`);

  // Notif admin (non bloquant)
  void (async () => {
    let userEmail: string | null = null;
    let userName: string | null = null;
    try {
      const { data: profile } = await serviceClient
        .from("users_profile")
        .select("email, full_name")
        .eq("id", payment.user_id)
        .maybeSingle();
      userEmail = profile?.email ?? null;
      userName = profile?.full_name ?? null;
    } catch {
      /* ignore */
    }
    if (!userEmail) {
      try {
        const { data: authUser } = await serviceClient.auth.admin.getUserById(payment.user_id);
        userEmail = authUser.user?.email ?? null;
      } catch {
        /* ignore */
      }
    }
    await notifyAdminPaymentSuccess({
      product: "telegram_vip",
      paymentMethod: "moneroo",
      amount: payment.amount,
      referenceId: payment.id,
      userId: payment.user_id,
      userEmail,
      userName,
      detail: payment.kind === "adhesion" ? "Adhésion VIP (1er mois inclus)" : "Renouvellement VIP — 1 mois",
      monerooPaymentId,
    });
  })();

  return { ok: true };
}

export async function failVipPayment(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>;
  payment: VipPaymentRow;
  monerooPaymentId: string;
}) {
  const { serviceClient, payment, monerooPaymentId } = params;
  let paymentData: Record<string, unknown> = {};
  if (payment.payment_reference) {
    try {
      paymentData = JSON.parse(payment.payment_reference);
    } catch {
      paymentData = {};
    }
  }
  paymentData.moneroo_id = monerooPaymentId;
  paymentData.failed_at = new Date().toISOString();

  await serviceClient
    .from("telegram_vip_payments")
    .update({
      status: "failed",
      payment_reference: JSON.stringify(paymentData),
    })
    .eq("id", payment.id);
}
