"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { friendlyError } from "@/lib/utils";

const childSchema = z.object({
  name: z.string().trim().min(1, "Pon un nombre.").max(60, "El nombre es demasiado largo."),
  avatar: z.string().min(1).max(8),
  color: z.enum(["sky", "rose", "amber", "emerald", "violet", "orange"]),
});

export async function createChildAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family } = await requireFamily();

  const parsed = childSchema.safeParse({
    name: formData.get("name") ?? "",
    avatar: formData.get("avatar") || "🧒",
    color: formData.get("color") || "sky",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .insert({
      family_id: family.id,
      name: parsed.data.name,
      avatar: parsed.data.avatar,
      color: parsed.data.color,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: friendlyError(error?.message) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/family");
  redirect(`/children/${data.id}`);
}

export async function updateChildAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family } = await requireFamily();
  const childId = String(formData.get("child_id") ?? "");

  const parsed = childSchema.safeParse({
    name: formData.get("name") ?? "",
    avatar: formData.get("avatar") || "🧒",
    color: formData.get("color") || "sky",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .update(parsed.data)
    .eq("id", childId)
    .eq("family_id", family.id)
    .select("id")
    .maybeSingle();

  if (error) return { error: friendlyError(error.message) };
  if (!data) return { error: "No hemos encontrado ese tablón." };

  revalidatePath("/dashboard");
  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/manage`);
  return { success: "Datos actualizados." };
}

export async function deleteChildAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const childId = String(formData.get("child_id") ?? "");

  const supabase = await createClient();
  await supabase.from("children").delete().eq("id", childId);

  revalidatePath("/dashboard");
  revalidatePath("/family");
  redirect("/dashboard");
}