import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getProfileRole(
  supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"],
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (error) return null;
  return typeof data?.role === "string" ? data.role.trim().toLowerCase() : null;
}

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Vérifier si c'est un admin
  const role = await getProfileRole(supabase);
  const isAdmin = role === "admin";

  if (isAdmin) {
    // Pour les admins, utiliser la fonction SQL qui contourne RLS
    const { data: accessData, error: accessError } = await supabase.rpc("get_all_course_accesses", {
      p_admin_id: authData.user.id,
    });

    if (accessError) {
      console.error("Error fetching all accesses:", accessError);
      return NextResponse.json({ error: accessError.message }, { status: 400 });
    }

    // La fonction retourne un JSONB qui peut être un tableau ou null
    let accesses = [];
    if (accessData) {
      // Si c'est déjà un tableau, l'utiliser tel quel
      if (Array.isArray(accessData)) {
        accesses = accessData;
      } else if (typeof accessData === 'string') {
        // Si c'est une string JSON, la parser
        try {
          accesses = JSON.parse(accessData);
        } catch (e) {
          console.error("Error parsing access data:", e);
          accesses = [];
        }
      } else if (typeof accessData === 'object') {
        // Si c'est un objet JSONB, le convertir en tableau
        accesses = [accessData];
      }
    }
    
    return NextResponse.json(accesses);
  } else {
    // Pour les non-admins, retourner uniquement leurs propres accès
    // Inclure les course_videos avec toutes les colonnes nécessaires
    // Spécifier explicitement les relations users_profile pour éviter l'ambiguïté
  const { data, error } = await supabase
    .from("course_access")
      .select(`
        *,
        courses(
          *,
          course_videos(
            id,
            course_id,
            title,
            video_url,
            position,
            created_at
          )
        )
      `)
    .eq("user_id", authData.user.id)
    .order("granted_at", { ascending: false });

    if (error) {
      console.error("Error fetching course access:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Log pour déboguer
    if (data && data.length > 0) {
      console.log("Course access data sample:", JSON.stringify(data[0], null, 2));
    }
    
    return NextResponse.json(data || []);
  }
}

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  
  // Vérifier l'authentification
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier le rôle
  const role = await getProfileRole(supabase);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Accès admin requis" }, { status: 403 });
  }

  const { email, course_id } = await req.json();
  if (!email || !course_id) {
    return NextResponse.json({ error: "email et course_id requis" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
  }

  // Recherche email via service role (find_user_by_email n'est plus exécutable côté client authentifié)
  const { data: userIdData, error: findError } = await supabaseAdmin.rpc("find_user_by_email", {
    user_email: email.toLowerCase().trim(),
  });

  if (findError) {
    return NextResponse.json({ error: `Erreur recherche utilisateur: ${findError.message}` }, { status: 400 });
  }

  const userId = userIdData as string | null;
  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non trouvé avec cet email" }, { status: 404 });
  }

  // Obtenir l'ID de l'admin qui accorde l'accès
  const grantedBy = authData.user.id;

  const { data: accessData, error: accessError } = await supabaseAdmin.rpc("grant_course_access", {
    p_user_id: userId,
    p_course_id: course_id,
    p_granted_by: grantedBy,
  });

  if (accessError) {
    console.error("Error granting course access:", accessError);
    // Si l'erreur indique que l'utilisateur n'est pas admin
    if (accessError.message?.includes("admin")) {
      return NextResponse.json({ error: "Seuls les admins peuvent accorder l'accès" }, { status: 403 });
    }
    // Si l'erreur indique que l'utilisateur n'existe pas
    if (accessError.message?.includes("non trouvé") || accessError.message?.includes("not found")) {
      return NextResponse.json({ error: "Utilisateur non trouvé. Veuillez vérifier que l'utilisateur a bien créé un compte." }, { status: 404 });
    }
    // Si l'erreur indique une violation de contrainte de clé étrangère
    if (accessError.code === "23503" || accessError.message?.includes("foreign key")) {
      return NextResponse.json({ 
        error: "Erreur: Le profil utilisateur n'existe pas. Veuillez réessayer ou contacter le support.",
        code: accessError.code,
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: accessError.message || "Erreur lors de l'attribution de l'accès",
      code: accessError.code,
    }, { status: 400 });
  }

  if (!accessData) {
    return NextResponse.json({ error: "L'utilisateur a déjà accès à ce cours" }, { status: 409 });
  }

  const { data: fullData, error: fetchError } = await supabaseAdmin
    .from("course_access")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .single();

  if (fetchError) {
    // Si on ne peut pas récupérer les données complètes, retourner au moins les données de base
    return NextResponse.json(accessData, { status: 201 });
  }

  return NextResponse.json(fullData, { status: 201 });
}

/**
 * DELETE /api/access
 * Révoque l'accès d'un utilisateur à un cours (admin only).
 * Body: { access_id } OU { email, course_id } OU { user_id, course_id }
 * Supprime course_access et passe les commandes paid → failed pour ce couple.
 */
export async function DELETE(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = await getProfileRole(supabase);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Accès admin requis" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const accessId = typeof body.access_id === "string" ? body.access_id.trim() : "";
  const courseId = typeof body.course_id === "string" ? body.course_id.trim() : "";
  let userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

  let targetUserId = userId;
  let targetCourseId = courseId;

  if (accessId) {
    const { data: accessRow, error: accessLookupError } = await supabaseAdmin
      .from("course_access")
      .select("id, user_id, course_id")
      .eq("id", accessId)
      .maybeSingle();

    if (accessLookupError) {
      return NextResponse.json({ error: accessLookupError.message }, { status: 400 });
    }
    if (!accessRow) {
      return NextResponse.json({ error: "Accès introuvable" }, { status: 404 });
    }
    targetUserId = accessRow.user_id;
    targetCourseId = accessRow.course_id;
  } else {
    if (!targetCourseId) {
      return NextResponse.json({ error: "access_id ou (course_id + email/user_id) requis" }, { status: 400 });
    }
    if (!targetUserId && email) {
      const { data: foundUserId, error: findError } = await supabaseAdmin.rpc("find_user_by_email", {
        user_email: email,
      });
      if (findError) {
        return NextResponse.json({ error: `Erreur recherche utilisateur: ${findError.message}` }, { status: 400 });
      }
      targetUserId = (foundUserId as string | null) || "";
      if (!targetUserId) {
        return NextResponse.json({ error: "Utilisateur non trouvé avec cet email" }, { status: 404 });
      }
    }
    if (!targetUserId) {
      return NextResponse.json({ error: "email ou user_id requis" }, { status: 400 });
    }
  }

  // 1) Supprimer l'accès accordé
  const { data: deletedAccess, error: deleteError } = await supabaseAdmin
    .from("course_access")
    .delete()
    .eq("user_id", targetUserId)
    .eq("course_id", targetCourseId)
    .select("id");

  if (deleteError) {
    console.error("Error revoking course access:", deleteError);
    return NextResponse.json({ error: deleteError.message || "Erreur révocation accès" }, { status: 400 });
  }

  // 2) Neutraliser les commandes payées (sinon accès via order.status=paid)
  const { data: paidOrders, error: ordersLookupError } = await supabaseAdmin
    .from("orders")
    .select("id, payment_reference")
    .eq("user_id", targetUserId)
    .eq("course_id", targetCourseId)
    .eq("status", "paid");

  if (ordersLookupError) {
    console.error("Error looking up paid orders for revoke:", ordersLookupError);
  }

  let revokedOrders = 0;
  if (paidOrders && paidOrders.length > 0) {
    for (const order of paidOrders) {
      let paymentData: Record<string, unknown> = {};
      if (order.payment_reference) {
        try {
          paymentData = JSON.parse(order.payment_reference);
        } catch {
          paymentData = { previous_reference: order.payment_reference };
        }
      }
      paymentData.revoked_at = new Date().toISOString();
      paymentData.revoked_by = authData.user.id;
      paymentData.revoked_reason = "admin_revoke_access";

      const { error: updateOrderError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "failed",
          payment_reference: JSON.stringify(paymentData),
        })
        .eq("id", order.id);

      if (updateOrderError) {
        console.error("Error updating order on revoke:", order.id, updateOrderError);
      } else {
        revokedOrders += 1;
      }
    }
  }

  const accessDeleted = Array.isArray(deletedAccess) ? deletedAccess.length : 0;
  if (accessDeleted === 0 && revokedOrders === 0) {
    return NextResponse.json(
      { error: "Aucun accès ni commande payée trouvé pour cet utilisateur/cours" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Accès révoqué",
    access_deleted: accessDeleted,
    orders_revoked: revokedOrders,
    user_id: targetUserId,
    course_id: targetCourseId,
  });
}

