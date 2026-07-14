import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPaymentSuccessEmailTemplate } from "@/lib/emailTemplates";

/** Destinataires par défaut des notifs paiement admin */
export const DEFAULT_PAYMENT_NOTIFY_EMAILS = [
  "modiboongoiba76@gmail.com",
  "ms.marakadev@gmail.com",
] as const;

/**
 * Liste des emails à notifier.
 * Surcharge via PAYMENT_NOTIFY_EMAIL (séparés par virgule).
 */
export function getPaymentNotifyEmails(): string[] {
  const raw = process.env.PAYMENT_NOTIFY_EMAIL?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }
  return [...DEFAULT_PAYMENT_NOTIFY_EMAILS];
}

export type PaymentSuccessNotifyInput = {
  product: "course" | "telegram_vip";
  paymentMethod: string;
  amount?: number | null;
  currency?: string;
  referenceId: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  detail?: string | null;
  monerooPaymentId?: string | null;
};

function formatAmount(amount?: number | null, currency = "XOF") {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

/**
 * Notifie les admins par email à chaque paiement réussi.
 * Ne bloque jamais le flux paiement (erreurs loguées seulement).
 */
export async function notifyAdminPaymentSuccess(
  input: PaymentSuccessNotifyInput
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("notifyAdminPaymentSuccess: RESEND_API_KEY manquante");
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "VB Sniper Académie <support@vbsniperacademie.com>";
    const toEmails = getPaymentNotifyEmails();

    if (toEmails.length === 0) {
      console.warn("notifyAdminPaymentSuccess: aucun destinataire");
      return;
    }

    const productLabel =
      input.product === "telegram_vip" ? "VIP Telegram" : "Cours";
    const amountLabel = formatAmount(input.amount, input.currency);
    const when = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Bamako" });

    const template = getPaymentSuccessEmailTemplate({
      productLabel,
      amountLabel,
      paymentMethod: input.paymentMethod,
      referenceId: input.referenceId,
      dateLabel: when,
      detail: input.detail,
      userEmail: input.userEmail,
      userName: input.userName,
      userId: input.userId,
      monerooPaymentId: input.monerooPaymentId,
    });

    console.log("📧 Envoi notif paiement Resend…", {
      to: toEmails,
      from: fromEmail,
      product: input.product,
      referenceId: input.referenceId,
    });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("notifyAdminPaymentSuccess Resend error:", error);
      return;
    }

    console.log("✅ Email admin paiement envoyé à", toEmails.join(", "), "id=", data?.id);
  } catch (err) {
    console.error("notifyAdminPaymentSuccess exception:", err);
  }
}

/**
 * Enrichit la notif avec email/nom client (+ titre cours si course_id).
 */
export async function notifyAdminOrderPaid(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: SupabaseClient<any>;
  orderId: string;
  userId: string;
  courseId?: string | null;
  paymentMethod: string;
  amount?: number | null;
  monerooPaymentId?: string | null;
}): Promise<void> {
  const { serviceClient, orderId, userId, courseId, paymentMethod, amount, monerooPaymentId } =
    params;

  let userEmail: string | null = null;
  let userName: string | null = null;
  let detail: string | null = null;
  let resolvedAmount = amount ?? null;

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

  if (courseId) {
    try {
      const { data: course } = await serviceClient
        .from("courses")
        .select("title, price")
        .eq("id", courseId)
        .maybeSingle();
      if (course?.title) detail = course.title;
      if (resolvedAmount == null && course?.price != null) resolvedAmount = course.price;
    } catch {
      /* ignore */
    }
  }

  await notifyAdminPaymentSuccess({
    product: "course",
    paymentMethod,
    amount: resolvedAmount,
    referenceId: orderId,
    userId,
    userEmail,
    userName,
    detail,
    monerooPaymentId,
  });
}
