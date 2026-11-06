import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger"
  | "success"
  | "white";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 active:bg-violet-700",
  secondary:
    "bg-white text-ink ring-1 ring-ink/10 shadow-sm hover:bg-violet-50 hover:ring-violet-200",
  soft: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
  danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500",
  success:
    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:bg-emerald-600",
  white: "bg-white/20 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/30",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-5 text-sm",
  lg: "h-13 gap-2 rounded-2xl px-7 text-base",
  icon: "h-10 w-10 rounded-full",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}