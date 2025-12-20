import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
  const role = await getProfileRole(supabase);
  const isAdmin = role === "admin";
  
  // Pour les admins, renvoyer toutes les données
  // Pour les clients, masquer les URLs des vidéos
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_videos(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  // Si ce n'est pas un admin, masquer les URLs des vidéos
  if (!isAdmin && data) {
    const sanitizedData = data.map((course) => {
      const sanitized: typeof course = { ...course };
      
      // Masquer video_url (JSONB)
      if (sanitized.video_url) {
        if (Array.isArray(sanitized.video_url)) {
          sanitized.video_url = sanitized.video_url.map((v: { title: string; video_url: string; position: number }) => ({
            title: v.title,
            position: v.position,
            video_url: "", // URL masquée
          }));
        }
      }
      
      // Masquer video_url dans course_videos
      if (sanitized.course_videos && Array.isArray(sanitized.course_videos)) {
        sanitized.course_videos = sanitized.course_videos.map((v: { id: string; course_id: string; title: string; video_url: string; position: number; created_at: string }) => ({
          ...v,
          video_url: "", // URL masquée
        }));
      }
      
      return sanitized;
    });
    return NextResponse.json(sanitizedData);
  }
  
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getProfileRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, cover_url, video_url, price } = body;
  if (!title || price === undefined) {
    return NextResponse.json({ error: "title et price requis" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, cover_url, video_url, price }])
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

