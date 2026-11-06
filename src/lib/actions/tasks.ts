"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { friendlyError } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Pon un título.").max(100, "El título es demasiado largo."),
  points: z.coerce
    .number()
    .int("Los puntos deben ser un número entero.")
    .min(1, "Los puntos deben ser al menos 1.")
    .max(10000, "Demasiados puntos."),
  icon: z.string().min(1).max(8),
});

function readTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title") ?? "",
    points: formData.get("points") ?? "",
    icon: formData.get("icon") || "⭐",
  });
}

export async function createTaskAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { family } = await requireFamily();
  const childId = String(formData.get("child_id") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;

  const parsed = readTaskForm(formData);
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

  const { error } = await supabase.from("tasks").insert({
    child_id: childId,
    title: parsed.data.title,
    description,
    points: parsed.data.points,
    icon: parsed.data.icon,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/manage`);
  return { success: "Tarea añadida." };
}

export async function updateTaskAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const taskId = String(formData.get("task_id") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;

  const parsed = readTaskForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("id, child_id")
    .eq("id", taskId)
    .maybeSingle();

  if (!task) return { error: "No hemos encontrado esa tarea." };

  const { error } = await supabase
    .from("tasks")
    .update({ ...parsed.data, description })
    .eq("id", taskId);

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${task.child_id}`);
  revalidatePath(`/children/${task.child_id}/manage`);
  return { success: "Tarea actualizada." };
}

export async function deleteTaskAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFamily();
  const taskId = String(formData.get("task_id") ?? "");

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("id, child_id")
    .eq("id", taskId)
    .maybeSingle();

  if (!task) return { error: "No hemos encontrado esa tarea." };

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/children/${task.child_id}`);
  revalidatePath(`/children/${task.child_id}/manage`);
  return { success: "Tarea eliminada." };
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  await requireFamily();
  const taskId = String(formData.get("task_id") ?? "");
  const active = formData.get("active") === "true";

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("id, child_id")
    .eq("id", taskId)
    .maybeSingle();

  if (!task) return;

  await supabase.from("tasks").update({ active }).eq("id", taskId);

  revalidatePath(`/children/${task.child_id}`);
  revalidatePath(`/children/${task.child_id}/manage`);
}