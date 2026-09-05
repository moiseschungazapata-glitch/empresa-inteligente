import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Estado de los pasos y del tema (por defecto "dark")
  const [step, setStep] = useState<"access" | "code" | "identity">("access");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
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
    stepInactiveBg: theme === "dark" ? "#0f172a" : "#f1f5f9",
    stepInactiveBorder: theme === "dark" ? "#1e293b" : "#cbd5e1",
    lineBg: theme === "dark" ? "#1e293b" : "#e2e8f0",
    shadow: theme === "dark" ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)" : "0 20px 25px -5px rgba(0, 0, 0, 0.05)"
  };

  // Paso 1: Validar Credenciales y disparar el Código OTP
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      await supabase.auth.signOut();

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        if (otpError.status === 429) {
          throw new Error("Demasiados intentos. Espera unos minutos.");
        }
        throw new Error(otpError.message || "Error al enviar el código OTP.");
      }

      setStep("code");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar el Código OTP
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: token.trim(),
        type: "email",
      });

      if (error) throw new Error("El código OTP es inválido o ha expirado.");

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Código incorrecto.");
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
      
      {/* BOTÓN FLOTANTE: Interruptor de Modo Claro / Oscuro (Arriba a la derecha) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
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
        transition: "background-color 0.3s, border-color 0.3s"
      }}>
        
        {/* Icono de Seguridad Superior */}
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
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "-0.02em", color: t.text }}>
            Empresa <span style={{ color: "#0284c7" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "11px", color: t.subText, margin: 0, letterSpacing: "1.2px", textTransform: "uppercase", fontWeight: "600" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        {/* Indicadores de Pasos de Seguridad */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          padding: "0 10px",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            right: "40px",
            height: "2px",
            backgroundColor: t.lineBg,
            zIndex: 1
          }} />

          {/* Paso 1: Acceso */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "access" ? "#0284c7" : t.stepInactiveBg,
              border: `1px solid ${step === "access" ? "#0284c7" : t.stepInactiveBorder}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "access" ? "#fff" : t.subText,
              fontSize: "16px",
              boxShadow: step === "access" ? "0 4px 12px rgba(2, 132, 199, 0.3)" : "none"
            }}>
              🔒
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "access" ? "#0284c7" : t.subText, fontWeight: "600" }}>
              Acceso
            </span>
          </div>

          {/* Paso 2: Código */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "code" ? "#0284c7" : t.stepInactiveBg,
              border: `1px solid ${step === "code" ? "#0284c7" : t.stepInactiveBorder}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "code" ? "#fff" : t.subText,
              fontSize: "16px",
              boxShadow: step === "code" ? "0 4px 12px rgba(2, 132, 199, 0.3)" : "none"
            }}>
              🔢
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "code" ? "#0284c7" : t.subText, fontWeight: "600" }}>
              Código
            </span>
          </div>

          {/* Paso 3: Identidad */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "identity" ? "#0284c7" : t.stepInactiveBg,
              border: `1px solid ${step === "identity" ? "#0284c7" : t.stepInactiveBorder}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "identity" ? "#fff" : t.subText,
              fontSize: "16px"
            }}>
              👤
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "identity" ? "#0284c7" : t.subText, fontWeight: "600" }}>
              Identidad
            </span>
          </div>
        </div>

        {/* Títulos dinámicos */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: t.text }}>
            {step === "access" && "Bienvenido de nuevo"}
            {step === "code" && "Verificación de Código"}
            {step === "identity" && "Verificación Facial / Identidad"}
          </h2>
          <p style={{ fontSize: "13px", color: t.subText, margin: 0 }}>
            {step === "access" && "Ingresa tus credenciales para acceder"}
            {step === "code" && "Introduce el código de 8 dígitos enviado a tu correo"}
            {step === "identity" && "Validación biométrica de seguridad"}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
            border: `1px solid ${theme === "dark" ? "rgba(239, 68, 68, 0.3)" : "#fecaca"}`,
            color: theme === "dark" ? "#fca5a5" : "#dc2626",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* PASO 1: ACCESO */}
        {step === "access" && (
          <form onSubmit={handleAccessSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>
                Correo electrónico
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>✉️</span>
                <input
                  type="email"
                  required
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    backgroundColor: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    borderRadius: "10px",
                    color: t.text,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: t.subText }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: t.subText }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 40px",
                    backgroundColor: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    borderRadius: "10px",
                    color: t.text,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: t.subText,
                    fontSize: "14px"
                  }}
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
                />
                Recordarme
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contacta a administración."); }} style={{ color: "#0284c7", textDecoration: "none", fontWeight: "500" }}>
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
              {loading ? "Validando..." : "Iniciar sesión →"}
            </button>

            <div style={{
              backgroundColor: theme === "dark" ? "rgba(14, 165, 233, 0.05)" : "#f0f9ff",
              border: `1px solid ${theme === "dark" ? "rgba(14, 165, 233, 0.15)" : "#bae6fd"}`,
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              color: "#0284c7",
              fontWeight: "500"
            }}>
              🛡️ Al continuar, se enviará un código OTP de verificación.
            </div>
          </form>
        )}

        {/* PASO 2: CÓDIGO */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="12345678"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: "12px",
                  color: "#0284c7",
                  fontSize: "24px",
                  letterSpacing: "6px",
                  textAlign: "center",
                  fontWeight: "700",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor: loading ? "#94a3b8" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                marginBottom: "12px"
              }}
            >
              {loading ? "Verificando código..." : "Validar código y acceder"}
            </button>

            <button
              type="button"
              onClick={() => setStep("access")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: t.subText,
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              ← Volver a credenciales
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: `1px solid ${t.cardBorder}`,
          textAlign: "center",
          fontSize: "10px",
          color: t.subText
        }}>
          🔒 Conexión encriptada E2EE • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}