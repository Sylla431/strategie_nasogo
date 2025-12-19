import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase env vars manquants");
}

export function createSupabaseFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  return { supabase, token };
}

