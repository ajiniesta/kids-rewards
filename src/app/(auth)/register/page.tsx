import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Crear cuenta" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage(props: PageProps<"/register">) {
  const params = await props.searchParams;
  const next = safeNextPath(first(params.next), "/onboarding");

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-ink">Crea vuestro tablón ✨</h1>
        <p className="mt-1 text-sm text-ink-soft">
          En un minuto tendrás tareas, puntos y recompensas listos para los peques.
        </p>
      </div>

      <RegisterForm next={next} />

      <p className="border-t border-ink/5 pt-4 text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-bold text-violet-700 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}