import { NextRequest, NextResponse } from "next/server";
import { getPromoEndingEmailTemplate } from "@/lib/emailTemplates";

export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de l'URL
    const { searchParams } = new URL(req.url);
    
    const promoEndDate = searchParams.get("promoEndDate") || "31 décembre 2025";
    const promoPrice = searchParams.get("promoPrice") || "27 500 F CFA";
    const originalPrice = searchParams.get("originalPrice") || "39 700 F CFA";
    const productName = searchParams.get("productName") || "Stratégie Nasongon";
    const productUrl = searchParams.get("productUrl") || "https://vbsniperacademie.com/services/strategie-nasongon";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vbsniperacademie.com";

    // Générer le template
    const template = getPromoEndingEmailTemplate({
      promoEndDate,
      promoPrice,
      originalPrice,
      productName,
      productUrl,
      siteUrl,
    });

    // Retourner le template HTML
    return NextResponse.json({
      success: true,
      html: template.html,
      text: template.text,
      subject: template.subject,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du template:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du template",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

