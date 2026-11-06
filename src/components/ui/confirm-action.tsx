"use client";

import { useActionState, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function ConfirmAction({
  action,
  fields,
  label,
  confirmLabel = "Sí, eliminar",
  question = "¿Seguro?",
  variant = "danger",
  size = "sm",
  className,
}: {
  action: Action;
  fields: Record<string, string>;
  label: string;
  confirmLabel?: string;
  question?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);

  if (!asking) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <Button type="button" variant={variant} size={size} onClick={() => setAsking(true)}>
          {label}
        </Button>
        {state?.error ? (
          <p className="text-xs font-semibold text-rose-600" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <form action={formAction} className="flex flex-wrap items-center gap-1.5">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <span className="text-xs font-bold text-ink-soft">{question}</span>
        <Button type="submit" variant="danger" size={size} disabled={pending}>
          {pending ? "…" : confirmLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size={size}
          onClick={() => setAsking(false)}
          disabled={pending}
        >
          No
        </Button>
      </form>
      {state?.error ? (
        <p className="text-xs font-semibold text-rose-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}