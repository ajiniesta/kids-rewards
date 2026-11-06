"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  exact = false,
  label,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  label?: string;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-bold transition",
        active ? "bg-violet-100 text-violet-700" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}