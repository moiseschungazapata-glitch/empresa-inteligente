import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paleta de colores dinámica según el tema seleccionado
  const t = {
    bg: theme === "dark" ? "#05070f" : "#f8fafc",
    gradient: theme === "dark" 
      ? "radial-gradient(circle at 50% 0%, #0c152d 0%, #05070f 75%)" 
      : "radial-gradient(circle at 50% 0%, #e0f2fe 0%, #f8fafc 75%)",
    cardBg: theme === "dark" ? "#080c18" : "#ffffff",
    cardBorder: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    text: theme === "dark" ? "#f8fafc" : "#0f172a",
    subText: theme === "dark" ? "#94a3b8" : "#64748b",
    inputBg: theme === "dark" ? "#020617" : "#f8fafc",
    inputBorder: theme === "dark" ? "#1e293b" : "#cbd5e1",
    shadow: theme === "dark" ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)" : "0 20px 25px -5px rgba(0, 0, 0, 0.05)"
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Validación directa de correo y contraseña en Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Correo o contraseña incorrectos.");
      }

      // Éxito: Ejecutar callback o recargar para ingresar al dashboard
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: t.bg,
      backgroundImage: t.gradient,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: t.text,
      padding: "24px",
      position: "relative"
    }}>
      
      {/* Botón Flotante: Interruptor de Tema (Modo Claro / Oscuro) */}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title="Cambiar Modo Claro/Oscuro"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          backgroundColor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          color: t.text,
          padding: "10px 14px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.2s"
        }}
      >
        <span>{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
      </button>

      {/* Contenedor Principal */}
      <div style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: t.shadow,
      }}>
        
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: theme === "dark" ? "rgba(14, 165, 233, 0.1)" : "#e0f2fe",
            border: `1px solid ${theme === "dark" ? "rgba(14, 165, 233, 0.3)" : "#bae6fd"}`,
            borderRadius: "12px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            color: "#0284c7",
            marginBottom: "12px"
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0", color: t.text }}>
            Empresa <span style={{ color: "#0284c7" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "11px", color: t.subText, margin: 0, letterSpacing: "1.2px", textTransform: "uppercase", fontWeight: "600" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: t.text }}>
            Bienvenido de nuevo
          </h2>
          <p style={{ fontSize: "13px", color: t.subText, margin: 0 }}>
            Ingresa tus credenciales corporativas
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "#fef2f2", border: `1px solid ${theme === "dark" ? "rgba(239, 68, 68, 0.3)" : "#fecaca"}`, color: theme === "dark" ? "#fca5a5" : "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>Correo electrónico</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>✉️</span>
              <input 
                type="email" 
                required 
                placeholder="nombre@empresa.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ width: "100%", padding: "12px 14px 12px 40px", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", color: t.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ width: "100%", padding: "12px 40px 12px 40px", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", color: t.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: "absolute", right: "12px", top: "12px", background: "transparent", border: "none", cursor: "pointer", color: t.subText, fontSize: "14px" }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", fontSize: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: t.subText, cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ accentColor: "#0284c7" }} 
              /> Recordarme
            </label>
            <a 
              href="#forgot" 
              onClick={(e) => { e.preventDefault(); alert("Contacta a administración de TI."); }} 
              style={{ color: "#0284c7", textDecoration: "none", fontWeight: "500" }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: "100%", 
              padding: "13px", 
              backgroundColor: loading ? "#94a3b8" : "#0284c7", 
              color: "white", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: "600", 
              fontSize: "14px", 
              cursor: loading ? "not-allowed" : "pointer", 
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)", 
              marginBottom: "16px" 
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión →"}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${t.cardBorder}`, textAlign: "center", fontSize: "10px", color: t.subText }}>
          🔒 Conexión encriptada E2EE • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}