import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Validar Correo y Contraseña
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validamos las credenciales en Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Correo o contraseña incorrectos.");

      // 2. Cerramos sesión temporalmente para exigir el segundo factor de seguridad (OTP)
      await supabase.auth.signOut();

      // 3. Disparamos el envío del código OTP de 8 dígitos al correo
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (otpError) throw otpError;

      // Avanzamos al paso 2 visual para introducir el código
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Error al validar las credenciales.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar el código OTP de 8 dígitos
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw new Error("Código OTP inválido o expirado.");

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#070b19",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, sans-serif",
      color: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
      }}>
        
        {/* Cabecera corporativa */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "22px",
            marginBottom: "15px"
          }}>
            🛡️
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 5px 0" }}>
            Empresa <span style={{ color: "#0ea5e9" }}>Inteligente</span>
          </h2>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, letterSpacing: "1px" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: step === "credentials" ? "#0ea5e9" : "#64748b", fontWeight: "600" }}>
            1. Credenciales
          </span>
          <span style={{ fontSize: "12px", color: step === "otp" ? "#0ea5e9" : "#64748b", fontWeight: "600" }}>
            2. Código OTP (8 dígitos)
          </span>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            color: "#fca5a5",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Formulario Paso 1: Correo y Contraseña */}
        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#cbd5e1" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#cbd5e1" }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
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
                backgroundColor: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {loading ? "Validando credenciales..." : "Continuar al código OTP ➔"}
            </button>
          </form>
        ) : (
          /* Formulario Paso 2: Código OTP de 8 dígitos exactos */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#cbd5e1", textAlign: "center" }}>
                Ingresa los 8 dígitos enviados a tu correo
              </label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="12345678"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "20px",
                  letterSpacing: "4px",
                  textAlign: "center",
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
                backgroundColor: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                marginBottom: "12px"
              }}
            >
              {loading ? "Verificando..." : "Validar código y acceder"}
            </button>

            <button
              type="button"
              onClick={() => setStep("credentials")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              ← Volver al inicio
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "25px",
          paddingTop: "20px",
          borderTop: "1px solid #1e293b",
          textAlign: "center",
          fontSize: "11px",
          color: "#64748b"
        }}>
          🔒 Conexión encriptada E2EE • 2026 Empresa Inteligente
        </div>

      </div>
    </div>
  );
}