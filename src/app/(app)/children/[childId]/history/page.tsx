import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { undoRewardRedemptionAction, undoTaskCompletionAction } from "@/lib/actions/points";
import { requireFamily } from "@/lib/auth";
import { childColor } from "@/lib/constants";
import { getChild, getChildBalance, getChildHistory } from "@/lib/data";
import { displayName, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Historial" };

export default async function ChildHistoryPage(props: PageProps<"/children/[childId]/history">) {
  const { childId } = await props.params;
  const { family } = await requireFamily();

  const child = await getChild(childId);
  if (!child || child.family_id !== family.id) notFound();

  const [balance, history] = await Promise.all([
    getChildBalance(child.id),
    getChildHistory(child.id, 60),
  ]);

  const color = childColor(child.color);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
              Historial de
            </p>
            <h1 className="text-2xl font-black text-ink">{child.name}</h1>
          </div>
        </div>
        <Badge className="bg-violet-100 text-violet-700">{balance} puntos actuales</Badge>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-ink">Movimientos de puntos</h2>
          <p className="text-sm text-ink-soft">
            Tareas completadas y recompensas canjeadas, de lo más reciente a lo más antiguo.
          </p>
        </div>

        {history.length === 0 ? (
          <EmptyState
            emoji="🕘"
            title="Todavía no hay movimientos"
            description="Cuando se complete una tarea o se canjee una recompensa aparecerá aquí."
          />
        ) : (
          <ul className="card divide-y divide-ink/5 overflow-hidden p-0">
            {history.map((item) => {
              const isTask = item.kind === "task";
              const data = item.data;
              const date = item.kind === "task" ? item.data.completed_at : item.data.redeemed_at;

              return (
                <li
                  key={`${item.kind}-${data.id}`}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span aria-hidden className="text-2xl">
                    {data.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-ink">{data.title}</p>
                      <Badge
                        className={
                          isTask
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }
                      >
                        {item.kind === "task" ? `+${item.data.points} pts` : `−${item.data.cost} pts`}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-soft">
                      {isTask ? "Tarea completada" : "Recompensa canjeada"} ·{" "}
                      {displayName(data.profiles)} · {formatDateTime(date)}
                    </p>
                  </div>
                  <ConfirmAction
                    action={isTask ? undoTaskCompletionAction : undoRewardRedemptionAction}
                    fields={
                      isTask
                        ? { completion_id: data.id }
                        : { redemption_id: data.id }
                    }
                    label="Deshacer"
                    confirmLabel="Sí, deshacer"
                    question="¿Deshacer?"
                    variant="secondary"
                  />
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs font-semibold text-ink-soft">
          Se muestran los últimos 60 movimientos. Al deshacer un movimiento, los puntos se
          recalculan automáticamente.
        </p>
      </section>
    </div>
  );
}