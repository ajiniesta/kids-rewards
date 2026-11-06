import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PointsActionButton } from "@/components/ui/points-action-button";
import { buttonClass } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { completeTaskAction, redeemRewardAction } from "@/lib/actions/points";
import { requireFamily } from "@/lib/auth";
import { childColor } from "@/lib/constants";
import { getChild, getChildBalance, getChildHistory, getChildRewards, getChildTasks } from "@/lib/data";
import { displayName, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Tablón" };

export default async function ChildPage(props: PageProps<"/children/[childId]">) {
  const { childId } = await props.params;
  const { family } = await requireFamily();

  const child = await getChild(childId);
  if (!child || child.family_id !== family.id) notFound();

  const [balance, tasks, rewards, history] = await Promise.all([
    getChildBalance(child.id),
    getChildTasks(child.id),
    getChildRewards(child.id),
    getChildHistory(child.id, 8),
  ]);

  const activeTasks = tasks.filter((task) => task.active);
  const activeRewards = rewards.filter((reward) => reward.active);
  const nextReward = activeRewards.find((reward) => reward.cost > balance);
  const progress = nextReward ? Math.min(100, Math.round((balance / nextReward.cost) * 100)) : 100;
  const color = childColor(child.color);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <section
        className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${color.hero} p-6 text-white shadow-2xl sm:p-8`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-10 select-none text-[10rem] opacity-20"
        >
          {child.avatar}
        </span>

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
              Tablón de
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight drop-shadow-sm sm:text-5xl">
              {child.name}
            </h1>

            <div className="mt-5 inline-flex items-end gap-2 rounded-2xl bg-white/20 px-5 py-3 ring-1 ring-white/30 backdrop-blur">
              <span className="text-4xl font-black leading-none">{balance}</span>
              <span className="pb-1 text-sm font-bold text-white/90">puntos</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 text-5xl shadow-xl sm:h-24 sm:w-24 sm:text-6xl">
              {child.avatar}
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href={`/children/${child.id}/manage`}
                className={buttonClass({ variant: "white", size: "sm" })}
              >
                ⚙️ Gestionar
              </Link>
              <Link
                href={`/children/${child.id}/history`}
                className={buttonClass({ variant: "white", size: "sm" })}
              >
                🕘 Historial
              </Link>
            </div>
          </div>
        </div>

        {nextReward ? (
          <div className="relative mt-6 max-w-md">
            <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-white/90">
              <span className="truncate">
                Próxima recompensa: {nextReward.icon} {nextReward.title}
              </span>
              <span className="shrink-0">
                {balance} / {nextReward.cost}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-ink">Tareas</h2>
            <Badge className={`${color.chip}`}>{activeTasks.length}</Badge>
          </div>
          <Link
            href={`/children/${child.id}/manage#tareas`}
            className="text-sm font-extrabold text-violet-700 hover:underline"
          >
            Gestionar tareas →
          </Link>
        </div>

        {activeTasks.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="Aún no hay tareas"
            description="Añade las tareas que puede hacer y los puntos que gana con cada una."
            action={
              <Link
                href={`/children/${child.id}/manage#tareas`}
                className={buttonClass({ variant: "primary", size: "sm" })}
              >
                Añadir la primera tarea
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeTasks.map((task) => (
              <article key={task.id} className="card flex flex-col gap-4 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-3xl leading-none">
                    {task.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold leading-snug text-ink">{task.title}</h3>
                    {task.description ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">+{task.points}</Badge>
                </div>
                <PointsActionButton
                  action={completeTaskAction}
                  field="task_id"
                  value={task.id}
                  label={`¡Hecho! +${task.points} pts`}
                  pendingLabel="Sumando…"
                  variant="success"
                  size="sm"
                />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-ink">Recompensas</h2>
            <Badge className="bg-amber-100 text-amber-700">{activeRewards.length}</Badge>
          </div>
          <Link
            href={`/children/${child.id}/manage#recompensas`}
            className="text-sm font-extrabold text-violet-700 hover:underline"
          >
            Gestionar recompensas →
          </Link>
        </div>

        {activeRewards.length === 0 ? (
          <EmptyState
            emoji="🎁"
            title="Aún no hay recompensas"
            description="Crea premios que le motiven y ponles un precio en puntos."
            action={
              <Link
                href={`/children/${child.id}/manage#recompensas`}
                className={buttonClass({ variant: "primary", size: "sm" })}
              >
                Añadir la primera recompensa
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeRewards.map((reward) => {
              const affordable = balance >= reward.cost;
              return (
                <article
                  key={reward.id}
                  className={`card flex flex-col gap-4 p-4 ${
                    affordable ? "ring-2 ring-amber-300" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-3xl leading-none">
                      {reward.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold leading-snug text-ink">{reward.title}</h3>
                      {reward.description ? (
                        <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
                          {reward.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">{reward.cost} pts</Badge>
                  </div>

                  {affordable ? (
                    <PointsActionButton
                      action={redeemRewardAction}
                      field="reward_id"
                      value={reward.id}
                      label="🎉 Canjear recompensa"
                      pendingLabel="Canjeando…"
                      variant="primary"
                      size="sm"
                    />
                  ) : (
                    <PointsActionButton
                      action={redeemRewardAction}
                      field="reward_id"
                      value={reward.id}
                      label={`Faltan ${reward.cost - balance} pts`}
                      pendingLabel="Canjeando…"
                      variant="soft"
                      size="sm"
                      disabled
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-ink">Últimos movimientos</h2>
          <Link
            href={`/children/${child.id}/history`}
            className="text-sm font-extrabold text-violet-700 hover:underline"
          >
            Ver historial completo →
          </Link>
        </div>

        {history.length === 0 ? (
          <p className="rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-ink-soft ring-1 ring-ink/5">
            Todavía no hay movimientos. Cuando se complete una tarea o se canjee una recompensa
            aparecerá aquí.
          </p>
        ) : (
          <ul className="card divide-y divide-ink/5 overflow-hidden p-0">
            {history.map((item) => {
              const isTask = item.kind === "task";
              const data = item.data;
              const date = item.kind === "task" ? item.data.completed_at : item.data.redeemed_at;
              const delta = item.kind === "task" ? `+${item.data.points}` : `−${item.data.cost}`;

              return (
                <li key={`${item.kind}-${data.id}`} className="flex items-center gap-3 px-4 py-3">
                  <span aria-hidden className="text-xl">
                    {data.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{data.title}</p>
                    <p className="text-xs text-ink-soft">
                      {isTask ? "Tarea completada" : "Recompensa canjeada"} ·{" "}
                      {displayName(data.profiles)} · {formatDateTime(date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-black ${
                      isTask ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {delta}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}