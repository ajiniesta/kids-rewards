import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Family, Membership } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (data as { id: string; email: string; full_name: string | null } | null) ?? null;
});

export const getCurrentMembership = cache(async (): Promise<Membership | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("family_members")
    .select("family_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return null;

  const { data: family } = await supabase
    .from("families")
    .select("id, name, created_by, created_at")
    .eq("id", member.family_id)
    .maybeSingle();

  if (!family) return null;

  return {
    family: family as Family,
    role: member.role as "owner" | "parent",
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireFamily() {
  const user = await requireUser();
  const membership = await getCurrentMembership();
  if (!membership) redirect("/onboarding");

  return {
    user,
    profile: await getCurrentProfile(),
    family: membership.family,
    role: membership.role,
  };
}