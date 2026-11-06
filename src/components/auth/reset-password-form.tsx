"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
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
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(translateAuthError(authError.message));
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <Alert kind="error">{error}</Alert> : null}

      <Field label="Nueva contraseña" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
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
          placeholder="Repite la contraseña"
          minLength={6}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}