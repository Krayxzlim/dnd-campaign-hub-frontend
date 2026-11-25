import { useEffect, useState } from "react";
import { supabase, configurationError } from "../services/supabase";
import { recoveryUrl, requestRecovery, updateRecoveredPassword } from "../services/passwordRecovery";

export default function PasswordRecoveryPage({ invalidLink }) {
  const [checking, setChecking] = useState(true);
  const [account, setAccount] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        if (!supabase) throw new Error(configurationError);
        if (invalidLink) throw new Error("El enlace venció o no es válido. Solicitá uno nuevo.");
        // Wait for Supabase to consume the recovery URL before validating with Auth.
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("El enlace venció o no es válido. Solicitá uno nuevo.");
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) throw new Error("La sesión no es válida. Solicitá otro enlace.");
        if (active) setAccount(data.user.email);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => { active = false; };
  }, [invalidLink]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      if (!supabase) throw new Error(configurationError);
      if (account) {
        const result = await updateRecoveredPassword(supabase.auth, password, confirmation);
        setPassword(""); setConfirmation(""); setDone(true);
        setMessage("Contraseña actualizada. Ya podés ingresar en la web o volver a Android con la nueva contraseña." + (result.logoutFailed ? " No se pudieron cerrar todas las sesiones; cerralas desde tus dispositivos." : ""));
      } else {
        setMessage(await requestRecovery(supabase.auth, email, recoveryUrl(window.location.origin)));
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <div className="login-page"><div className="login-card">
    <h1 className="login-title">Recuperar contraseña</h1>
    {checking ? <p role="status">Validando enlace...</p> : <>
      {account && !done && <p>Nueva contraseña para {account}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!done && <form onSubmit={submit} className="login-form">
        {account ? <>
          <label className="form-label" htmlFor="new-password">Nueva contraseña</label>
          <input id="new-password" className="form-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
          <label className="form-label" htmlFor="confirm-password">Repetir contraseña</label>
          <input id="confirm-password" className="form-input" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={e => setConfirmation(e.target.value)} />
        </> : <>
          <label className="form-label" htmlFor="recovery-email">Correo electrónico</label>
          <input id="recovery-email" className="form-input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </>}
        <button className="form-submit" disabled={busy || !supabase}>{busy ? "Procesando..." : account ? "Guardar contraseña" : "Enviar otro enlace"}</button>
      </form>}
      <a href={window.location.pathname}>Volver al inicio</a>
    </>}
  </div></div>;
}
