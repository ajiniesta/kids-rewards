"use client";

import { useActionState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Guardando…",
  className,
  submitVariant = "primary",
  submitSize = "md",
  submitClassName,
  footer,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  submitVariant?: ButtonVariant;
  submitSize?: ButtonSize;
  submitClassName?: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={cn("flex flex-col gap-4", className)}>
      {children}

      {state?.error ? <Alert kind="error">{state.error}</Alert> : null}
      {state?.success ? <Alert kind="success">{state.success}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          variant={submitVariant}
          size={submitSize}
          className={submitClassName}
          disabled={pending}
        >
          {pending ? pendingLabel : submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  );
}