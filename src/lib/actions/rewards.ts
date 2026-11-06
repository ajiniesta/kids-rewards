"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { friendlyError } from "@/lib/utils";

const rewardSchema = z.object({
  title: z.string().trim().min(1, "Pon un título.").max(100, "El título es demasiado largo."),
  cost: z.coerce
    .number()
    .int("El coste debe ser un número entero.")
    .min(1, "El coste debe ser al menos 1 punto.")
    .max(1000000, "El coste es demasiado alto."),
  icon: z.string().min(1).max(8),
});

function readRewardForm(formData: FormData) {
  return rewardSchema.safeParse({
    title: formData.get("title") ?? "",
    cost: formData.get("cost") ?? "",
    icon: formData.get("icon") || "🎁",
  });
}

export async function createRewardAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family } = await requireFamily();
  const childId = String(formData.get("child_id") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;

  const parsed = readRewardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("family_id", family.id)
    .maybeSingle();

  if (!child) return { error: "No hemos encontrado ese tablón." };

  const { error } = await supabase.from("rewards").insert({
    child_id: childId,
    title: parsed.data.title,
    description,
    cost: parsed.data.cost,
    icon: parsed.data.icon,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/manage`);
  return { success: "Recompensa añadida." };
}

export async function updateRewardAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const rewardId = String(formData.get("reward_id") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;

  const parsed = readRewardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data: reward } = await supabase
    .from("rewards")
    .select("id, child_id")
    .eq("id", rewardId)
    .maybeSingle();

  if (!reward) return { error: "No hemos encontrado esa recompensa." };

  const { error } = await supabase
    .from("rewards")
    .update({ ...parsed.data, description })
    .eq("id", rewardId);

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${reward.child_id}`);
  revalidatePath(`/children/${reward.child_id}/manage`);
  return { success: "Recompensa actualizada." };
}

export async function deleteRewardAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const rewardId = String(formData.get("reward_id") ?? "");

  const supabase = await createClient();
  const { data: reward } = await supabase
    .from("rewards")
    .select("id, child_id")
    .eq("id", rewardId)
    .maybeSingle();

  if (!reward) return { error: "No hemos encontrado esa recompensa." };

  const { error } = await supabase.from("rewards").delete().eq("id", rewardId);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${reward.child_id}`);
  revalidatePath(`/children/${reward.child_id}/manage`);
  return { success: "Recompensa eliminada." };
}

export async function toggleRewardAction(formData: FormData): Promise<void> {
  await requireFamily();
  const rewardId = String(formData.get("reward_id") ?? "");
  const active = formData.get("active") === "true";

  const supabase = await createClient();
  const { data: reward } = await supabase
    .from("rewards")
    .select("id, child_id")
    .eq("id", rewardId)
    .maybeSingle();

  if (!reward) return;

  await supabase.from("rewards").update({ active }).eq("id", rewardId);

  revalidatePath(`/children/${reward.child_id}`);
  revalidatePath(`/children/${reward.child_id}/manage`);
}