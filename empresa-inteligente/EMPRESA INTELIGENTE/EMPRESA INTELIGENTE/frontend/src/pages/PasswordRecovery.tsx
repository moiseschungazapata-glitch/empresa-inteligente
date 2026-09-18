import { useState, type FormEvent } from "react";
import { supabase } from "../services/supabaseClient";

export default function PasswordRecovery() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return setMessage("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setMessage("Las contraseñas no coinciden.");
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    setMessage(error ? "El enlace venció o ya fue utilizado. Solicita uno nuevo desde el login." : "Contraseña actualizada. Ya puedes iniciar sesión.");
    if (!error) setTimeout(() => { window.location.href = "/"; }, 1400);
  };

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#080f1b", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
    <form onSubmit={updatePassword} style={{ width: "min(440px, 100%)", padding: 32, border: "1px solid #334155", borderRadius: 16, background: "#111827" }}>
      <a href="/" style={{ color: "#9fb5ff", fontSize: 13 }}>← Volver al login</a>
      <p style={{ marginTop: 30, color: "#6f8cff", letterSpacing: 1.5, fontSize: 11, fontWeight: 800 }}>RECUPERACIÓN DE ACCESO</p>
      <h1 style={{ fontSize: 28, margin: "8px 0" }}>Crea una nueva contraseña</h1>
      <p style={{ color: "#aab8cc", lineHeight: 1.5, fontSize: 14 }}>Usa una contraseña segura para proteger tu cuenta.</p>
      <label style={{ display: "grid", gap: 7, marginTop: 24, fontSize: 13 }}>Nueva contraseña<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></label>
      <label style={{ display: "grid", gap: 7, marginTop: 16, fontSize: 13 }}>Confirmar contraseña<input required minLength={6} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} /></label>
      {message && <p style={{ color: "#bcd0ff", fontSize: 13, lineHeight: 1.45 }}>{message}</p>}
      <button disabled={saving} style={buttonStyle}>{saving ? "Guardando..." : "Actualizar contraseña"}</button>
    </form>
  </main>;
}

const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: "13px 14px", border: "1px solid #3b4b63", borderRadius: 8, background: "#0f1724", color: "#f8fafc", fontSize: 14 };
const buttonStyle = { width: "100%", marginTop: 24, padding: "13px 16px", border: 0, borderRadius: 8, background: "linear-gradient(135deg,#3d64e6,#5177ff)", color: "white", fontWeight: 800, cursor: "pointer" };
