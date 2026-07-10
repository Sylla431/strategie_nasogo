import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest, getAuthUserId } from "@/lib/supabaseServer";
import { initiateMonerooForOrder } from "@/lib/payments/initiateMoneroo";

/**
 * POST /api/payments/moneroo/initiate
 * Initie un paiement Moneroo pour une commande
 */
export async function POST(req: NextRequest) {
  const { supabase, token } = createSupabaseFromRequest(req);
  const userId = await getAuthUserId(supabase, token);

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId requis" }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "https://vbsniperacademie.com";

    const result = await initiateMonerooForOrder({
      supabase,
      userId,
      orderId,
      appUrl,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      payment_url: result.payment_url,
      payment_id: result.payment_id,
    });
  } catch (error) {
    console.error("Error initiating Moneroo payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
