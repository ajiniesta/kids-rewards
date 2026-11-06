import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none text-6xl opacity-40"
      >
        <span className="animate-float absolute left-[8%] top-[18%]">🧸</span>
        <span className="animate-float absolute right-[10%] top-[12%] [animation-delay:1.5s]">
          ⭐
        </span>
        <span className="animate-float absolute bottom-[12%] left-[14%] [animation-delay:2.5s]">
          🎁
        </span>
        <span className="animate-float absolute bottom-[18%] right-[12%] [animation-delay:0.8s]">
          🦄
        </span>
      </div>

      <header className="relative z-10 p-5 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl shadow-lg shadow-violet-500/30"
          >
            ⭐
          </span>
          <span className="text-lg font-black tracking-tight text-ink">Kids Rewards</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-6 sm:p-8">{children}</div>
          <p className="mt-4 text-center text-xs font-semibold text-ink-soft">
            Un tablón para padres y madres · Los peques miran, tú gestionas
          </p>
        </div>
      </main>
    </div>
  );
}