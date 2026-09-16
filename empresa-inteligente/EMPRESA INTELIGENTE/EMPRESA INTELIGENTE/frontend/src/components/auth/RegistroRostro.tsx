import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react/styles.css";

// El cliente principal pertenece al administrador. Nunca cambiar su sesión.
export default function RegistroRostro({ nombre, email, onClose }: {
  nombre: string;
  email: string;
  onClose: () => void;
}) {
  const [client] = useState(() => createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false,
      detectSessionInUrl: false, storageKey: "registro-rostro-temporal" } },
  ));
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const lock = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void client.auth.signOut({ scope: "local" });
    };
  }, [client]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try { await action(); }
    catch (err) {
      if (mounted.current) {
        setSessionId(null);
        setError(err instanceof Error ? err.message : "No se pudo completar el registro facial.");
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function invoke(name: string, body: Record<string, string>) {
    const { data: { session } } = await client.auth.getSession();
    if (!session || session.user.email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Verifica el correo del trabajador antes de registrar su rostro.");
    }
    const { data, error: failure } = await client.functions.invoke(name, {
      body, headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (failure) {
      let message = "No se pudo completar la operación facial. Intenta nuevamente.";
      try {
        const result = await failure.context?.clone().json();
        if (typeof result?.error === "string") message = result.error;
      } catch { /* Puede ser un error de red sin respuesta JSON. */ }
      throw new Error(message);
    }
    return data;
  }

  const sendCode = () => run(async () => {
    const { error: failure } = await client.auth.signInWithOtp({
      email, options: { shouldCreateUser: false },
    });
    if (failure) throw new Error("No se pudo enviar el código. Espera un momento y vuelve a intentar.");
    setSent(true);
    setCooldown(60);
  });

  const startCamera = () => run(async () => {
    if (!authenticated) {
      const { data, error: failure } = await client.auth.verifyOtp({ email, token: token.trim(), type: "email" });
      if (failure || !data.session) throw new Error("El código es inválido o ha expirado.");
      setAuthenticated(true);
      setToken("");
    }
    const data = await invoke("create-face-liveness-session", {});
    if (typeof data?.sessionId !== "string" || !data.sessionId) throw new Error("No se pudo iniciar la cámara. Intenta nuevamente.");
    setSessionId(data.sessionId);
  });

  const complete = () => run(async () => {
    if (!sessionId) throw new Error("Inicia una nueva captura facial.");
    const data = await invoke("enroll-face", { sessionId });
    if (data?.success !== true) throw new Error("El servidor no confirmó el registro del rostro. Intenta nuevamente.");
    setSessionId(null);
    setDone(true);
    await client.auth.signOut({ scope: "local" });
  });

  return (
    <section className="panel" aria-labelledby="registro-rostro-title">
      <h3 id="registro-rostro-title">Registrar rostro de {nombre}</h3>
      <p>La cuenta de {email} ya está creada.</p>
      {done ? <p role="status">Rostro registrado correctamente. El trabajador puede iniciar sesión con sus credenciales, OTP y verificación facial.</p> : <>
        <p>El trabajador debe estar presente y aceptar registrar su rostro. Verifica su correo y permite el acceso a la cámara para completar la prueba de vida.</p>
        {!authenticated && <>
          <button type="button" className="btn-primary" disabled={busy || cooldown > 0} onClick={sendCode}>
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : sent ? "Reenviar código" : "Enviar código al trabajador"}
          </button>
          {sent && <label>Código recibido por correo
            <input value={token} onChange={e => setToken(e.target.value)} autoComplete="one-time-code" inputMode="numeric" disabled={busy} />
          </label>}
        </>}
        {!sessionId && (sent || authenticated) && <button type="button" className="btn-primary" disabled={busy || (!authenticated && !token.trim())} onClick={startCamera}>
          {authenticated ? "Iniciar nueva captura" : "Verificar código y abrir cámara"}
        </button>}
        {sessionId && <div style={{ maxWidth: 640, margin: "16px auto" }}>
          <FaceLivenessDetector key={sessionId} sessionId={sessionId} region="us-east-1" onAnalysisComplete={complete}
            onError={() => { setSessionId(null); setError("No se pudo completar la captura. Revisa el permiso de cámara, la iluminación y la conexión e intenta nuevamente."); }} />
        </div>}
        {busy && <p role="status">Procesando…</p>}
        {error && <p role="alert">{error}</p>}
      </>}
      <button type="button" disabled={busy} onClick={onClose}>{done ? "Finalizar" : "Registrar más tarde"}</button>
      {!done && <p>Si lo dejas para después, el registro facial seguirá disponible durante el primer inicio de sesión.</p>}
    </section>
  );
}
