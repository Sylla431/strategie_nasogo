/**
 * Inspect recent VIP payments. Does not print secrets.
 * node scripts/inspect-vip-payments.mjs
 */
import { createClient } from "@supabase/supabase-js";
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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("FAIL: Supabase env manquante");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const { data: payments, error } = await supabase
  .from("telegram_vip_payments")
  .select("id, user_id, kind, amount, months, status, payment_reference, created_at, paid_at")
  .gte("created_at", since)
  .order("created_at", { ascending: false })
  .limit(20);

if (error) {
  console.error("FAIL query payments:", error.message);
  process.exit(1);
}

console.log(`VIP payments (7j): ${payments?.length ?? 0}`);
for (const p of payments || []) {
  let ref = {};
  try {
    ref = p.payment_reference ? JSON.parse(p.payment_reference) : {};
  } catch {
    ref = { parse_error: true };
  }
  const { data: profile } = await supabase
    .from("users_profile")
    .select("email, full_name")
    .eq("id", p.user_id)
    .maybeSingle();

  console.log("---");
  console.log({
    id: p.id,
    status: p.status,
    kind: p.kind,
    amount: p.amount,
    created_at: p.created_at,
    paid_at: p.paid_at,
    user_email: profile?.email ?? null,
    user_name: profile?.full_name ?? null,
    confirmed_via: ref.confirmed_via ?? null,
    moneroo_id: ref.moneroo_id || ref.payment_id || null,
    admin_email_sent: ref.admin_email_sent ?? false,
    has_ref: Boolean(p.payment_reference),
  });
}

const { data: subs } = await supabase
  .from("telegram_subscriptions")
  .select("user_id, status, subscription_expires_at, updated_at, created_at")
  .gte("updated_at", since)
  .order("updated_at", { ascending: false })
  .limit(10);

console.log("\nSubscriptions updated (7j):", subs?.length ?? 0);
for (const s of subs || []) {
  console.log(s);
}

console.log("\nLocal RESEND_API_KEY present:", Boolean(env.RESEND_API_KEY));
console.log("PAYMENT_NOTIFY_EMAIL:", env.PAYMENT_NOTIFY_EMAIL || "(default dual emails)");
