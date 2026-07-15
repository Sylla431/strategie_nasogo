/**
 * One-shot payment notify test. Run: node scripts/test-payment-notify.mjs
 * Loads RESEND_* from .env.local without printing secrets.
 */
import { readFileSync } from "fs";
import { Resend } from "resend";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

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

const env = loadEnv(envPath);
const apiKey = env.RESEND_API_KEY;
const from =
  env.RESEND_FROM_EMAIL ||
  "VB Sniper Académie <support@vbsniperacademie.com>";
const to = [
  "modiboongoiba76@gmail.com",
  "ms.marakadev@gmail.com",
];

if (!apiKey) {
  console.error("FAIL: RESEND_API_KEY manquante dans .env.local");
  process.exit(1);
}

const resend = new Resend(apiKey);
const when = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Bamako" });
const amountLabel = "1 000 XOF";
const productLabel = "Cours (test)";
const referenceId = `test_${Date.now()}`;

const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#f5f5f5;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" style="max-width:600px;width:100%;background:#fff;border-radius:8px;">
        <tr>
          <td style="padding:30px;text-align:center;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border-radius:8px 8px 0 0;">
            <h1 style="margin:0;color:#d4af37;font-size:28px;">VB Sniper Académie</h1>
            <p style="margin:8px 0 0;color:#fff;font-size:14px;opacity:.85;">Notification de paiement (TEST)</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 30px;">
            <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px 20px;margin:0 0 24px;border-radius:4px;">
              <p style="margin:0;color:#065f46;font-size:16px;font-weight:bold;">✓ Paiement confirmé (test)</p>
              <p style="margin:6px 0 0;color:#047857;font-size:14px;">Email de test — ignorez si vous n'avez rien payé.</p>
            </div>
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">${productLabel}</h2>
            <p style="margin:0 0 24px;color:#d4af37;font-size:28px;font-weight:bold;">${amountLabel}</p>
            <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #eee;">
              <tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666;width:140px;">Produit</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600;">${productLabel}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666;">Montant</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600;">${amountLabel}</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666;">Méthode</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600;">test</td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666;">Référence</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600;">${referenceId}</td></tr>
              <tr><td style="padding:12px 16px;color:#666;">Date</td><td style="padding:12px 16px;font-weight:600;">${when}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const result = await resend.emails.send({
  from,
  to,
  subject: `💰 [TEST] Paiement réussi — ${productLabel} — ${amountLabel}`,
  html,
  text: `TEST paiement VB Sniper\nProduit: ${productLabel}\nMontant: ${amountLabel}\nRéf: ${referenceId}\nDate: ${when}`,
});

if (result.error) {
  console.error("FAIL Resend:", result.error);
  process.exit(1);
}

console.log("OK email envoyé");
console.log("to:", to.join(", "));
console.log("from:", from);
console.log("id:", result.data?.id ?? "(inconnu)");
console.log("ref:", referenceId);
