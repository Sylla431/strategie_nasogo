import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { detectImageMime, extensionForMime } from "@/lib/studentSecurity";

const STUDENT_CARD_BUCKET = "student-cards";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function ensureBucketExists() {
  if (!supabaseAdmin) throw new Error("Client admin Supabase non initialisé");
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw new Error(listError.message);

  const existing = buckets.find((bucket) => bucket.name === STUDENT_CARD_BUCKET);
  if (existing) return;

  const { error: createError } = await supabaseAdmin.storage.createBucket(STUDENT_CARD_BUCKET, {
    public: false,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
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

    const arrayBuffer = await fileValue.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const detectedMime = detectImageMime(fileBuffer);
    if (!detectedMime) {
      return NextResponse.json({ error: "Format non autorisé (jpeg, png, webp)" }, { status: 400 });
    }

    await ensureBucketExists();

    const extension = extensionForMime(detectedMime);
    const random = Math.random().toString(36).slice(2, 10);
    const path = `${adminCheck.user.id}/${Date.now()}-${random}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STUDENT_CARD_BUCKET)
      .upload(path, fileBuffer, {
        contentType: detectedMime,
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
