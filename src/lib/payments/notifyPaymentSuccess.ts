import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

const ADMIN_PAYMENT_EMAIL =
  process.env.PAYMENT_NOTIFY_EMAIL || "modiboongoiba76@gmail.com";

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
 * Notifie l'admin par email à chaque paiement réussi.
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

    const productLabel =
      input.product === "telegram_vip" ? "VIP Telegram" : "Cours";
    const when = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Bamako" });

    const subject = `💰 Paiement réussi — ${productLabel} — ${formatAmount(input.amount)}`;

    const rows: Array<[string, string]> = [
      ["Produit", productLabel],
      ["Montant", formatAmount(input.amount, input.currency)],
      ["Méthode", input.paymentMethod],
      ["Référence", input.referenceId],
      ["Date", when],
    ];
    if (input.detail) rows.push(["Détail", input.detail]);
    if (input.userEmail) rows.push(["Client (email)", input.userEmail]);
    if (input.userName) rows.push(["Client (nom)", input.userName]);
    if (input.userId) rows.push(["User ID", input.userId]);
    if (input.monerooPaymentId) rows.push(["Moneroo ID", input.monerooPaymentId]);

    const htmlRows = rows
      .map(
        ([label, value]) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:140px;">${label}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:14px;font-weight:600;">${value}</td>
          </tr>`
      )
      .join("");

    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: ADMIN_PAYMENT_EMAIL,
      subject,
      html: `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#f5f5f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" style="max-width:560px;width:100%;background:#fff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:24px;background:#1a1a1a;text-align:center;">
            <h1 style="margin:0;color:#d4af37;font-size:20px;">Paiement réussi</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;color:#333;font-size:15px;">Un nouveau paiement a été confirmé sur VB Sniper Académie.</p>
            <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:6px;">
              ${htmlRows}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      text,
    });

    if (error) {
      console.error("notifyAdminPaymentSuccess Resend error:", error);
      return;
    }

    console.log("✅ Email admin paiement envoyé à", ADMIN_PAYMENT_EMAIL);
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
