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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  const { id: courseId, videoId } = await params;
  const { supabase } = createSupabaseFromRequest(req);
  
  // Vérifier l'authentification
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier l'accès au cours
  const userId = authData.user.id;
  
  // Vérifier les accès accordés
  const { data: accessData } = await supabase
    .from("course_access")
    .select("course_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  
  // Vérifier les commandes payées
  const { data: orderData } = await supabase
    .from("orders")
    .select("course_id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "paid")
    .maybeSingle();
  
  // Vérifier si admin
  const role = await getProfileRole(supabase);
  const isAdmin = role === "admin";
  
  if (!accessData && !orderData && !isAdmin) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // Charger le cours
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*, course_videos(*)")
    .eq("id", courseId)
    .single();
  
  if (courseError || !course) {
    return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
  }

  // Trouver la vidéo correspondante
  let videoUrl: string | null = null;
  
  // Chercher dans course_videos (table)
  if (course.course_videos && Array.isArray(course.course_videos)) {
    const video = course.course_videos.find((v) => v.id === videoId || v.id === videoId.split("-")[0]);
    if (video) {
      videoUrl = video.video_url;
    }
  }
  
  // Si pas trouvé, chercher dans video_url (JSONB)
  if (!videoUrl && course.video_url) {
    let videosFromJson: Array<{ title: string; video_url: string; position: number }> = [];
    
    if (Array.isArray(course.video_url)) {
      videosFromJson = course.video_url;
    } else if (typeof course.video_url === "string") {
      try {
        const parsed = JSON.parse(course.video_url);
        videosFromJson = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Ignore
      }
    }
    
    // Chercher la vidéo par index dans videoId
    const indexMatch = videoId.match(/vid-(\d+)/);
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10);
      if (videosFromJson[index]) {
        videoUrl = videosFromJson[index].video_url;
      }
    }
  }
  
  if (!videoUrl) {
    return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });
  }
  
  return NextResponse.json({ video_url: videoUrl });
}

