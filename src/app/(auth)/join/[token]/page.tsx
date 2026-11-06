import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { buttonClass } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import { acceptInviteAction } from "@/lib/actions/family";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getInviteDetails } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Invitación" };

export default async function JoinPage(props: PageProps<"/join/[token]">) {
  const { token } = await props.params;
  const next = `/join/${token}`;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <span aria-hidden className="text-5xl">
          💌
        </span>
        <h1 className="text-2xl font-black tracking-tight text-ink">
          Te han invitado a compartir un tablón
        </h1>
        <p className="text-sm text-ink-soft">
          Inicia sesión o crea una cuenta con el correo al que se envió la invitación. Después
          podrás aceptarla y ver a vuestros hijos.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className={buttonClass({ size: "lg" })}
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className={buttonClass({ variant: "secondary", size: "lg" })}
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  const [details, profile] = await Promise.all([getInviteDetails(token), getCurrentProfile()]);

  if (!details) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          🔒
        </span>
        <h1 className="text-xl font-black text-ink">Esta invitación no está disponible</h1>
        <p className="text-sm text-ink-soft">
          Puede que el enlace sea incorrecto, haya caducado o se haya enviado a otro correo
          (<strong>{profile?.email}</strong>). Pide una invitación nueva al otro padre o madre.
        </p>
        <Link href="/dashboard" className="text-sm font-bold text-violet-700 hover:underline">
          Ir a mi tablón
        </Link>
      </div>
    );
  }

  if (details.accepted_at) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          ✅
        </span>
        <h1 className="text-xl font-black text-ink">Invitación ya utilizada</h1>
        <p className="text-sm text-ink-soft">Esta invitación ya se aceptó anteriormente.</p>
        <Link href="/dashboard" className={buttonClass({ size: "lg" })}>
          Ir al tablón
        </Link>
      </div>
    );
  }

  if (new Date(details.expires_at) < new Date()) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          ⌛
        </span>
        <h1 className="text-xl font-black text-ink">La invitación ha caducado</h1>
        <p className="text-sm text-ink-soft">
          Pide al otro padre o madre que genere una invitación nueva.
        </p>
        <Link href="/dashboard" className="text-sm font-bold text-violet-700 hover:underline">
          Ir a mi tablón
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <span aria-hidden className="text-5xl">
          👨‍👩‍👧
        </span>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink">
          Únete a {details.family_name}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Podrás gestionar los mismos hijos, tareas, puntos y recompensas.
        </p>
      </div>

      <Alert kind="info">
        Invitación para <strong>{details.invited_email}</strong>
        {details.inviter_email ? ` · enviada por ${details.inviter_email}` : ""}. Caduca el{" "}
        {formatDate(details.expires_at)}.
      </Alert>

      <ActionForm
        action={acceptInviteAction}
        submitLabel="Aceptar invitación"
        pendingLabel="Aceptando…"
        submitSize="lg"
        submitClassName="w-full"
      >
        <input type="hidden" name="token" value={token} />
        <Field label="Invitación" htmlFor="token">
          <Input id="token" value={details.family_name} readOnly disabled />
        </Field>
      </ActionForm>
    </div>
  );
}