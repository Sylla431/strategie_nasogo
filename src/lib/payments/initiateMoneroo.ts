import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initiatePayment } from "@/lib/moneroo";

type Course = {
  title?: string;
  price?: number;
};

export type InitiateMonerooResult =
  | { ok: true; payment_url: string; payment_id?: string }
  | { ok: false; error: string; status: number };

/**
 * Initie un paiement Moneroo pour une commande déjà créée.
 * Appel in-process (évite le self-fetch HTTP qui perd le Bearer en prod).
 */
export async function initiateMonerooForOrder(params: {
  supabase: SupabaseClient;
  userId: string;
  orderId: string;
  appUrl?: string;
}): Promise<InitiateMonerooResult> {
  const { supabase, userId, orderId } = params;
  const appUrl =
    params.appUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://vbsniperacademie.com";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, courses(*)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Commande non trouvée", status: 404 };
  }

  if (order.status === "paid") {
    return { ok: false, error: "Cette commande est déjà payée", status: 400 };
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

  const course = order.courses as Course | undefined;
  const coursePrice = course?.price || 0;
  const courseTitle = course?.title || "Cours";

  if (!coursePrice || coursePrice <= 0 || isNaN(Number(coursePrice))) {
    return { ok: false, error: "Le prix du cours n'est pas valide", status: 400 };
  }

  const amount = Math.round(Number(coursePrice));
  if (amount <= 0 || isNaN(amount)) {
    return { ok: false, error: "Le montant doit être supérieur à 0", status: 400 };
  }

  const returnUrl = `${appUrl.replace(/\/$/, "")}/payment/success?order_id=${orderId}`;

  const { data: authUser } = await supabase.auth.getUser();
  const fullName =
    authUser.user?.user_metadata?.full_name ||
    authUser.user?.user_metadata?.name ||
    userProfile?.email?.split("@")[0] ||
    "Client";
  const nameParts = String(fullName).split(" ");
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || "Moneroo";

  const paymentResult = await initiatePayment({
    amount,
    currency: "XOF",
    description: `Paiement pour ${courseTitle}`,
    return_url: returnUrl,
    customer: {
      email: userEmail || "client@example.com",
      first_name: firstName,
      last_name: lastName,
      ...(userProfile?.phone && { phone: userProfile.phone }),
    },
    metadata: {
      order_id: orderId,
      user_id: userId,
      course_id: String(order.course_id),
    },
  });

  if (paymentResult.status !== 201) {
    return {
      ok: false,
      error:
        paymentResult.error ||
        paymentResult.message ||
        "Erreur lors de l'initiation du paiement",
      status: paymentResult.status || 400,
    };
  }

  if (paymentResult.payment_id) {
    const paymentReferenceJson = JSON.stringify({
      payment_id: paymentResult.payment_id,
      provider: "moneroo",
    });

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await serviceRoleClient
        .from("orders")
        .update({ payment_reference: paymentReferenceJson })
        .eq("id", order.id);
    } else {
      await supabase
        .from("orders")
        .update({ payment_reference: paymentReferenceJson })
        .eq("id", order.id);
    }
  }

  if (!paymentResult.payment_url) {
    return { ok: false, error: "URL de paiement manquante", status: 500 };
  }

  return {
    ok: true,
    payment_url: paymentResult.payment_url,
    payment_id: paymentResult.payment_id,
  };
}
