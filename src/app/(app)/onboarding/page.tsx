import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { ColorPicker } from "@/components/ui/color-picker";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Field, Input } from "@/components/ui/field";
import { createFamilyAction } from "@/lib/actions/family";
import { getCurrentMembership, getCurrentProfile, requireUser } from "@/lib/auth";
import { CHILD_AVATARS } from "@/lib/constants";

export const metadata: Metadata = { title: "Configurar familia" };

export default async function OnboardingPage() {
  await requireUser();
  const membership = await getCurrentMembership();
  if (membership) redirect("/dashboard");

  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <div className="mb-6 text-center">
        <span aria-hidden className="text-5xl">
          🧸
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">
          Vamos a montar vuestro tablón
        </h1>
        <p className="mt-2 text-ink-soft">
          Ponle nombre a la familia y, si quieres, crea ya el primer tablón de tu peque. Podrás
          añadir más hijos, tareas y recompensas después.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <ActionForm
          action={createFamilyAction}
          submitLabel="Crear nuestro tablón"
          pendingLabel="Creando…"
          submitSize="lg"
          submitClassName="w-full"
        >
          <Field label="Nombre de la familia" htmlFor="family_name">
            <Input
              id="family_name"
              name="family_name"
              placeholder={profile?.full_name ? `Familia de ${profile.full_name}` : "Familia Pérez"}
              maxLength={80}
              required
            />
          </Field>

          <div className="rounded-2xl bg-violet-50/70 p-4">
            <p className="mb-3 text-sm font-extrabold text-violet-900">
              Primer peque <span className="font-semibold text-violet-700">(opcional)</span>
            </p>
            <div className="flex flex-col gap-4">
              <Field label="Nombre" htmlFor="child_name">
                <Input id="child_name" name="child_name" placeholder="Lucía" maxLength={60} />
              </Field>
              <EmojiPicker name="avatar" options={CHILD_AVATARS} label="Avatar" />
              <ColorPicker name="color" />
            </div>
          </div>
        </ActionForm>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-ink-soft">
        Después podrás invitar al otro padre o madre desde la sección Familia.
      </p>
    </div>
  );
}