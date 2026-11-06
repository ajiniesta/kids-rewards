import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { cn, initials } from "@/lib/utils";

export function AppHeader({
  name,
  email,
  familyName,
  hasFamily,
}: {
  name: string | null;
  email: string;
  familyName: string | null;
  hasFamily: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg shadow-lg shadow-violet-500/30"
          >
            ⭐
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tight text-ink sm:text-base">
              Kids Rewards
            </span>
            {familyName ? (
              <span className="hidden text-[11px] font-bold text-ink-soft sm:block">
                {familyName}
              </span>
            ) : null}
          </span>
        </Link>

        {hasFamily ? (
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" exact label="Inicio">
              🏠 <span className="hidden sm:inline">Inicio</span>
            </NavLink>
            <NavLink href="/family" label="Familia">
              👨‍👩‍👧 <span className="hidden sm:inline">Familia</span>
            </NavLink>
          </nav>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              aria-hidden
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-black text-white",
              )}
            >
              {initials(name, email)}
            </span>
            <span className="max-w-40 truncate text-xs font-bold text-ink-soft">{email}</span>
          </div>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <span aria-hidden>↩︎</span>
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}