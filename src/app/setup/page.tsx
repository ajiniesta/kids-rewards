import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración" };

const steps = [
  {
    title: "1. Crea tus credenciales",
    body: (
      <>
        Copia <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">.env.example</code> a{" "}
        <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">.env.local</code> y rellena la URL
        y la anon key de tu proyecto Supabase (Project Settings → API).
      </>
    ),
  },
  {
    title: "2. Crea las tablas",
    body: (
      <>
        Aplica la migración{" "}
        <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">
          supabase/migrations/20261106000000_init.sql
        </code>{" "}
        desde el SQL Editor de Supabase, o ejecuta{" "}
        <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">npx supabase db reset</code> en
        local.
      </>
    ),
  },
  {
    title: "3. Reinicia la app",
    body: <>Vuelve a arrancar el servidor de desarrollo para que Next.js lea las variables.</>,
  },
];

export default function SetupPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-4 py-12">
      <div className="card p-6 sm:p-8">
        <span aria-hidden className="text-4xl">
          🛠️
        </span>
        <h1 className="mt-3 text-2xl font-black text-ink">Falta conectar Supabase</h1>
        <p className="mt-1 text-sm text-ink-soft">
          La aplicación necesita un proyecto de Supabase para guardar familias, hijos, tareas y
          recompensas.
        </p>

        <ol className="mt-6 flex flex-col gap-4">
          {steps.map((step) => (
            <li key={step.title} className="rounded-2xl bg-ink/[0.03] p-4">
              <p className="font-extrabold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>

        <pre className="mt-6 overflow-x-auto rounded-2xl bg-ink p-4 text-xs leading-relaxed text-cream">
          {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
        </pre>

        <p className="mt-4 text-xs font-semibold text-ink-soft">
          En local puedes arrancar Supabase con{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5">npx supabase start</code> y usar las
          claves que imprime por consola.
        </p>
      </div>
    </div>
  );
}