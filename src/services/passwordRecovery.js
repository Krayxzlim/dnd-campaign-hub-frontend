export const recoveryMessage = "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña. Revisá también spam.";

export function recoveryUrl(origin) {
  const url = new URL(origin);
  url.search = "?recovery=1";
  url.hash = "";
  return url.toString();
}

export function recoveryEntry(href) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  return {
    active: url.searchParams.get("recovery") === "1" || hash.get("type") === "recovery" || hash.has("error") || url.searchParams.has("error"),
    invalid: hash.has("error") || url.searchParams.has("error"),
  };
}

export async function requestRecovery(auth, email, redirectTo) {
  const { error } = await auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
  return recoveryMessage;
}

export async function updateRecoveredPassword(auth, password, confirmation) {
  if (password.length < 8) throw new Error("Usá al menos 8 caracteres.");
  if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
  const { error } = await auth.updateUser({ password });
  if (error) throw error;
  // A sign-out failure must not report a successful password update as failed.
  try {
    const { error: logoutError } = await auth.signOut({ scope: "global" });
    return { logoutFailed: Boolean(logoutError) };
  } catch {
    return { logoutFailed: true };
  }
}
