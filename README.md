# Kids Rewards ⭐

Aplicación web para familias: los padres crean tareas con puntos para sus hijos, los peques van
sumando puntos al completarlas y los canjean por recompensas. El tablón de cada hijo se puede
compartir entre los dos padres.

Hecha con **Next.js 16 (App Router)**, **Supabase** (Postgres + Auth + RLS) y **Tailwind CSS 4**.

## Funcionalidades

- **Autenticación por email y contraseña** con Supabase Auth (registro, acceso, recuperación de
  contraseña y confirmación de correo).
- **Un tablón por hijo/a** con avatar y color propios.
- **Tareas** con título, descripción, icono y puntos. Se pueden crear, editar, archivar y eliminar.
- **Recompensas** con título, descripción, icono y coste en puntos. También CRUD y archivado.
- **Puntos en tiempo real**: completar una tarea suma sus puntos; canjear una recompensa los resta.
  El canje se valida en la base de datos para que no se pueda gastar más de lo disponible.
- **Historial** de tareas completadas y recompensas canjeadas, con autor y opción de deshacer.
- **Tablón compartido**: el primer padre configura la familia y genera una invitación para el otro.
  Ambos ven y gestionan los mismos hijos, tareas, puntos y recompensas.
- **Solo padres**: todas las rutas privadas están protegidas y los datos se aíslan por familia con
  Row Level Security (RLS) en Supabase.

## Puesta en marcha en local

### 1. Requisitos

- Node.js 20+
- Docker (para Supabase local) o un proyecto de Supabase en la nube

### 2. Instalar dependencias

```bash
npm install
```

### 3. Arrancar Supabase local

```bash
npm run db:start
```

El proyecto usa puertos propios para no chocar con otras instancias de Supabase
(`supabase/config.toml`):

| Servicio        | URL                     |
| --------------- | ----------------------- |
| API             | http://127.0.0.1:54331  |
| Postgres        | `127.0.0.1:54332`       |
| Studio          | http://127.0.0.1:54333  |
| Emails (Mailpit)| http://127.0.0.1:54334  |

El comando muestra la URL y la `anon key`. También puedes consultarlas con:

```bash
npx supabase status
```

### 4. Configurar variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key de `npx supabase status`>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TIMEZONE=Europe/Madrid
```

### 5. Aplicar el esquema de base de datos

```bash
npm run db:reset
```

Esto ejecuta `supabase/migrations/20261106000000_init.sql` (tablas, funciones y políticas RLS) y
`supabase/seed.sql`.

### 6. Arrancar la app

```bash
npm run dev
```

Abre http://localhost:3000, crea una cuenta y configura el primer tablón.

> En local, la confirmación de correo está desactivada (`supabase/config.toml`), así que el registro
> entra directamente. Los emails (recuperación de contraseña, confirmaciones) se pueden ver en
> Mailpit: http://127.0.0.1:54334.

## Uso

1. **Crea tu cuenta** con email y contraseña.
2. **Configura la familia** y, si quieres, el primer hijo o hija.
3. Desde el tablón, entra en **Gestionar** para añadir tareas y recompensas.
4. En el tablón, pulsa **¡Hecho!** al completar una tarea y **Canjear** cuando haya puntos suficientes.
5. Ve a **Familia** para invitar al otro padre o madre por correo. La app genera un enlace que puedes
   copiar, enviar por email (`mailto:`) o compartir por WhatsApp. El invitado debe iniciar sesión o
   registrarse con ese mismo correo y aceptar la invitación.

## Seguridad y modelo de datos

Las tablas principales son:

- `profiles` — datos del padre/madre, enlazados a `auth.users`.
- `families` y `family_members` — familia y sus padres. Cada padre pertenece a una sola familia.
- `children` — hijos e hijas de la familia.
- `tasks` y `task_completions` — tareas y registro histórico de veces completadas.
- `rewards` y `reward_redemptions` — recompensas y canjes.
- `family_invites` — invitaciones por email con token y caducidad (7 días).

Puntos y canjes se gestionan mediante funciones RPC (`complete_task`, `redeem_reward`,
`undo_task_completion`, `undo_reward_redemption`, `accept_family_invite`) que validan la pertenencia
a la familia y bloquean la fila del hijo para evitar condiciones de carrera. Las tablas de movimientos
no permiten inserts directos desde el cliente.

Todas las tablas tienen **RLS activado**. Las políticas permiten el acceso únicamente a los miembros
de la familia propietaria de cada hijo, tarea o recompensa. Los títulos e iconos se guardan como
instantánea en el historial, para que siga siendo legible si se elimina la tarea o recompensa original.

## Despliegue en producción

1. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta el contenido de
   `supabase/migrations/20261106000000_init.sql` desde el SQL Editor.
2. Configura en Supabase (Authentication → URL Configuration):
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: `https://tu-dominio.com/auth/callback`
3. Define las variables de entorno en tu hosting (Vercel, etc.):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` y, si quieres,
   `NEXT_PUBLIC_TIMEZONE`.
4. Activa la confirmación de correo y configura un servidor SMTP en Supabase Auth si quieres que los
   usuarios confirmen su cuenta y puedan recuperar contraseñas.
5. `npm run build && npm run start` (o despliega en Vercel).

La aplicación no envía los emails de invitación por sí misma: genera un enlace seguro con caducidad
para que lo compartas desde tu correo o mensajería. Para envíos automáticos haría falta configurar un
proveedor SMTP y una ruta con la service role key.

## Estructura del proyecto

```
src/
  app/
    (app)/                 # Rutas privadas con cabecera
      dashboard/           # Lista de hijos y alta
      children/[childId]/  # Tablón, gestionar e historial
      family/              # Miembros e invitaciones
      onboarding/          # Crear la familia
    (auth)/                # Login, registro, recuperación, invitación
    auth/callback/         # Intercambio de código de Supabase
    setup/                 # Aviso si falta configurar Supabase
  components/              # UI, formularios, cabecera
  lib/
    actions/               # Server Actions (CRUD, puntos, familia)
    supabase/              # Clientes browser/server
    auth.ts                # Sesión, perfil y familia actual
    data.ts                # Consultas de lectura
  proxy.ts                 # Refresco de sesión y protección de rutas
supabase/
  migrations/20261106000000_init.sql
  config.toml
```

## Scripts

| Script              | Descripción                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                   |
| `npm run build`     | Build de producción                      |
| `npm run start`     | Servir el build                          |
| `npm run lint`      | ESLint                                   |
| `npm run typecheck` | TypeScript sin emitir                    |
| `npm run db:start`  | Arrancar Supabase local                  |
| `npm run db:stop`   | Parar Supabase local                     |
| `npm run db:reset`  | Recrear la base de datos y aplicar SQL   |