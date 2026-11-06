import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    emoji: "✅",
    title: "Tareas con puntos",
    description:
      "Crea tareas una vez y márcalas como hechas. Cada una suma los puntos que tú decidas.",
  },
  {
    emoji: "🎁",
    title: "Recompensas a su medida",
    description:
      "Define premios y su precio en puntos. Cuando haya saldo suficiente, se canjean con un toque.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Compartido entre padres",
    description:
      "Invita al otro padre o madre por correo y gestionad el mismo tablón desde dos cuentas.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl shadow-lg shadow-violet-500/30"
          >
            ⭐
          </span>
          <span className="text-lg font-black tracking-tight text-ink">Kids Rewards</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonClass({ variant: "ghost", size: "sm" })}>
            Entrar
          </Link>
          <Link href="/register" className={buttonClass({ size: "sm" })}>
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-700">
              🧸 Para familias con peques
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Tareas que suman,
              <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                recompensas que ilusionan.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Un tablón visual y compartido para que tus hijos vean sus puntos crecer y canjearlos
              por premios. Tú gestionas las tareas y recompensas; ellos disfrutan del camino.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className={buttonClass({ size: "lg" })}>
                Empezar gratis →
              </Link>
              <Link
                href="/login"
                className={buttonClass({ variant: "secondary", size: "lg" })}
              >
                Ya tengo cuenta
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold text-ink-soft">
              Sólo para padres y madres · Autenticación por correo · Sin publicidad
            </p>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div
              aria-hidden
              className="absolute -left-6 -top-8 select-none text-5xl opacity-70 animate-float"
            >
              🎈
            </div>
            <div
              aria-hidden
              className="absolute -bottom-6 -right-4 select-none text-5xl opacity-70 animate-float [animation-delay:1.5s]"
            >
              🎁
            </div>

            <div className="card overflow-hidden p-0">
              <div className="bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300 px-5 py-5 text-white">
                <p className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                  Tablón de
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-2xl font-black">Lucía</p>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-3xl">
                    👧
                  </span>
                </div>
                <div className="mt-4 inline-flex items-end gap-2 rounded-xl bg-white/20 px-4 py-2 ring-1 ring-white/30">
                  <span className="text-3xl font-black leading-none">42</span>
                  <span className="pb-0.5 text-sm font-bold text-white/90">puntos</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                {[
                  { icon: "🛏️", title: "Hacer la cama", points: "+5" },
                  { icon: "📚", title: "Leer 20 min", points: "+10" },
                  { icon: "🧹", title: "Recoger juguetes", points: "+5" },
                  { icon: "🦷", title: "Lavarse los dientes", points: "+3" },
                ].map((task) => (
                  <div
                    key={task.title}
                    className="rounded-2xl bg-violet-50/80 px-3 py-3 ring-1 ring-violet-100"
                  >
                    <div className="flex items-center justify-between">
                      <span aria-hidden className="text-xl">
                        {task.icon}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                        {task.points}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-extrabold leading-tight text-ink">
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/5 px-4 py-3">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
                  <span className="flex items-center gap-2 text-xs font-extrabold text-ink">
                    <span aria-hidden className="text-lg">
                      🍦
                    </span>
                    Helado del domingo
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-amber-700">
                    30 pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-5">
              <span aria-hidden className="text-3xl">
                {feature.emoji}
              </span>
              <h2 className="mt-3 text-lg font-black text-ink">{feature.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-ink">¿Montamos vuestro tablón?</h2>
            <p className="mt-1 text-ink-soft">
              Se tarda menos en crearlo que en decidir el primer premio.
            </p>
          </div>
          <Link href="/register" className={buttonClass({ size: "lg" })}>
            Crear cuenta gratis
          </Link>
        </section>
      </main>

      <footer className="border-t border-ink/5 py-6 text-center text-xs font-semibold text-ink-soft">
        Hecho con cariño para familias · Kids Rewards
      </footer>
    </div>
  );
}