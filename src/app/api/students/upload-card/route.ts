import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const STUDENT_CARD_BUCKET = "student-cards";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

type AdminUser = {
  id: string;
};

async function requireAdmin(req: NextRequest): Promise<{ user: AdminUser | null; error: NextResponse | null }> {
  if (!supabaseAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 }),
    };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { user: null, error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return { user: { id: user.id }, error: null };
}

async function ensureBucketExists() {
  if (!supabaseAdmin) throw new Error("Client admin Supabase non initialisé");
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw new Error(listError.message);

  const existing = buckets.find((bucket) => bucket.name === STUDENT_CARD_BUCKET);
  if (existing) return;

  const { error: createError } = await supabaseAdmin.storage.createBucket(STUDENT_CARD_BUCKET, {
    public: false,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_TYPES,
  });
  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw new Error(createError.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) return adminCheck.error;
    if (!supabaseAdmin || !adminCheck.user) {
      return NextResponse.json({ error: "Client admin Supabase non initialisé" }, { status: 500 });
    }

    const formData = await req.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(fileValue.type)) {
      return NextResponse.json({ error: "Format non autorisé (jpeg, png, webp)" }, { status: 400 });
    }

    await ensureBucketExists();

    const extension = fileValue.name.split(".").pop()?.toLowerCase() || "jpg";
    const random = Math.random().toString(36).slice(2, 10);
    const path = `${adminCheck.user.id}/${Date.now()}-${random}.${extension}`;

    const arrayBuffer = await fileValue.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STUDENT_CARD_BUCKET)
      .upload(path, fileBuffer, {
        contentType: fileValue.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: signed } = await supabaseAdmin.storage
      .from(STUDENT_CARD_BUCKET)
      .createSignedUrl(path, 60 * 30);

    return NextResponse.json({
      path,
      signed_url: signed?.signedUrl ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 },
    );
  }
}

