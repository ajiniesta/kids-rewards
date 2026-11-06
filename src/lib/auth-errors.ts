export function translateAuthError(message: string | undefined) {
  if (!message) return "Ha ocurrido un error. Inténtalo de nuevo.";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada.";
  }
  if (normalized.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo. Inicia sesión.";
  }
  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (normalized.includes("auth session missing") || normalized.includes("session")) {
    return "El enlace ha caducado. Solicita uno nuevo.";
  }
  if (normalized.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }
  if (normalized.includes("unable to validate email") || normalized.includes("invalid email")) {
    return "El correo electrónico no es válido.";
  }
  return message;
}