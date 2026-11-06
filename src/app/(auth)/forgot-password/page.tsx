import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <span aria-hidden className="text-4xl">
          🔑
        </span>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink">Recupera tu acceso</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Escribe tu correo y te enviaremos un enlace para elegir una nueva contraseña.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="border-t border-ink/5 pt-4 text-center text-sm">
        <Link href="/login" className="font-bold text-violet-700 hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}