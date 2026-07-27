/**
 * Resend admin email for a paid VIP payment that missed notification.
 * node scripts/resend-vip-payment-email.mjs [paymentId]
 */
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "fs";

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

const env = loadEnv(".env.local");
const paymentId = process.argv[2] || "6494beba-75cc-42df-a04d-4821428ec579";
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: payment, error } = await supabase
  .from("telegram_vip_payments")
  .select("*")
  .eq("id", paymentId)
  .single();

if (error || !payment) {
  console.error("FAIL payment:", error?.message || "not found");
  process.exit(1);
}

const { data: profile } = await supabase
  .from("users_profile")
  .select("email, full_name")
  .eq("id", payment.user_id)
  .maybeSingle();

let ref = {};
try {
  ref = payment.payment_reference ? JSON.parse(payment.payment_reference) : {};
} catch {
  ref = {};
}

const to = ["modiboongoiba76@gmail.com", "ms.marakadev@gmail.com"];
const from =
  env.RESEND_FROM_EMAIL ||
  "VB Sniper Académie <support@vbsniperacademie.com>";
const amount = `${Number(payment.amount).toLocaleString("fr-FR")} XOF`;
const detail =
  payment.kind === "adhesion"
    ? "Adhésion canal VIP Telegram (1er mois inclus)"
    : "Renouvellement canal VIP Telegram — 1 mois";
const when = payment.paid_at
  ? new Date(payment.paid_at).toLocaleString("fr-FR", { timeZone: "Africa/Bamako" })
  : "—";

const resend = new Resend(env.RESEND_API_KEY);
const result = await resend.emails.send({
  from,
  to,
  subject: `💰 Paiement réussi — Canal VIP Telegram Signaux — ${amount}`,
  html: `
    <h2>Canal VIP Telegram Signaux</h2>
    <p>Paiement VIP confirmé (rattrapage email manquant).</p>
    <ul>
      <li><b>Montant:</b> ${amount}</li>
      <li><b>Détail:</b> ${detail}</li>
      <li><b>Client:</b> ${profile?.full_name || "—"} (${profile?.email || "—"})</li>
      <li><b>Référence:</b> ${payment.id}</li>
      <li><b>Moneroo:</b> ${ref.moneroo_id || ref.payment_id || "—"}</li>
      <li><b>Payé le:</b> ${when}</li>
      <li><b>Confirmé via:</b> ${ref.confirmed_via || "—"}</li>
    </ul>
  `,
  text: `VIP Telegram ${amount}\n${detail}\nClient: ${profile?.email}\nRéf: ${payment.id}\nPayé: ${when}`,
});

if (result.error) {
  console.error("FAIL Resend:", result.error);
  process.exit(1);
}

ref.admin_email_sent = true;
ref.admin_email_sent_at = new Date().toISOString();
ref.admin_email_sent_via = "manual_catchup";
await supabase
  .from("telegram_vip_payments")
  .update({ payment_reference: JSON.stringify(ref) })
  .eq("id", payment.id);

console.log("OK catch-up email sent");
console.log("payment:", payment.id);
console.log("client:", profile?.email);
console.log("amount:", amount);
console.log("resend_id:", result.data?.id);
console.log("to:", to.join(", "));
