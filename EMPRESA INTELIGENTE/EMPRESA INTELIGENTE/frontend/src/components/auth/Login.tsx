import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
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
      backgroundColor: "#f8fafc",
      backgroundImage: "radial-gradient(circle at 50% 0%, #e0f2fe 0%, #f8fafc 75%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#0f172a",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}>
        
        {/* Icono de Seguridad Superior */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "#e0f2fe",
            border: "1px solid #bae6fd",
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
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "-0.02em", color: "#0f172a" }}>
            Empresa <span style={{ color: "#0284c7" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, letterSpacing: "1.2px", textTransform: "uppercase", fontWeight: "600" }}>
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
            backgroundColor: "#e2e8f0",
            zIndex: 1
          }} />

          {/* Paso 1 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "access" ? "#0284c7" : "#f1f5f9",
              border: `1px solid ${step === "access" ? "#0284c7" : "#cbd5e1"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "access" ? "#fff" : "#64748b",
              fontSize: "16px",
              boxShadow: step === "access" ? "0 4px 12px rgba(2, 132, 199, 0.3)" : "none"
            }}>
              🔒
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "access" ? "#0284c7" : "#64748b", fontWeight: "600" }}>
              Acceso
            </span>
          </div>

          {/* Paso 2 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "code" ? "#0284c7" : "#f1f5f9",
              border: `1px solid ${step === "code" ? "#0284c7" : "#cbd5e1"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "code" ? "#fff" : "#64748b",
              fontSize: "16px",
              boxShadow: step === "code" ? "0 4px 12px rgba(2, 132, 199, 0.3)" : "none"
            }}>
              🔢
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "code" ? "#0284c7" : "#64748b", fontWeight: "600" }}>
              Código
            </span>
          </div>

          {/* Paso 3 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: step === "identity" ? "#0284c7" : "#f1f5f9",
              border: `1px solid ${step === "identity" ? "#0284c7" : "#cbd5e1"}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: step === "identity" ? "#fff" : "#64748b",
              fontSize: "16px"
            }}>
              👤
            </div>
            <span style={{ fontSize: "11px", marginTop: "6px", color: step === "identity" ? "#0284c7" : "#64748b", fontWeight: "600" }}>
              Identidad
            </span>
          </div>
        </div>

        {/* Títulos dinámicos */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: "#0f172a" }}>
            {step === "access" && "Bienvenido de nuevo"}
            {step === "code" && "Verificación de Código"}
            {step === "identity" && "Verificación Facial / Identidad"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            {step === "access" && "Ingresa tus credenciales para acceder"}
            {step === "code" && "Introduce el código de 8 dígitos enviado a tu correo"}
            {step === "identity" && "Validación biométrica de seguridad"}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#334155" }}>
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
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#334155" }}>
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
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
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
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", cursor: "pointer" }}>
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
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              color: "#0369a1",
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
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
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
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
          fontSize: "10px",
          color: "#94a3b8"
        }}>
          🔒 Conexión encriptada E2EE • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}