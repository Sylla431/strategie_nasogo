import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseFromRequest } from "@/lib/supabaseServer";

async function getRole(supabase: ReturnType<typeof createSupabaseFromRequest>["supabase"]) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  const { data } = await supabase.from("users_profile").select("role").eq("id", authData.user.id).single();
  return typeof data?.role === "string" ? data.role.trim().toLowerCase() : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = createSupabaseFromRequest(req);
  const { data, error } = await supabase
    .from("course_videos")
    .select("*")
    .eq("course_id", id)
    .order("position", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = createSupabaseFromRequest(req);
  const role = await getRole(supabase);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, video_url, position } = await req.json();
  if (!title || !video_url) return NextResponse.json({ error: "title et video_url requis" }, { status: 400 });

  const { data, error } = await supabase
    .from("course_videos")
    .insert([{ course_id: id, title, video_url, position: Number(position ?? 0) }])
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

