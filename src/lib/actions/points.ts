"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { friendlyError } from "@/lib/utils";

const idSchema = z.string().uuid("Identificador no válido.");

export async function completeTaskAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const parsed = idSchema.safeParse(formData.get("task_id"));
  if (!parsed.success) return { error: "Tarea no válida." };

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("child_id")
    .eq("id", parsed.data)
    .maybeSingle();

  if (!task) return { error: "No hemos encontrado esa tarea." };

  const { error } = await supabase.rpc("complete_task", { p_task_id: parsed.data });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${task.child_id}`);
  revalidatePath(`/children/${task.child_id}/history`);
  revalidatePath("/dashboard");
  return { success: "¡Tarea completada!" };
}

export async function redeemRewardAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const parsed = idSchema.safeParse(formData.get("reward_id"));
  if (!parsed.success) return { error: "Recompensa no válida." };

  const supabase = await createClient();
  const { data: reward } = await supabase
    .from("rewards")
    .select("child_id")
    .eq("id", parsed.data)
    .maybeSingle();

  if (!reward) return { error: "No hemos encontrado esa recompensa." };

  const { error } = await supabase.rpc("redeem_reward", { p_reward_id: parsed.data });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${reward.child_id}`);
  revalidatePath(`/children/${reward.child_id}/history`);
  revalidatePath("/dashboard");
  return { success: "¡Recompensa canjeada!" };
}

export async function undoTaskCompletionAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const parsed = idSchema.safeParse(formData.get("completion_id"));
  if (!parsed.success) return { error: "Registro no válido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("undo_task_completion", {
    p_completion_id: parsed.data,
  });
  if (error) return { error: friendlyError(error.message) };

  const childId = data as string | null;
  if (childId) {
    revalidatePath(`/children/${childId}`);
    revalidatePath(`/children/${childId}/history`);
  }
  revalidatePath("/dashboard");
  return { success: "Registro deshecho." };
}

export async function undoRewardRedemptionAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const parsed = idSchema.safeParse(formData.get("redemption_id"));
  if (!parsed.success) return { error: "Registro no válido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("undo_reward_redemption", {
    p_redemption_id: parsed.data,
  });
  if (error) return { error: friendlyError(error.message) };

  const childId = data as string | null;
  if (childId) {
    revalidatePath(`/children/${childId}`);
    revalidatePath(`/children/${childId}/history`);
  }
  revalidatePath("/dashboard");
  return { success: "Registro deshecho." };
}