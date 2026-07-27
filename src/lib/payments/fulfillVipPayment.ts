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

function parsePaymentRef(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function resolveVipCustomer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>,
  userId: string
): Promise<{ userEmail: string | null; userName: string | null }> {
  let userEmail: string | null = null;
  let userName: string | null = null;
  try {
    const { data: profile } = await serviceClient
      .from("users_profile")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    userEmail = profile?.email ?? null;
    userName = profile?.full_name ?? null;
  } catch {
    /* ignore */
  }
  if (!userEmail) {
    try {
      const { data: authUser } = await serviceClient.auth.admin.getUserById(userId);
      userEmail = authUser.user?.email ?? null;
    } catch {
      /* ignore */
    }
  }
  return { userEmail, userName };
}

/**
 * Envoie l'email admin VIP si pas encore envoyé, et marque admin_email_sent.
 */
export async function notifyVipPaymentEmailIfNeeded(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>;
  payment: VipPaymentRow;
  monerooPaymentId?: string | null;
}): Promise<void> {
  const { serviceClient, payment, monerooPaymentId } = params;
  const paymentData = parsePaymentRef(payment.payment_reference);

  if (paymentData.admin_email_sent === true) {
    return;
  }

  const { userEmail, userName } = await resolveVipCustomer(serviceClient, payment.user_id);
  const monerooId =
    monerooPaymentId ||
    (typeof paymentData.payment_id === "string" ? paymentData.payment_id : null) ||
    (typeof paymentData.moneroo_id === "string" ? paymentData.moneroo_id : null);

  const sent = await notifyAdminPaymentSuccess({
    product: "telegram_vip",
    paymentMethod: "moneroo",
    amount: payment.amount,
    referenceId: payment.id,
    userId: payment.user_id,
    userEmail,
    userName,
    detail:
      payment.kind === "adhesion"
        ? "Adhésion canal VIP Telegram (1er mois inclus)"
        : "Renouvellement canal VIP Telegram — 1 mois",
    monerooPaymentId: monerooId,
  });

  if (!sent) return;

  paymentData.admin_email_sent = true;
  paymentData.admin_email_sent_at = new Date().toISOString();
  await serviceClient
    .from("telegram_vip_payments")
    .update({ payment_reference: JSON.stringify(paymentData) })
    .eq("id", payment.id);
}

/**
 * Marque un paiement VIP comme payé et active/prolonge l'abonnement Telegram.
 * Envoie aussi l'email admin de notification.
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
    await notifyVipPaymentEmailIfNeeded({
      serviceClient,
      payment,
      monerooPaymentId,
    });
    return { ok: true };
  }

  const paymentData = parsePaymentRef(payment.payment_reference);
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

  await notifyVipPaymentEmailIfNeeded({
    serviceClient,
    payment: {
      ...payment,
      status: "paid",
      payment_reference: JSON.stringify(paymentData),
    },
    monerooPaymentId,
  });

  return { ok: true };
}

export async function failVipPayment(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>;
  payment: VipPaymentRow;
  monerooPaymentId: string;
}) {
  const { serviceClient, payment, monerooPaymentId } = params;
  const paymentData = parsePaymentRef(payment.payment_reference);
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
