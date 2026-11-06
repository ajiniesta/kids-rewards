import type { Metadata } from "next";
import { ActionForm } from "@/components/ui/action-form";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, Input } from "@/components/ui/field";
import {
  inviteParentAction,
  revokeInviteAction,
  updateFamilyNameAction,
} from "@/lib/actions/family";
import { requireFamily } from "@/lib/auth";
import { getFamilyInvites, getFamilyMembers } from "@/lib/data";
import {
  displayName,
  formatDate,
  getSiteUrl,
  initials,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Familia" };

export default async function FamilyPage() {
  const { family, user } = await requireFamily();
  const [members, invites] = await Promise.all([
    getFamilyMembers(family.id),
    getFamilyInvites(family.id),
  ]);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-violet-600">Familia</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">{family.name}</h1>
        <p className="mt-1 text-ink-soft">
          Comparte el tablón con el otro padre o madre para que ambos podáis gestionarlo.
        </p>
      </div>

      {members.length > 1 ? (
        <section className="rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-800 ring-1 ring-emerald-200">
          <p className="font-extrabold">🎉 Tablón compartido</p>
          <p className="text-sm text-emerald-700">
            {members.map((member) => displayName(member.profiles)).join(" y ")} tenéis acceso a los
            mismos hijos, tareas y recompensas.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-black text-ink">Padres y madres</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {members.map((member) => {
                const profile = member.profiles;
                const isMe = member.user_id === user.id;

                return (
                  <li
                    key={member.user_id}
                    className="flex items-center gap-3 rounded-2xl bg-ink/[0.03] px-4 py-3"
                  >
                    <span
                      aria-hidden
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white"
                    >
                      {initials(profile?.full_name, profile?.email ?? "")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {displayName(profile)} {isMe ? <span className="text-violet-600">(tú)</span> : null}
                      </p>
                      <p className="truncate text-xs text-ink-soft">{profile?.email}</p>
                    </div>
                    <Badge
                      className={
                        member.role === "owner"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-ink/10 text-ink-soft"
                      }
                    >
                      {member.role === "owner" ? "Creador" : "Padre/Madre"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-black text-ink">Nombre de la familia</h2>
            <p className="mb-4 text-sm text-ink-soft">
              Aparece en la cabecera y en las invitaciones.
            </p>
            <ActionForm
              action={updateFamilyNameAction}
              submitLabel="Guardar nombre"
              pendingLabel="Guardando…"
              submitSize="sm"
            >
              <Field label="Nombre" htmlFor="family_name">
                <Input
                  id="family_name"
                  name="family_name"
                  defaultValue={family.name}
                  maxLength={80}
                  required
                />
              </Field>
            </ActionForm>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-black text-ink">Invitar al otro padre o madre</h2>
            <p className="mb-4 mt-1 text-sm text-ink-soft">
              Escribe su correo y comparte el enlace que generaremos. Debe iniciar sesión o crear
              una cuenta con ese mismo correo para aceptar.
            </p>
            <ActionForm
              action={inviteParentAction}
              submitLabel="Generar invitación"
              pendingLabel="Generando…"
              submitSize="sm"
            >
              <Field label="Correo electrónico" htmlFor="invite-email">
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="otro@email.com"
                  required
                />
              </Field>
            </ActionForm>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-ink">Invitaciones</h2>
            {invites.length === 0 ? (
              <p className="rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-ink-soft ring-1 ring-ink/5">
                Todavía no has enviado ninguna invitación.
              </p>
            ) : (
              invites.map((invite) => {
                const link = `${getSiteUrl()}/join/${invite.token}`;
                const accepted = Boolean(invite.accepted_at);
                const expired = !accepted && new Date(invite.expires_at) < new Date();

                return (
                  <div key={invite.id} className="card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-ink">{invite.email}</p>
                      <Badge
                        className={
                          accepted
                            ? "bg-emerald-100 text-emerald-700"
                            : expired
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }
                      >
                        {accepted ? "Aceptada" : expired ? "Caducada" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">
                      {accepted
                        ? `Aceptada el ${formatDate(invite.accepted_at!)}`
                        : `Caduca el ${formatDate(invite.expires_at)}`}
                    </p>

                    {!accepted && !expired ? (
                      <>
                        <code className="mt-3 block truncate rounded-lg bg-ink/[0.04] px-3 py-2 text-xs text-ink-soft">
                          {link}
                        </code>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <CopyButton value={link} />
                          <a
                            href={`mailto:${invite.email}?subject=${encodeURIComponent(
                              "Invitación a nuestro tablón de Kids Rewards",
                            )}&body=${encodeURIComponent(
                              `Te invito a nuestro tablón de Kids Rewards: ${link}`,
                            )}`}
                            className={buttonClass({ variant: "ghost", size: "sm" })}
                          >
                            ✉️ Email
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Te invito a nuestro tablón de Kids Rewards: ${link}`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonClass({ variant: "ghost", size: "sm" })}
                          >
                            💬 WhatsApp
                          </a>
                          <ConfirmAction
                            action={revokeInviteAction}
                            fields={{ invite_id: invite.id }}
                            label="Revocar"
                            confirmLabel="Sí, revocar"
                            question="¿Revocar invitación?"
                            variant="ghost"
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}