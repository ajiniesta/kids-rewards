import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/feedback";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Entrar" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = safeNextPath(first(params.next));
  const errorParam = first(params.error);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-ink">Hola de nuevo 👋</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Entra para ver los puntos, tareas y recompensas de tus hijos.
        </p>
      </div>

      {errorParam ? (
        <Alert kind="error">
          {errorParam === "callback"
            ? "El enlace ha caducado o no es válido. Inténtalo de nuevo."
            : "No hemos podido completar la operación."}
        </Alert>
      ) : null}

      <LoginForm next={next} />

      <div className="flex flex-col gap-2 border-t border-ink/5 pt-4 text-center text-sm">
        <Link href={`/forgot-password`} className="font-bold text-ink-soft hover:text-violet-700">
          ¿Has olvidado la contraseña?
        </Link>
        <p className="text-ink-soft">
          ¿Todavía no tienes cuenta?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-bold text-violet-700 hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}