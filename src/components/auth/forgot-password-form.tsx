"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          📬
        </span>
        <h2 className="text-xl font-black text-ink">Revisa tu correo</h2>
        <p className="text-sm text-ink-soft">
          Si existe una cuenta con ese correo, te habrá llegado un enlace para cambiar la
          contraseña.
        </p>
        <Link href="/login" className="text-sm font-bold text-violet-700 hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <Alert kind="error">{error}</Alert> : null}

      <Field
        label="Correo electrónico"
        htmlFor="email"
        hint="Te enviaremos un enlace para restablecer tu contraseña."
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}