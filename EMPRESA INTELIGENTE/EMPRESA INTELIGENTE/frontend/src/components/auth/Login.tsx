import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Estados para controlar los pasos: "access" | "code" | "identity"
  const [step, setStep] = useState<"access" | "code" | "identity">("access");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Validar Credenciales y disparar el Código OTP
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Validar correo y contraseña
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      // Cerramos sesión temporalmente para exigir el segundo factor por seguridad
      await supabase.auth.signOut();

      // 2. Enviar el código OTP a su correo
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        if (otpError.status === 429) {
          throw new Error("Demasiados intentos. Espera unos minutos o usa acceso directo temporal.");
        }
        throw new Error(otpError.message || "Error al enviar el código OTP.");
      }

      // 3. Pasamos visualmente al Paso 2: Código
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

      // Si todo es correcto, entramos al sistema (o pasaremos al Paso 3 de Identidad próximamente)
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
      backgroundColor: "#05070f",
      backgroundImage: "radial-gradient(circle at 50% 0%, #0c152d 0%, #05070f 75%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#f8fafc",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#080c18",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
      }}>
        
        {/* Icono de Seguridad Superior */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "rgba(14, 165, 233, 0.1)",
            border: "1px solid rgba(14, 165, 233, 0.3)",
            borderRadius: "12px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            color: "#38bdf8",
            marginBottom: "12px"
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Empresa <span style={{ color: "#0ea5e9" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, letterSpacing: "1.2px", textTransform: "uppercase", fontWeight: "600" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        {/* Indicadores de Pasos de Seguridad (Acceso -> Código -> Identidad) */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          padding: "0 10px",
          position: "relative"
        }}>
          {/* Línea conectora de fondo */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            right: "40px",
            height: "2px",
            backgroundColor: "#1e293b",
            zIndex: 1
          }} />

          {/* Paso 1: Acceso */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "access" ? "#0ea5e9" : "#0f172a",
              border: `1px solid ${step === "access" ? "#38bdf8" : "#1e293b"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "access" ? "#fff" : "#64748b",
              fontSize: "16px",
              boxShadow: step === "access" ? "0 0 15px rgba(14, 165, 233, 0.4)" : "none"
            }}>
              🔒
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "access" ? "#38bdf8" : "#64748b", fontWeight: "600" }}>
              Acceso
            </span>
          </div>

          {/* Paso 2: Código */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "code" ? "#0ea5e9" : "#0f172a",
              border: `1px solid ${step === "code" ? "#38bdf8" : "#1e293b"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "code" ? "#fff" : "#64748b",
              fontSize: "16px",
              boxShadow: step === "code" ? "0 0 15px rgba(14, 165, 233, 0.4)" : "none"
            }}>
              🔢
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "code" ? "#38bdf8" : "#64748b", fontWeight: "600" }}>
              Código
            </span>
          </div>

          {/* Paso 3: Identidad (Próximamente) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "identity" ? "#0ea5e9" : "#0f172a",
              border: `1px solid ${step === "identity" ? "#38bdf8" : "#1e293b"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "identity" ? "#fff" : "#64748b",
              fontSize: "16px"
            }}>
              👤
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "identity" ? "#38bdf8" : "#64748b", fontWeight: "600" }}>
              Identidad
            </span>
          </div>
        </div>

        {/* Títulos dinámicos según el paso */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: "#f8fafc" }}>
            {step === "access" && "Bienvenido de nuevo"}
            {step === "code" && "Verificación de Código"}
            {step === "identity" && "Verificación Facial / Identidad"}
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
            {step === "access" && "Ingresa tus credenciales para acceder"}
            {step === "code" && "Introduce el código de 8 dígitos enviado a tu correo"}
            {step === "identity" && "Validación biométrica de seguridad"}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
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

        {/* PASO 1: ACCESO (Credenciales) */}
        {step === "access" && (
          <form onSubmit={handleAccessSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#94a3b8" }}>
                Correo electrónico
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: "#64748b" }}>✉️</span>
                <input
                  type="email"
                  required
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#94a3b8" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "14px", color: "#64748b" }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 40px",
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "10px",
                    color: "white",
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
                    color: "#64748b",
                    fontSize: "14px"
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", fontSize: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#0ea5e9" }}
                />
                Recordarme
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contacta a administración para restablecer tu clave."); }} style={{ color: "#38bdf8", textDecoration: "none" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor: loading ? "#334155" : "#0891b2",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(8, 145, 178, 0.4)",
                transition: "background-color 0.2s",
                marginBottom: "16px"
              }}
            >
              {loading ? "Validando..." : "Iniciar sesión →"}
            </button>

            <div style={{
              backgroundColor: "rgba(14, 165, 233, 0.05)",
              border: "1px solid rgba(14, 165, 233, 0.15)",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              color: "#38bdf8"
            }}>
              🛡️ Al continuar, se enviará un código OTP de verificación.
            </div>
          </form>
        )}

        {/* PASO 2: CÓDIGO (OTP de 8 dígitos) */}
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
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#38bdf8",
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
                backgroundColor: loading ? "#334155" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
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
                color: "#64748b",
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
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "center",
          fontSize: "10px",
          color: "#475569"
        }}>
          🔒 Conexión encriptada E2EE • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}