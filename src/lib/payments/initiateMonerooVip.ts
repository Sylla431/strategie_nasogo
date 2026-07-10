import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initiatePayment } from "@/lib/moneroo";
import type { VipPaymentKind } from "@/lib/telegram/pricing";

export type InitiateMonerooVipResult =
  | { ok: true; payment_url: string; moneroo_payment_id?: string }
  | { ok: false; error: string; status: number };

/**
 * Initie un paiement Moneroo pour un paiement VIP Telegram déjà créé (pending).
 */
export async function initiateMonerooForVipPayment(params: {
  supabase: SupabaseClient;
  userId: string;
  vipPaymentId: string;
  amount: number;
  kind: VipPaymentKind;
  description: string;
  appUrl?: string;
}): Promise<InitiateMonerooVipResult> {
  const { supabase, userId, vipPaymentId, amount, kind, description } = params;
  const appUrl = (
    params.appUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://vbsniperacademie.com"
  ).replace(/\/$/, "");

  if (!amount || amount <= 0 || isNaN(amount)) {
    return { ok: false, error: "Montant invalide", status: 400 };
  }

  const { data: userProfile } = await supabase
    .from("users_profile")
    .select("email, phone")
    .eq("id", userId)
    .single();

  let userEmail = userProfile?.email as string | undefined;
  if (!userEmail) {
    const { data: emailData } = await supabase.rpc("get_user_email", { user_id: userId });
    userEmail = emailData || undefined;
  }

  const { data: authUser } = await supabase.auth.getUser();
  const fullName =
    authUser.user?.user_metadata?.full_name ||
    authUser.user?.user_metadata?.name ||
    userProfile?.email?.split("@")[0] ||
    "Client";
  const nameParts = String(fullName).split(" ");
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || "VIP";

  const returnUrl = `${appUrl}/payment/success?vip_payment_id=${vipPaymentId}`;

  const paymentResult = await initiatePayment({
    amount: Math.round(amount),
    currency: "XOF",
    description,
    return_url: returnUrl,
    customer: {
      email: userEmail || "client@example.com",
      first_name: firstName,
      last_name: lastName,
      ...(userProfile?.phone && { phone: userProfile.phone }),
    },
    metadata: {
      product: "telegram_vip",
      payment_id: vipPaymentId,
      user_id: userId,
      kind,
    },
  });

  if (paymentResult.status !== 201) {
    return {
      ok: false,
      error:
        paymentResult.error ||
        paymentResult.message ||
        "Erreur lors de l'initiation du paiement VIP",
      status: paymentResult.status || 400,
    };
  }

  if (paymentResult.payment_id) {
    const paymentReferenceJson = JSON.stringify({
      payment_id: paymentResult.payment_id,
      provider: "moneroo",
      product: "telegram_vip",
      kind,
    });

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await serviceRoleClient
        .from("telegram_vip_payments")
        .update({ payment_reference: paymentReferenceJson })
        .eq("id", vipPaymentId);
    } else {
      await supabase
        .from("telegram_vip_payments")
        .update({ payment_reference: paymentReferenceJson })
        .eq("id", vipPaymentId);
    }
  }

  if (!paymentResult.payment_url) {
    return { ok: false, error: "URL de paiement manquante", status: 500 };
  }

  return {
    ok: true,
    payment_url: paymentResult.payment_url,
    moneroo_payment_id: paymentResult.payment_id,
  };
}
