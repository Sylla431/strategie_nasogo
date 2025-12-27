/**
 * Orange Money API Integration
 * Fonctions pour interagir avec l'API WebPayment d'Orange Money
 * 
 * Documentation: "NEWGuide d'utilisation API webpayment.docx"
 * 
 * API Base URL:
 * - Sandbox: https://api.orange.com/orange-money-webpay/dev/v1
 * - Production: https://api.orange.com/orange-money-webpay/{country}/v1
 */

export interface OrangeMoneyInitiateRequest {
  merchant_key: string; // Clé marchand (pas merchant_id)
  amount: number; // Montant en FCFA
  currency: string; // "OUV" pour sandbox, code pays pour production (ex: "XOF")
  order_id: string; // ID de la commande (unique, max 30 chars)
  return_url: string; // URL de retour en cas de succès (max 120 chars)
  cancel_url: string; // URL de retour en cas d'annulation (max 120 chars)
  notif_url: string; // URL du webhook (max 120 chars)
  lang?: string; // Langue (ex: "fr")
  reference?: string; // Référence marchand (max 30 chars)
}

export interface OrangeMoneyInitiateResponse {
  status: number; // Code HTTP (201 = succès)
  message?: string; // Message de réponse
  pay_token?: string; // Token de paiement
  payment_url?: string; // URL de redirection vers Orange Money
  notif_token?: string; // Token pour vérifier les notifications
  error?: string;
}

export interface OrangeMoneyWebhookPayload {
  status: "SUCCESS" | "FAILED";
  notif_token: string; // Token à vérifier avec celui reçu lors de l'initiation
  txnid: string; // ID de transaction Orange Money
}

export interface OrangeMoneyTransactionStatusRequest {
  order_id: string;
  amount: number;
  pay_token: string;
}

export interface OrangeMoneyTransactionStatusResponse {
  status: "INITIATED" | "PENDING" | "EXPIRED" | "SUCCESS" | "FAILED";
  order_id: string;
  txnid?: string;
}

/**
 * Initie un paiement Orange Money
 * 
 * Documentation: POST https://api.orange.com/orange-money-webpay/dev/v1/webpayment
 * 
 * Headers:
 * - Authorization: Bearer {access_token}
 * - Accept: application/json
 * - Content-Type: application/json
 */
export async function initiatePayment(
  params: OrangeMoneyInitiateRequest
): Promise<OrangeMoneyInitiateResponse> {
  // URL de base selon l'environnement
  const isProduction = process.env.ORANGE_MONEY_ENV === "production";
  const countryCode = process.env.ORANGE_MONEY_COUNTRY_CODE || "dev";
  const apiUrl = isProduction
    ? `https://api.orange.com/orange-money-webpay/${countryCode}/v1`
    : "https://api.orange.com/orange-money-webpay/dev/v1";
  
  const accessToken = process.env.ORANGE_MONEY_ACCESS_TOKEN;
  const merchantKey = params.merchant_key || process.env.ORANGE_MONEY_MERCHANT_KEY || "";

  if (!accessToken) {
    throw new Error("ORANGE_MONEY_ACCESS_TOKEN n'est pas configuré");
  }

  if (!merchantKey) {
    throw new Error("ORANGE_MONEY_MERCHANT_KEY n'est pas configuré et merchant_key n'a pas été fourni");
  }

  try {
    const endpoint = `${apiUrl}/webpayment`;
    
    // Valider les longueurs selon la documentation
    if (params.order_id.length > 30) {
      throw new Error("order_id doit faire maximum 30 caractères");
    }
    if (params.return_url.length > 120) {
      throw new Error("return_url doit faire maximum 120 caractères");
    }
    if (params.cancel_url.length > 120) {
      throw new Error("cancel_url doit faire maximum 120 caractères");
    }
    if (params.notif_url.length > 120) {
      throw new Error("notif_url doit faire maximum 120 caractères");
    }
    if (params.reference && params.reference.length > 30) {
      throw new Error("reference doit faire maximum 30 caractères");
    }

    // Valider le montant (doit être un nombre entier positif)
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new Error("amount doit être un nombre entier positif");
    }

    // Valider la currency
    const currency = params.currency || (isProduction ? "XOF" : "OUV");
    if (!currency || currency.length !== 3) {
      throw new Error("currency doit être un code à 3 caractères (ex: XOF, OUV)");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };
    
    // Valider que amount est un nombre valide
    const amountValue = Math.round(Number(params.amount));
    if (isNaN(amountValue) || amountValue <= 0) {
      throw new Error(`amount invalide: ${params.amount} (doit être un nombre > 0)`);
    }

    // Valider que currency est définie
    const currencyValue = String(currency).trim().toUpperCase();
    if (!currencyValue || currencyValue.length !== 3) {
      throw new Error(`currency invalide: ${currency} (doit être un code à 3 caractères)`);
    }

    // Format exact selon la documentation - construire l'objet proprement
    const requestBody: Record<string, string | number> = {
      merchant_key: String(merchantKey).trim(), // S'assurer que c'est une string
      currency: currencyValue, // Code devise en majuscules (XOF ou OUV)
      order_id: String(params.order_id).trim(), // S'assurer que c'est une string
      amount: amountValue, // Montant en entier
      return_url: String(params.return_url).trim(), // S'assurer que c'est une string
      cancel_url: String(params.cancel_url).trim(), // S'assurer que c'est une string
      notif_url: String(params.notif_url).trim(), // S'assurer que c'est une string
    };

    // Ajouter les champs optionnels seulement s'ils sont définis et non vides
    if (params.lang && params.lang.trim()) {
      requestBody.lang = String(params.lang).trim();
    }
    if (params.reference && params.reference.trim()) {
      requestBody.reference = String(params.reference).trim();
    }

    // Log pour debug (à retirer en production)
    console.log("Orange Money API Request:", {
      endpoint,
      body: {
        ...requestBody,
        merchant_key: merchantKey ? `${merchantKey.substring(0, 4)}...` : "undefined",
      },
      hasAccessToken: !!accessToken,
      hasMerchantKey: !!merchantKey,
      amountType: typeof requestBody.amount,
      currencyType: typeof requestBody.currency,
      amountValue: requestBody.amount,
      currencyValue: requestBody.currency,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Log la réponse pour debug
    console.log("Orange Money API Response:", {
      status: response.status,
      data,
    });

    // Selon la documentation, status 201 = succès
    if (response.status !== 201) {
      // Log détaillé de l'erreur pour debug
      console.error("Orange Money API Error:", {
        status: response.status,
        statusText: response.statusText,
        data,
        requestBody,
      });

      // Retourner un message d'erreur plus détaillé
      const errorMessage = 
        data.message || 
        data.error || 
        data.errorMessage || 
        data.error_description ||
        `Erreur ${response.status}: ${response.statusText}`;
      
      return {
        status: response.status,
        error: errorMessage,
      };
    }

    // Format de réponse selon la documentation
    return {
      status: data.status || response.status,
      message: data.message,
      pay_token: data.pay_token,
      payment_url: data.payment_url,
      notif_token: data.notif_token,
    };
  } catch (error) {
    console.error("Error initiating Orange Money payment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Erreur réseau lors de l'initiation du paiement",
    };
  }
}

/**
 * Vérifie l'authenticité d'une notification Orange Money
 * 
 * Documentation: La vérification se fait en comparant le notif_token
 * reçu dans la notification avec celui reçu lors de l'initiation du paiement.
 * 
 * Le notif_token doit être stocké lors de l'initiation et comparé ici.
 */
export function verifyWebhookToken(
  receivedNotifToken: string,
  expectedNotifToken: string
): boolean {
  if (!expectedNotifToken) {
    console.warn("notif_token attendu non disponible, notification non vérifiée");
    return false;
  }

  // Comparaison simple des tokens selon la documentation
  return receivedNotifToken === expectedNotifToken;
}

/**
 * Vérifie le statut d'une transaction Orange Money
 * 
 * Documentation: POST https://api.orange.com/orange-money-webpay/dev/v1/transactionstatus
 * 
 * Headers:
 * - Authorization: Bearer {access_token}
 * - Accept: application/json
 * - Content-Type: application/json
 */
export async function checkPaymentStatus(
  params: OrangeMoneyTransactionStatusRequest
): Promise<OrangeMoneyTransactionStatusResponse> {
  const isProduction = process.env.ORANGE_MONEY_ENV === "production";
  const countryCode = process.env.ORANGE_MONEY_COUNTRY_CODE || "dev";
  const apiUrl = isProduction
    ? `https://api.orange.com/orange-money-webpay/${countryCode}/v1`
    : "https://api.orange.com/orange-money-webpay/dev/v1";
  
  const accessToken = process.env.ORANGE_MONEY_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("ORANGE_MONEY_ACCESS_TOKEN non configuré");
  }

  try {
    const endpoint = `${apiUrl}/transactionstatus`;
    
    const headers: HeadersInit = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };

    // Format exact selon la documentation
    const requestBody = {
      order_id: params.order_id,
      amount: params.amount,
      pay_token: params.pay_token,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (response.status !== 201) {
      throw new Error(`Erreur lors de la vérification: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format de réponse selon la documentation
    return {
      status: data.status, // INITIATED, PENDING, EXPIRED, SUCCESS, FAILED
      order_id: data.order_id,
      txnid: data.txnid,
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
}

