export function getPromoEndingEmailTemplate(data: {
  userName?: string;
  promoEndDate: string;
  promoPrice: string;
  originalPrice: string;
  productName: string;
  productUrl: string;
  siteUrl: string;
}) {
  const {
    userName = "Cher trader",
    promoEndDate,
    promoPrice,
    originalPrice,
    productName,
    productUrl,
    siteUrl,
  } = data;

  return {
    subject: `🚨 Dernière chance ! La promotion se termine bientôt`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promotion se termine bientôt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: bold;">VB Sniper Académie</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: bold;">
                🚨 ${userName}, la promotion se termine bientôt !
              </h2>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nous vous contactons pour vous rappeler que l'offre promotionnelle sur <strong>${productName}</strong> se termine <strong>${promoEndDate}</strong>.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #856404; font-size: 16px; font-weight: bold;">
                  ⏰ Offre limitée dans le temps
                </p>
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  Ne manquez pas cette opportunité unique de rejoindre notre formation à prix réduit.
                </p>
              </div>
              
              <!-- Price Box -->
              <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 600;">PRIX OFFICIEL</p>
                <p style="margin: 0 0 5px; color: #1a1a1a; font-size: 18px; text-decoration: line-through; opacity: 0.7;">${originalPrice}</p>
                <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 600;">PRIX PROMOTIONNEL</p>
                <p style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: bold;">${promoPrice}</p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${productUrl}" style="display: inline-block; padding: 16px 40px; background-color: #d4af37; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center;">
                      Profiter de l'offre maintenant
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Cette offre est valable jusqu'au <strong>${promoEndDate}</strong>. Après cette date, le prix reviendra à ${originalPrice}.
              </p>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Si vous avez des questions, n'hésitez pas à nous contacter via WhatsApp ou email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                <strong>VB Sniper Académie</strong><br>
                Formations et coaching en trading depuis 2022
              </p>
              <p style="margin: 10px 0; color: #999999; font-size: 12px;">
                <a href="${siteUrl}" style="color: #d4af37; text-decoration: none;">${siteUrl}</a>
              </p>
              <p style="margin: 20px 0 0; color: #999999; font-size: 12px;">
                Vous recevez cet email car vous êtes inscrit sur VB Sniper Académie.<br>
                Si vous ne souhaitez plus recevoir nos emails, vous pouvez vous désinscrire.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
${userName}, la promotion se termine bientôt !

Nous vous contactons pour vous rappeler que l'offre promotionnelle sur ${productName} se termine ${promoEndDate}.

⏰ Offre limitée dans le temps
Ne manquez pas cette opportunité unique de rejoindre notre formation à prix réduit.

PRIX OFFICIEL: ${originalPrice}
PRIX PROMOTIONNEL: ${promoPrice}

Profiter de l'offre maintenant: ${productUrl}

Cette offre est valable jusqu'au ${promoEndDate}. Après cette date, le prix reviendra à ${originalPrice}.

VB Sniper Académie
Formations et coaching en trading depuis 2022
${siteUrl}
    `.trim(),
  };
}

export function getPaymentSuccessEmailTemplate(data: {
  productLabel: string;
  amountLabel: string;
  paymentMethod: string;
  referenceId: string;
  dateLabel: string;
  detail?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userId?: string | null;
  monerooPaymentId?: string | null;
  siteUrl?: string;
}) {
  const {
    productLabel,
    amountLabel,
    paymentMethod,
    referenceId,
    dateLabel,
    detail,
    userEmail,
    userName,
    userId,
    monerooPaymentId,
    siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com",
  } = data;

  const rows: Array<[string, string]> = [
    ["Produit", productLabel],
    ["Montant", amountLabel],
    ["Méthode", paymentMethod],
    ["Référence", referenceId],
    ["Date", dateLabel],
  ];
  if (detail) rows.push(["Détail", detail]);
  if (userEmail) rows.push(["Client (email)", userEmail]);
  if (userName) rows.push(["Client (nom)", userName]);
  if (userId) rows.push(["User ID", userId]);
  if (monerooPaymentId) rows.push(["Moneroo ID", monerooPaymentId]);

  const htmlRows = rows
    .map(
      ([label, value]) => `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 14px; width: 140px; vertical-align: top;">${label}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #1a1a1a; font-size: 14px; font-weight: 600; vertical-align: top;">${value}</td>
              </tr>`
    )
    .join("");

  return {
    subject: `💰 Paiement réussi — ${productLabel} — ${amountLabel}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement réussi</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: bold;">VB Sniper Académie</h1>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.85;">Notification de paiement</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 20px; margin: 0 0 24px; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: bold;">
                  ✓ Paiement confirmé
                </p>
                <p style="margin: 6px 0 0; color: #047857; font-size: 14px;">
                  Un nouveau paiement a été validé sur la plateforme.
                </p>
              </div>

              <h2 style="margin: 0 0 8px; color: #1a1a1a; font-size: 22px; font-weight: bold;">
                ${productLabel}
              </h2>
              <p style="margin: 0 0 24px; color: #d4af37; font-size: 28px; font-weight: bold;">
                ${amountLabel}
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #eeeeee; border-radius: 6px; overflow: hidden;">
                ${htmlRows}
              </table>

              <div style="margin: 28px 0 0; text-align: center;">
                <a href="${siteUrl}/admin/payments" style="display: inline-block; background-color: #d4af37; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 15px;">
                  Voir les paiements
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 30px; background-color: #fafafa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                Email automatique — VB Sniper Académie<br>
                ${siteUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `
Paiement réussi — VB Sniper Académie

Produit: ${productLabel}
Montant: ${amountLabel}
Méthode: ${paymentMethod}
Référence: ${referenceId}
Date: ${dateLabel}
${detail ? `Détail: ${detail}` : ""}
${userEmail ? `Client (email): ${userEmail}` : ""}
${userName ? `Client (nom): ${userName}` : ""}
${userId ? `User ID: ${userId}` : ""}
${monerooPaymentId ? `Moneroo ID: ${monerooPaymentId}` : ""}

Voir les paiements: ${siteUrl}/admin/payments
    `.trim(),
  };
}

