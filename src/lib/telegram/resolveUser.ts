import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ResolvedUser = {
  userId: string;
  resolvedVia: "user_id" | "auth_email" | "student_linked" | "profile_email";
  emailHint: string | null;
};

export async function resolveUserFromEmailOrId(input: {
  user_id?: string;
  email?: string;
}): Promise<ResolvedUser | null> {
  if (!supabaseAdmin) return null;

  if (input.user_id) {
    return { userId: input.user_id, resolvedVia: "user_id", emailHint: input.email ?? null };
  }

  const email = input.email?.toLowerCase().trim();
  if (!email) return null;

  const { data: authUserId, error: authError } = await supabaseAdmin.rpc("find_user_by_email", {
    user_email: email,
  });
  if (!authError && authUserId) {
    return { userId: authUserId as string, resolvedVia: "auth_email", emailHint: email };
  }

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("linked_user_id, email")
    .ilike("email", email)
    .not("linked_user_id", "is", null)
    .maybeSingle();

  if (student?.linked_user_id) {
    return {
      userId: student.linked_user_id as string,
      resolvedVia: "student_linked",
      emailHint: (student.email as string) ?? email,
    };
  }

  const { data: profile } = await supabaseAdmin
    .from("users_profile")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (profile?.id) {
    return {
      userId: profile.id as string,
      resolvedVia: "profile_email",
      emailHint: (profile.email as string) ?? email,
    };
  }

  return null;
}
