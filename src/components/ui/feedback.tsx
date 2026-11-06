import { cn } from "@/lib/utils";

export function Alert({
  kind = "error",
  children,
  className,
}: {
  kind?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "bg-rose-50 text-rose-700 ring-rose-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    info: "bg-violet-50 text-violet-700 ring-violet-200",
  } as const;

  const icons = { error: "⚠️", success: "✅", info: "💡" } as const;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold ring-1",
        styles[kind],
        className,
      )}
    >
      <span aria-hidden className="shrink-0">
        {icons[kind]}
      </span>
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  emoji = "✨",
  title,
  description,
  action,
  className,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-ink/10 bg-white/50 px-6 py-10 text-center",
        className,
      )}
    >
      <span aria-hidden className="text-4xl">
        {emoji}
      </span>
      <div>
        <p className="text-base font-extrabold text-ink">{title}</p>
        {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
        className ?? "bg-violet-100 text-violet-700",
      )}
    >
      {children}
    </span>
  );
}