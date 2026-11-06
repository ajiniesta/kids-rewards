"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectTo,
      },
    });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Ya existe una cuenta con ese correo. Inicia sesión.");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace(next);
      router.refresh();
      return;
    }

    setSentTo(email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <span aria-hidden className="text-5xl">
          📬
        </span>
        <h2 className="text-xl font-black text-ink">Revisa tu correo</h2>
        <p className="text-sm text-ink-soft">
          Te hemos enviado un enlace de confirmación a <strong>{sentTo}</strong>. Ábrelo para
          activar tu cuenta y crear vuestro tablón.
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

      <Field label="Tu nombre" htmlFor="full_name">
        <Input id="full_name" name="full_name" autoComplete="name" placeholder="Mamá / Papá" required />
      </Field>

      <Field label="Correo electrónico" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contraseña" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6"
            minLength={6}
            required
          />
        </Field>
        <Field label="Repite la contraseña" htmlFor="confirm">
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repite"
            minLength={6}
            required
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}