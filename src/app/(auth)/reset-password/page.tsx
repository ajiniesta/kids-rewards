import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          ⌛
        </span>
        <h1 className="text-xl font-black text-ink">El enlace ha caducado</h1>
        <p className="text-sm text-ink-soft">
          Pide un enlace nuevo para restablecer tu contraseña.
        </p>
        <Link href="/forgot-password" className="text-sm font-bold text-violet-700 hover:underline">
          Solicitar otro enlace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <span aria-hidden className="text-4xl">
          🔐
        </span>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Elige una contraseña que recuerdes. Mínimo 6 caracteres.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}