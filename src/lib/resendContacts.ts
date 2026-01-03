import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface AddContactToResendParams {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  audienceId?: string; // ID de l'audience Resend (optionnel)
}

/**
 * Ajoute un contact à Resend
 * @param params - Informations du contact
 * @returns Succès ou erreur
 */
export async function addContactToResend(params: AddContactToResendParams): Promise<{
  success: boolean;
  error?: string;
  data?: unknown;
}> {
  if (!process.env.RESEND_API_KEY) {
    return {
      success: false,
      error: "RESEND_API_KEY non configurée",
    };
  }

  try {
    // Séparer le prénom et nom si full_name est fourni
    const firstName = params.firstName;
    const lastName = params.lastName;

    // Si on a un full_name mais pas de firstName/lastName séparés
    // On peut essayer de le séparer (optionnel, à améliorer si nécessaire)

    // Ajouter le contact à Resend
    const contactData: {
      email: string;
      firstName?: string;
      lastName?: string;
      unsubscribed?: boolean;
    } = {
      email: params.email,
      unsubscribed: false,
    };

    if (firstName) {
      contactData.firstName = firstName;
    }
    if (lastName) {
      contactData.lastName = lastName;
    }

    // Utiliser l'API Resend pour créer le contact
    // Note: Si audienceId est fourni, on peut l'ajouter à une audience spécifique
    // L'API Resend utilise contacts.create() pour ajouter un contact
    const contactPayload: {
      email: string;
      firstName?: string;
      lastName?: string;
      unsubscribed?: boolean;
      audienceId?: string;
    } = {
      email: contactData.email,
      unsubscribed: contactData.unsubscribed,
    };

    if (contactData.firstName) {
      contactPayload.firstName = contactData.firstName;
    }
    if (contactData.lastName) {
      contactPayload.lastName = contactData.lastName;
    }
    if (params.audienceId) {
      contactPayload.audienceId = params.audienceId;
    }

    const { data, error } = await resend.contacts.create(contactPayload);

    if (error) {
      console.error("Erreur Resend API:", error);
      // Si le contact existe déjà, ce n'est pas une erreur critique
      if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
        return {
          success: true,
          data: { email: params.email, message: "Contact déjà existant" },
        };
      }
      return {
        success: false,
        error: error.message || "Erreur lors de l'ajout du contact",
      };
    }

    return {
      success: true,
      data: data || { email: params.email, message: "Contact ajouté avec succès" },
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du contact à Resend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

