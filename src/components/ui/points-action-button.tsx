"use client";

import { useActionState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function PointsActionButton({
  action,
  field,
  value,
  label,
  pendingLabel,
  variant = "success",
  size = "md",
  disabled = false,
  className,
}: {
  action: Action;
  field: string;
  value: string;
  label: string;
  pendingLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <form action={formAction}>
        <input type="hidden" name={field} value={value} />
        <Button
          type="submit"
          variant={variant}
          size={size}
          className="w-full"
          disabled={disabled || pending}
        >
          {pending ? pendingLabel : label}
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