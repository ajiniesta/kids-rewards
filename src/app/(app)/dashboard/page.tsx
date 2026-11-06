import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import { createChildAction } from "@/lib/actions/children";
import { getCurrentProfile, requireFamily } from "@/lib/auth";
import { CHILD_AVATARS, childColor } from "@/lib/constants";
import { getChildren, getFamilyMembers } from "@/lib/data";

export const metadata: Metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const { family } = await requireFamily();
  const profile = await getCurrentProfile();
  const [children, members] = await Promise.all([
    getChildren(family.id),
    getFamilyMembers(family.id),
  ]);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
            {family.name}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Hola{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="mt-1 text-ink-soft">
            Este es el tablón de recompensas de la familia. ¿Qué toca hoy?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-extrabold text-ink-soft ring-1 ring-ink/5">
            👨‍👩‍👧 {members.length} {members.length === 1 ? "padre/madre" : "padres"}
          </span>
        </div>
      </section>

      {members.length === 1 ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-600 px-5 py-4 text-white shadow-lg shadow-violet-600/20">
          <div>
            <p className="font-extrabold">Comparte el tablón con el otro padre o madre</p>
            <p className="text-sm text-violet-100">
              Invítale por correo y podréis gestionar los mismos hijos desde vuestras cuentas.
            </p>
          </div>
          <Link href="/family" className={buttonClass({ variant: "white", size: "sm" })}>
            Invitar ahora
          </Link>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">Los peques</h2>
          <span className="text-sm font-semibold text-ink-soft">
            {children.length} {children.length === 1 ? "tablón" : "tablones"}
          </span>
        </div>

        {children.length === 0 ? (
          <EmptyState
            emoji="🧒"
            title="Todavía no hay ningún tablón"
            description="Crea el primero con el nombre de tu hijo o hija. Después podrás añadir tareas y recompensas."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => {
              const color = childColor(child.color);
              return (
                <Link
                  key={child.id}
                  href={`/children/${child.id}`}
                  className="card group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`relative h-24 bg-gradient-to-br ${color.hero} px-5 py-4`}
                    aria-hidden
                  >
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                      Tablón de
                    </span>
                  </div>
                  <div className="relative px-5 pb-5 pt-0">
                    <span className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-md">
                      {child.avatar}
                    </span>
                    <div className="pt-10">
                      <h3 className="text-xl font-black text-ink">{child.name}</h3>
                      <p className="mt-0.5 text-sm font-bold text-ink-soft">
                        <span className="text-lg font-black text-violet-700">{child.balance}</span>{" "}
                        puntos disponibles
                      </p>
                      <span className="mt-3 inline-flex text-sm font-extrabold text-violet-700 group-hover:underline">
                        Ver tablón →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <details className="card group overflow-hidden p-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <span className="flex items-center gap-2 font-extrabold text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                +
              </span>
              Añadir un hijo o hija
            </span>
            <span className="text-sm font-bold text-ink-soft group-open:hidden">Desplegar</span>
            <span className="hidden text-sm font-bold text-ink-soft group-open:inline">Cerrar</span>
          </summary>
          <div className="border-t border-ink/5 px-5 py-5">
            <ActionForm
              action={createChildAction}
              submitLabel="Crear tablón"
              pendingLabel="Creando…"
              submitClassName="w-full sm:w-auto"
            >
              <Field label="Nombre" htmlFor="child-name">
                <Input id="child-name" name="name" placeholder="Nombre del peque" required />
              </Field>
              <EmojiPicker name="avatar" options={CHILD_AVATARS} label="Avatar" />
              <ColorPicker name="color" />
            </ActionForm>
          </div>
        </details>
      </section>
    </div>
  );
}