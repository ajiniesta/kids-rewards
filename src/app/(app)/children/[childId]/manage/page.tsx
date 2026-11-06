import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/feedback";
import { buttonClass } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Field, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteChildAction, updateChildAction } from "@/lib/actions/children";
import {
  createRewardAction,
  deleteRewardAction,
  toggleRewardAction,
  updateRewardAction,
} from "@/lib/actions/rewards";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/lib/actions/tasks";
import { requireFamily } from "@/lib/auth";
import { CHILD_AVATARS, REWARD_ICONS, TASK_ICONS, childColor } from "@/lib/constants";
import { getChild, getChildBalance, getChildRewards, getChildTasks } from "@/lib/data";

export const metadata: Metadata = { title: "Gestionar tablón" };

export default async function ManageChildPage(props: PageProps<"/children/[childId]/manage">) {
  const { childId } = await props.params;
  const { family } = await requireFamily();

  const child = await getChild(childId);
  if (!child || child.family_id !== family.id) notFound();

  const [tasks, rewards, balance] = await Promise.all([
    getChildTasks(child.id),
    getChildRewards(child.id),
    getChildBalance(child.id),
  ]);

  const activeTasks = tasks.filter((task) => task.active);
  const activeRewards = rewards.filter((reward) => reward.active);
  const color = childColor(child.color);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div>
        <Link
          href={`/children/${child.id}`}
          className="text-sm font-extrabold text-violet-700 hover:underline"
        >
          ← Volver al tablón
        </Link>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color.hero} text-3xl shadow-md`}
          >
            {child.avatar}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
              Configurando el tablón de
            </p>
            <h1 className="text-2xl font-black text-ink">{child.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-100 text-violet-700">{balance} puntos</Badge>
          <Link
            href={`/children/${child.id}/history`}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            🕘 Historial
          </Link>
        </div>
      </section>

      <section id="tareas" className="flex scroll-mt-24 flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-ink">Tareas</h2>
          <p className="text-sm text-ink-soft">
            Cada tarea suma puntos cuando se marca como hecha en el tablón.
          </p>
        </div>

        <details className="card overflow-hidden p-0" open={tasks.length === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span className="font-extrabold text-ink">➕ Añadir tarea</span>
            <span className="text-sm font-bold text-ink-soft">
              {activeTasks.length} activa{activeTasks.length === 1 ? "" : "s"}
            </span>
          </summary>
          <div className="border-t border-ink/5 px-5 py-5">
            <ActionForm
              action={createTaskAction}
              submitLabel="Añadir tarea"
              pendingLabel="Añadiendo…"
              submitClassName="w-full sm:w-auto"
            >
              <input type="hidden" name="child_id" value={child.id} />
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field label="Título" htmlFor="new-task-title">
                  <Input
                    id="new-task-title"
                    name="title"
                    placeholder="Recoger los juguetes"
                    maxLength={100}
                    required
                  />
                </Field>
                <Field label="Puntos" htmlFor="new-task-points">
                  <Input
                    id="new-task-points"
                    name="points"
                    type="number"
                    min={1}
                    max={10000}
                    defaultValue={5}
                    required
                  />
                </Field>
              </div>
              <Field label="Descripción (opcional)" htmlFor="new-task-description">
                <Textarea
                  id="new-task-description"
                  name="description"
                  placeholder="Recoger todos los juguetes del salón"
                  maxLength={500}
                />
              </Field>
              <EmojiPicker name="icon" options={TASK_ICONS} label="Icono" />
            </ActionForm>
          </div>
        </details>

        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <p className="rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-ink-soft ring-1 ring-ink/5">
              Todavía no hay tareas. Añade la primera arriba.
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span aria-hidden className="text-2xl">
                    {task.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-ink">{task.title}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        +{task.points} pts
                      </Badge>
                      {!task.active ? (
                        <Badge className="bg-ink/10 text-ink-soft">Archivada</Badge>
                      ) : null}
                    </div>
                    {task.description ? (
                      <p className="mt-0.5 text-sm text-ink-soft">{task.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={toggleTaskAction}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <input type="hidden" name="active" value={task.active ? "false" : "true"} />
                      <SubmitButton variant="secondary" size="sm" pendingLabel="…">
                        {task.active ? "Archivar" : "Activar"}
                      </SubmitButton>
                    </form>
                    <ConfirmAction
                      action={deleteTaskAction}
                      fields={{ task_id: task.id }}
                      label="Eliminar"
                    />
                  </div>
                </div>

                <details className="group mt-3 border-t border-ink/5 pt-3">
                  <summary className="cursor-pointer text-sm font-extrabold text-violet-700">
                    ✏️ Editar tarea
                  </summary>
                  <div className="mt-3">
                    <ActionForm
                      action={updateTaskAction}
                      submitLabel="Guardar cambios"
                      pendingLabel="Guardando…"
                      submitSize="sm"
                    >
                      <input type="hidden" name="task_id" value={task.id} />
                      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                        <Field label="Título" htmlFor={`task-title-${task.id}`}>
                          <Input
                            id={`task-title-${task.id}`}
                            name="title"
                            defaultValue={task.title}
                            maxLength={100}
                            required
                          />
                        </Field>
                        <Field label="Puntos" htmlFor={`task-points-${task.id}`}>
                          <Input
                            id={`task-points-${task.id}`}
                            name="points"
                            type="number"
                            min={1}
                            max={10000}
                            defaultValue={task.points}
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Descripción (opcional)" htmlFor={`task-desc-${task.id}`}>
                        <Textarea
                          id={`task-desc-${task.id}`}
                          name="description"
                          defaultValue={task.description ?? ""}
                          maxLength={500}
                        />
                      </Field>
                      <EmojiPicker
                        name="icon"
                        options={TASK_ICONS}
                        defaultValue={task.icon}
                        label="Icono"
                      />
                    </ActionForm>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </section>

      <section id="recompensas" className="flex scroll-mt-24 flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-ink">Recompensas</h2>
          <p className="text-sm text-ink-soft">
            Los peques pueden canjearlas cuando tengan puntos suficientes.
          </p>
        </div>

        <details className="card overflow-hidden p-0" open={rewards.length === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span className="font-extrabold text-ink">➕ Añadir recompensa</span>
            <span className="text-sm font-bold text-ink-soft">
              {activeRewards.length} activa{activeRewards.length === 1 ? "" : "s"}
            </span>
          </summary>
          <div className="border-t border-ink/5 px-5 py-5">
            <ActionForm
              action={createRewardAction}
              submitLabel="Añadir recompensa"
              pendingLabel="Añadiendo…"
              submitClassName="w-full sm:w-auto"
            >
              <input type="hidden" name="child_id" value={child.id} />
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field label="Título" htmlFor="new-reward-title">
                  <Input
                    id="new-reward-title"
                    name="title"
                    placeholder="Helado del domingo"
                    maxLength={100}
                    required
                  />
                </Field>
                <Field label="Coste (puntos)" htmlFor="new-reward-cost">
                  <Input
                    id="new-reward-cost"
                    name="cost"
                    type="number"
                    min={1}
                    max={1000000}
                    defaultValue={20}
                    required
                  />
                </Field>
              </div>
              <Field label="Descripción (opcional)" htmlFor="new-reward-description">
                <Textarea
                  id="new-reward-description"
                  name="description"
                  placeholder="Un helado de dos bolas el domingo"
                  maxLength={500}
                />
              </Field>
              <EmojiPicker name="icon" options={REWARD_ICONS} label="Icono" />
            </ActionForm>
          </div>
        </details>

        <div className="flex flex-col gap-3">
          {rewards.length === 0 ? (
            <p className="rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-ink-soft ring-1 ring-ink/5">
              Todavía no hay recompensas. Añade la primera arriba.
            </p>
          ) : (
            rewards.map((reward) => (
              <div key={reward.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span aria-hidden className="text-2xl">
                    {reward.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-ink">{reward.title}</h3>
                      <Badge className="bg-amber-100 text-amber-700">{reward.cost} pts</Badge>
                      {!reward.active ? (
                        <Badge className="bg-ink/10 text-ink-soft">Archivada</Badge>
                      ) : null}
                    </div>
                    {reward.description ? (
                      <p className="mt-0.5 text-sm text-ink-soft">{reward.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={toggleRewardAction}>
                      <input type="hidden" name="reward_id" value={reward.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={reward.active ? "false" : "true"}
                      />
                      <SubmitButton variant="secondary" size="sm" pendingLabel="…">
                        {reward.active ? "Archivar" : "Activar"}
                      </SubmitButton>
                    </form>
                    <ConfirmAction
                      action={deleteRewardAction}
                      fields={{ reward_id: reward.id }}
                      label="Eliminar"
                    />
                  </div>
                </div>

                <details className="group mt-3 border-t border-ink/5 pt-3">
                  <summary className="cursor-pointer text-sm font-extrabold text-violet-700">
                    ✏️ Editar recompensa
                  </summary>
                  <div className="mt-3">
                    <ActionForm
                      action={updateRewardAction}
                      submitLabel="Guardar cambios"
                      pendingLabel="Guardando…"
                      submitSize="sm"
                    >
                      <input type="hidden" name="reward_id" value={reward.id} />
                      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                        <Field label="Título" htmlFor={`reward-title-${reward.id}`}>
                          <Input
                            id={`reward-title-${reward.id}`}
                            name="title"
                            defaultValue={reward.title}
                            maxLength={100}
                            required
                          />
                        </Field>
                        <Field label="Coste (puntos)" htmlFor={`reward-cost-${reward.id}`}>
                          <Input
                            id={`reward-cost-${reward.id}`}
                            name="cost"
                            type="number"
                            min={1}
                            max={1000000}
                            defaultValue={reward.cost}
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Descripción (opcional)" htmlFor={`reward-desc-${reward.id}`}>
                        <Textarea
                          id={`reward-desc-${reward.id}`}
                          name="description"
                          defaultValue={reward.description ?? ""}
                          maxLength={500}
                        />
                      </Field>
                      <EmojiPicker
                        name="icon"
                        options={REWARD_ICONS}
                        defaultValue={reward.icon}
                        label="Icono"
                      />
                    </ActionForm>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </section>

      <section id="ajustes" className="flex scroll-mt-24 flex-col gap-4">
        <h2 className="text-xl font-black text-ink">Ajustes del tablón</h2>

        <details className="card overflow-hidden p-0">
          <summary className="cursor-pointer list-none px-5 py-4 font-extrabold text-ink">
            ⚙️ Datos de {child.name}
          </summary>
          <div className="flex flex-col gap-6 border-t border-ink/5 px-5 py-5">
            <ActionForm
              action={updateChildAction}
              submitLabel="Guardar datos"
              pendingLabel="Guardando…"
              submitSize="sm"
            >
              <input type="hidden" name="child_id" value={child.id} />
              <Field label="Nombre" htmlFor="edit-child-name">
                <Input
                  id="edit-child-name"
                  name="name"
                  defaultValue={child.name}
                  maxLength={60}
                  required
                />
              </Field>
              <EmojiPicker
                name="avatar"
                options={CHILD_AVATARS}
                defaultValue={child.avatar}
                label="Avatar"
              />
              <ColorPicker name="color" defaultValue={child.color} />
            </ActionForm>

            <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
              <p className="font-extrabold text-rose-700">Eliminar este tablón</p>
              <p className="mt-1 text-sm text-rose-700/80">
                Se eliminarán también sus tareas, recompensas e historial. Esta acción no se puede
                deshacer.
              </p>
              <div className="mt-3">
                <ConfirmAction
                  action={deleteChildAction}
                  fields={{ child_id: child.id }}
                  label="Eliminar tablón"
                  confirmLabel="Sí, eliminar tablón"
                />
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}