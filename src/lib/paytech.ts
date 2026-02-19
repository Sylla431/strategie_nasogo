/**
 * PayTech API Integration
 * Fonctions pour interagir avec l'API PayTech
 * 
 * Documentation officielle: https://doc.intech.sn/doc_paytech.php
 * Collection Postman: https://doc.intech.sn/PayTech%20x%20DOC.postman_collection.json
 * 
 * API Base URL: https://paytech.sn/api
 * 
 * IMPORTANT: Les clés API doivent être envoyées dans les headers:
 * - API_KEY: votre clé API
 * - API_SECRET: votre clé secrète
 */

import crypto from "crypto";

export interface PayTechInitiateRequest {
  item_name: string; // Nom du produit ou service (obligatoire)
  item_price: number; // Prix de la commande en FCFA (obligatoire)
  ref_command: string; // Référence unique de la commande (obligatoire)
  command_name: string; // Description de la commande (obligatoire)
  currency?: string; // Devise (XOF, EUR, USD, CAD, GBP, MAD). Par défaut: XOF
  env?: string; // Environnement (test, prod). Par défaut: prod
  ipn_url?: string; // URL de notification (HTTPS uniquement)
  success_url?: string; // URL de redirection après paiement réussi
  cancel_url?: string; // URL de redirection après annulation
  custom_field?: string; // Données additionnelles (JSON encodé)
  target_payment?: string; // Méthode de paiement ciblée (ex: "Orange Money") ou plusieurs séparées par virgule
  refund_notif_url?: string; // URL de notification pour les remboursements (HTTPS)
}

export interface PayTechInitiateResponse {
  success: number; // 1 = succès, -1 = erreur
  token?: string; // Token de paiement PayTech
  redirect_url?: string; // URL de redirection vers PayTech
  redirectUrl?: string; // Alias de redirect_url
  message?: string; // Message d'erreur si success = -1
}

export interface PayTechWebhookPayload {
  type_event: "sale_complete" | "sale_canceled" | "refund_complete" | "transfer_success" | "transfer_failed";
  custom_field?: string; // Encodé en Base64
  ref_command: string; // Référence de la commande
  item_name: string; // Nom du produit
  item_price: number; // Prix pour compatibilité API
  item_price_xof?: number; // Prix en XOF
  initial_item_price?: number; // Prix initial avant promotions
  initial_item_price_xof?: number;
  final_item_price?: number; // Prix final après promotions
  final_item_price_xof?: number;
  promo_enabled?: boolean; // Si une promotion a été appliquée
  promo_value_percent?: number; // Pourcentage de réduction
  currency: string; // Devise
  command_name: string; // Description de la commande
  token: string; // Token de paiement
  env: string; // Environnement (test, prod)
  payment_method?: string; // Méthode utilisée (Orange Money, Wave, etc.)
  client_phone?: string; // Numéro de téléphone du client
  // Vérification de sécurité
  api_key_sha256: string; // Clé API hachée en SHA256
  api_secret_sha256: string; // Clé secrète hachée en SHA256
  hmac_compute?: string; // HMAC-SHA256 (si disponible, méthode recommandée)
  // Pour les transfers
  created_at?: string;
  external_id?: string;
  token_transfer?: string | null;
  id_transfer?: string;
  amount?: number;
  amount_xof?: number;
  service_items_id?: string;
  service_name?: string;
  state?: string;
  destination_number?: string;
  validate_at?: string | null;
  failed_at?: string | null;
  fee_percent?: number;
  rejected_at?: string | null;
}

/**
 * Initie un paiement PayTech
 * 
 * Documentation: POST https://paytech.sn/api/payment/request-payment
 * 
 * Headers requis:
 * - API_KEY: votre clé API
 * - API_SECRET: votre clé secrète
 * - Content-Type: application/json
 */
export async function initiatePayment(
  params: PayTechInitiateRequest
): Promise<PayTechInitiateResponse> {
  const apiUrl = "https://paytech.sn/api";
  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("PAYTECH_API_KEY et PAYTECH_API_SECRET doivent être configurés");
  }

  try {
    const endpoint = `${apiUrl}/payment/request-payment`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "API_KEY": apiKey,
      "API_SECRET": apiSecret,
    };

    // Préparer le body selon la documentation officielle
    const requestBody: PayTechInitiateRequest = {
      item_name: params.item_name,
      item_price: Math.round(Number(params.item_price)),
      ref_command: params.ref_command,
      command_name: params.command_name,
      currency: params.currency || "XOF",
      env: params.env || (process.env.PAYTECH_ENV === "production" ? "prod" : "test"),
      ...(params.ipn_url && { ipn_url: params.ipn_url }),
      ...(params.success_url && { success_url: params.success_url }),
      ...(params.cancel_url && { cancel_url: params.cancel_url }),
      ...(params.custom_field && { custom_field: params.custom_field }),
      ...(params.target_payment && { target_payment: params.target_payment }),
      ...(params.refund_notif_url && { refund_notif_url: params.refund_notif_url }),
    };

    console.log("PayTech API Request:", {
      endpoint,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      item_name: requestBody.item_name,
      item_price: requestBody.item_price,
      ref_command: requestBody.ref_command,
      env: requestBody.env,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("PayTech API Response:", {
      status: response.status,
      data,
    });

    // Selon la documentation, success doit être strictement égal à 1 ou true pour succès
    if (data.success !== 1 && data.success !== true) {
      const errorMessage = 
        data.message || 
        `Erreur lors de l'initiation du paiement PayTech`;
      
      return {
        success: -1,
        message: errorMessage,
      };
    }

    return {
      success: 1,
      token: data.token,
      redirect_url: data.redirect_url || data.redirectUrl,
      redirectUrl: data.redirect_url || data.redirectUrl,
    };
  } catch (error) {
    console.error("Error initiating PayTech payment:", error);
    return {
      success: -1,
      message: error instanceof Error ? error.message : "Erreur réseau lors de l'initiation du paiement",
    };
  }
}

/**
 * Vérifie l'authenticité d'une notification PayTech (IPN)
 * 
 * PayTech propose deux méthodes de vérification:
 * 1. HMAC-SHA256 (recommandée) - via le champ hmac_compute
 * 2. SHA256 (classique) - via api_key_sha256 et api_secret_sha256
 * 
 * Documentation: https://doc.intech.sn/doc_paytech.php#ipnfonctionment
 */
export function verifyWebhookSignature(
  payload: PayTechWebhookPayload
): boolean {
  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn("PAYTECH_API_KEY ou PAYTECH_API_SECRET non disponible, notification non vérifiée");
    return false;
  }

  // Méthode 1: Vérification HMAC-SHA256 (Recommandée)
  if (payload.hmac_compute) {
    // Pour les paiements: message = amount|ref_command|api_key
    // Pour les transfers: message = amount|id_transfer|api_key
    let message: string;
    
    if (payload.type_event === "transfer_success" || payload.type_event === "transfer_failed") {
      // Transfer
      const amount = payload.amount || payload.amount_xof || 0;
      const idTransfer = payload.id_transfer || "";
      message = `${amount}|${idTransfer}|${apiKey}`;
    } else {
      // Paiement
      const amount = payload.final_item_price || payload.item_price || 0;
      message = `${amount}|${payload.ref_command}|${apiKey}`;
    }

    const expectedHmac = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    if (expectedHmac === payload.hmac_compute) {
      console.log("✅ Notification authentifiée via HMAC-SHA256");
      return true;
    } else {
      console.error("❌ HMAC invalide");
      return false;
    }
  }

  // Méthode 2: Vérification SHA256 (Alternative)
  if (payload.api_key_sha256 && payload.api_secret_sha256) {
    const expectedApiKeyHash = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");
    
    const expectedApiSecretHash = crypto
      .createHash("sha256")
      .update(apiSecret)
      .digest("hex");

    if (
      expectedApiKeyHash === payload.api_key_sha256 &&
      expectedApiSecretHash === payload.api_secret_sha256
    ) {
      console.log("✅ Notification authentifiée via SHA256");
      return true;
    } else {
      console.error("❌ Clés SHA256 invalides");
      return false;
    }
  }

  console.warn("⚠️ Aucune méthode de vérification disponible dans le payload");
  return false;
}

/**
 * Décode le champ custom_field depuis Base64
 */
export function decodeCustomField(customField: string | undefined): Record<string, unknown> {
  if (!customField) {
    return {};
  }

  try {
    const decoded = Buffer.from(customField, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Erreur décodage custom_field:", error);
    // Si ce n'est pas du Base64, essayer de parser directement
    try {
      return JSON.parse(customField);
    } catch {
      return {};
    }
  }
}
