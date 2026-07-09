/**
 * Moneroo API Integration
 * Fonctions pour interagir avec l'API Moneroo
 * 
 * Documentation: https://docs.moneroo.io/
 * 
 * API Base URL:
 * - Production: https://api.moneroo.io
 * 
 * Note: Si PayTech est configuré comme passerelle dans Moneroo,
 * utilisez MONEROO_WEBHOOK_SECRET pour vérifier les webhooks.
 */

import crypto from "crypto";

export interface MonerooInitiateRequest {
  amount: number; // Montant en FCFA
  currency: string; // "XOF" pour FCFA
  description: string; // Description de la commande (obligatoire)
  return_url: string; // URL de retour en cas de succès
  customer: {
    email: string; // Email du client (obligatoire)
    first_name: string; // Prénom du client (obligatoire)
    last_name: string; // Nom du client (obligatoire)
    phone?: string; // Téléphone du client (optionnel)
  };
  metadata?: Record<string, string>; // Métadonnées additionnelles (ex: order_id)
  methods?: string[]; // Méthodes de paiement spécifiques (optionnel)
  webhook_url?: string; // URL du webhook (optionnel)
}

export interface MonerooInitiateResponse {
  status: number; // Code HTTP (200 ou 201 = succès)
  message?: string; // Message de réponse
  payment_id?: string; // ID de paiement Moneroo
  payment_url?: string; // URL de redirection vers Moneroo
  error?: string;
}

export interface MonerooWebhookPayload {
  event: "payment.initiated" | "payment.success" | "payment.failed" | "payment.cancelled";
  data: {
    id: string; // ID du paiement
    status: "initiated" | "success" | "failed" | "cancelled";
    amount: number; // Montant
    currency: string; // Devise
    reference?: string; // Référence
    metadata?: Record<string, string>; // Métadonnées (order_id, etc.)
  };
}

export interface MonerooVerifyResponse {
  status: number;
  data?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  };
  error?: string;
}

/**
 * Initie un paiement Moneroo
 * 
 * Documentation: POST https://api.moneroo.io/v1/payments/initialize
 * 
 * Headers:
 * - Authorization: Bearer {secret_key}
 * - Accept: application/json
 * - Content-Type: application/json
 * 
 * Référence: https://docs.moneroo.io/payments/standard-integration
 */
export async function initiatePayment(
  params: MonerooInitiateRequest
): Promise<MonerooInitiateResponse> {
  const apiUrl = "https://api.moneroo.io";
  const secretKey = process.env.MONEROO_SECRET_KEY?.trim(); // Supprimer les espaces éventuels

  if (!secretKey) {
    throw new Error("MONEROO_SECRET_KEY n'est pas configuré");
  }

  // Vérifier le format de la clé selon la documentation Moneroo
  // Les clés sandbox commencent généralement par "test_", les clés live peuvent avoir d'autres formats
  const isSandboxKey = secretKey.startsWith("test_");
  const isValidFormat = secretKey.startsWith("test_") || 
                        secretKey.startsWith("sk_") || 
                        secretKey.startsWith("ih_") ||
                        secretKey.length > 20; // Format flexible pour les autres formats
  
  if (!isValidFormat) {
    console.warn("⚠️ La clé Moneroo ne semble pas avoir un format valide.");
  }
  
  if (!isSandboxKey && process.env.NODE_ENV === "development") {
    console.warn("⚠️ Vous utilisez une clé non-sandbox en développement. Pour tester, utilisez une clé sandbox (commence par 'test_').");
  }

  try {
    const endpoint = `${apiUrl}/v1/payments/initialize`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${secretKey}`,
    };

    console.log("Moneroo API Configuration:", {
      endpoint,
      hasSecretKey: !!secretKey,
      secretKeyPrefix: secretKey.substring(0, Math.min(10, secretKey.length)) + "...", // Afficher seulement le début pour sécurité
      secretKeyLength: secretKey.length,
      isSandboxKey: isSandboxKey,
      environment: process.env.NODE_ENV,
    });

    // Construire le body selon le format Moneroo
    const requestBody = {
      amount: Math.round(Number(params.amount)),
      currency: params.currency || "XOF",
      description: params.description,
      return_url: params.return_url,
      customer: {
        email: params.customer.email,
        first_name: params.customer.first_name,
        last_name: params.customer.last_name,
        ...(params.customer.phone && { phone: params.customer.phone }),
      },
      ...(params.metadata && { metadata: params.metadata }),
      ...(params.methods && { methods: params.methods }),
      ...(params.webhook_url && { webhook_url: params.webhook_url }),
    };

    console.log("Moneroo API Request:", {
      endpoint,
      hasSecretKey: !!secretKey,
      amount: requestBody.amount,
      currency: requestBody.currency,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("Moneroo API Response:", {
      status: response.status,
      data,
    });

    // Moneroo retourne 201 pour un paiement initialisé avec succès
    if (response.status !== 201) {
      const errorMessage = 
        data.message || 
        data.error || 
        `Erreur ${response.status}: ${response.statusText}`;
      
      return {
        status: response.status,
        error: errorMessage,
      };
    }

    // Format de réponse Moneroo: { message: "...", data: { id: "...", checkout_url: "..." } }
    return {
      status: response.status,
      message: data.message,
      payment_id: data.data?.id,
      payment_url: data.data?.checkout_url,
    };
  } catch (error) {
    console.error("Error initiating Moneroo payment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Erreur réseau lors de l'initiation du paiement",
    };
  }
}

/**
 * Vérifie le statut d'une transaction Moneroo
 * Documentation: GET https://api.moneroo.io/v1/payments/{paymentId}/verify
 */
export async function verifyPayment(paymentId: string): Promise<MonerooVerifyResponse> {
  const secretKey = process.env.MONEROO_SECRET_KEY?.trim();
  if (!secretKey) {
    return { status: 500, error: "MONEROO_SECRET_KEY n'est pas configuré" };
  }

  try {
    const response = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        status: response.status,
        error: data.message || data.error || `Erreur ${response.status}`,
      };
    }

    return {
      status: response.status,
      data: data.data,
    };
  } catch (error) {
    console.error("Error verifying Moneroo payment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Erreur réseau",
    };
  }
}

/**
 * Vérifie l'authenticité d'une notification Moneroo
 * Documentation: HMAC-SHA256 avec X-Moneroo-Signature
 * https://docs.moneroo.io/introduction/webhooks
 */
export function verifyWebhookToken(
  payload: unknown,
  headers: HeadersInit
): boolean {
  const webhookSecret = process.env.MONEROO_WEBHOOK_SECRET?.trim();

  // Sans secret configuré : accepter en loggant un warning (dev / migration)
  if (!webhookSecret) {
    console.warn("⚠️ MONEROO_WEBHOOK_SECRET non configuré — webhook accepté sans vérification de signature");
    return true;
  }

  try {
    const headerMap = headers as Record<string, string>;
    // Next.js lowercasse les headers
    let signature =
      headerMap["x-moneroo-signature"] ||
      headerMap["signature"] ||
      headerMap["x-signature"] ||
      "";

    if (!signature) {
      console.warn("⚠️ Aucune signature trouvée dans les headers du webhook Moneroo");
      return false;
    }

    // Strip éventuel préfixe "sha256="
    if (signature.startsWith("sha256=")) {
      signature = signature.slice("sha256=".length);
    }

    // Obligatoire: raw body string (avant JSON.parse)
    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString, "utf8")
      .digest("hex");

    const sigBuf = Buffer.from(signature.toLowerCase());
    const expBuf = Buffer.from(expectedSignature.toLowerCase());

    if (sigBuf.length !== expBuf.length) {
      console.error("❌ Signature webhook Moneroo invalide (longueur)", {
        got: signature.length,
        expected: expectedSignature.length,
      });
      return false;
    }

    const isValid = crypto.timingSafeEqual(sigBuf, expBuf);

    if (isValid) {
      console.log("✅ Webhook Moneroo authentifié");
    } else {
      console.error("❌ Signature webhook Moneroo invalide");
    }

    return isValid;
  } catch (error) {
    console.error("Erreur lors de la vérification du webhook Moneroo:", error);
    return false;
  }
}
