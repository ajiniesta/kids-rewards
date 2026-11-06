export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Sólo permite rutas internas, para evitar open redirects. */
export function safeNextPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

const TIME_ZONE = process.env.NEXT_PUBLIC_TIMEZONE || "Europe/Madrid";

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function initials(name: string | null | undefined, email: string) {
  const source = (name || "").trim();
  if (source) {
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export function displayName(profile: { full_name: string | null; email: string } | null | undefined) {
  if (!profile) return "Un padre";
  return profile.full_name?.trim() || profile.email.split("@")[0];
}

/** Traduce los errores más habituales de Supabase/Postgres. */
export function friendlyError(message: string | undefined) {
  if (!message) return "Ha ocurrido un error. Inténtalo de nuevo.";
  const normalized = message.toLowerCase();
  if (normalized.includes("no hay puntos suficientes")) {
    return "No hay puntos suficientes para canjear esta recompensa.";
  }
  if (normalized.includes("no puedes deshacer esta tarea")) {
    return "No puedes deshacer esta tarea: sus puntos ya se han canjeado.";
  }
  if (normalized.includes("archivada")) {
    return "Ese elemento está archivado.";
  }
  if (normalized.includes("invitación ya se ha utilizado")) {
    return "Esta invitación ya se ha utilizado.";
  }
  if (normalized.includes("invitación ha caducado")) {
    return "Esta invitación ha caducado. Pide una nueva.";
  }
  if (normalized.includes("otro correo")) {
    return "Esta invitación es para otro correo electrónico.";
  }
  if (normalized.includes("ya perteneces a otra familia")) {
    return "Ya perteneces a otra familia.";
  }
  if (normalized.includes("duplicate key") || normalized.includes("unique")) {
    return "Ese registro ya existe.";
  }
  if (normalized.includes("violates row-level security") || normalized.includes("permission")) {
    return "No tienes permisos para realizar esta acción.";
  }
  return message;
}