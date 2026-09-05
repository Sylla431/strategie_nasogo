import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getRole(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  const { data } = await supabase.from("users_profile").select("role").eq("id", authData.user.id).single();
  return typeof data?.role === "string" ? data.role.trim().toLowerCase() : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  const { id, videoId } = await params;
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, video_url, position } = await req.json();
  const update: { title?: string; video_url?: string; position?: number } = {};
  if (title !== undefined) update.title = title;
  if (video_url !== undefined) update.video_url = video_url;
  if (position !== undefined) update.position = Number(position);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("course_videos")
    .update(update)
    .eq("id", videoId)
    .eq("course_id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  const { id, videoId } = await params;
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("course_videos")
    .delete()
    .eq("id", videoId)
    .eq("course_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
