import { NextRequest, NextResponse } from "next/server";
import { addContactToResend } from "@/lib/resendContacts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, fullName } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Séparer fullName en firstName et lastName si fourni
    let firstNameValue = firstName;
    let lastNameValue = lastName;

    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length > 1) {
        firstNameValue = nameParts[0];
        lastNameValue = nameParts.slice(1).join(" ");
      } else {
        firstNameValue = fullName;
      }
    }

    // Récupérer l'audience ID depuis les variables d'environnement (optionnel)
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    const result = await addContactToResend({
      email,
      firstName: firstNameValue,
      lastName: lastNameValue,
      phone,
      audienceId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur lors de l'ajout du contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact ajouté à Resend avec succès",
      data: result.data,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du contact:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'ajout du contact",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

