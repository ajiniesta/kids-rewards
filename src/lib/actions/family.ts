"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentMembership, requireFamily, requireUser } from "@/lib/auth";
import { getFamilyMembers } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { friendlyError } from "@/lib/utils";

const familySchema = z.object({
  family_name: z
    .string()
    .trim()
    .min(1, "Pon un nombre a la familia.")
    .max(80, "El nombre es demasiado largo."),
  child_name: z.string().trim().max(60, "El nombre es demasiado largo.").optional(),
  avatar: z.string().min(1).max(8).optional(),
  color: z.enum(["sky", "rose", "amber", "emerald", "violet", "orange"]).optional(),
});

export async function createFamilyAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const existing = await getCurrentMembership();
  if (existing) redirect("/dashboard");

  const parsed = familySchema.safeParse({
    family_name: formData.get("family_name") ?? "",
    child_name: formData.get("child_name") ?? "",
    avatar: formData.get("avatar") || "🧒",
    color: formData.get("color") || "sky",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({ name: parsed.data.family_name, created_by: user.id })
    .select("id")
    .single();

  if (familyError || !family) {
    return { error: friendlyError(familyError?.message) };
  }

  const { error: memberError } = await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    await supabase.from("families").delete().eq("id", family.id);
    return { error: friendlyError(memberError.message) };
  }

  const childName = parsed.data.child_name?.trim();
  let firstChildId: string | null = null;

  if (childName) {
    const { data: child, error: childError } = await supabase
      .from("children")
      .insert({
        family_id: family.id,
        name: childName,
        avatar: parsed.data.avatar ?? "🧒",
        color: parsed.data.color ?? "sky",
      })
      .select("id")
      .single();

    if (childError) {
      return { error: friendlyError(childError.message) };
    }
    firstChildId = child.id;
  }

  revalidatePath("/dashboard");
  redirect(firstChildId ? `/children/${firstChildId}` : "/dashboard");
}

export async function updateFamilyNameAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family } = await requireFamily();
  const name = String(formData.get("family_name") ?? "").trim();

  if (!name) return { error: "Pon un nombre a la familia." };
  if (name.length > 80) return { error: "El nombre es demasiado largo." };

  const supabase = await createClient();
  const { error } = await supabase.from("families").update({ name }).eq("id", family.id);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/family");
  revalidatePath("/dashboard");
  return { success: "Nombre actualizado." };
}

export async function inviteParentAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family, user } = await requireFamily();

  const parsed = z.email("Escribe un correo válido.").safeParse(
    String(formData.get("email") ?? "").trim().toLowerCase(),
  );

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Correo no válido." };
  }

  const email = parsed.data;
  const members = await getFamilyMembers(family.id);

  if (members.some((member) => member.profiles?.email?.toLowerCase() === email)) {
    return { error: "Ese correo ya forma parte de la familia." };
  }

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("family_invites")
    .select("id")
    .eq("family_id", family.id)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pending) {
    return { success: "Ya hay una invitación pendiente para ese correo." };
  }

  const { error } = await supabase.from("family_invites").insert({
    family_id: family.id,
    email,
    invited_by: user.id,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/family");
  return { success: "Invitación creada. Comparte el enlace con el otro padre." };
}

export async function revokeInviteAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const inviteId = String(formData.get("invite_id") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.from("family_invites").delete().eq("id", inviteId);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/family");
  return { success: "Invitación eliminada." };
}

export async function acceptInviteAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const token = String(formData.get("token") ?? "");
  const parsed = z.string().uuid("Invitación no válida.").safeParse(token);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invitación no válida." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_family_invite", { p_token: parsed.data });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/dashboard");
  revalidatePath("/family");
  redirect("/dashboard");
}