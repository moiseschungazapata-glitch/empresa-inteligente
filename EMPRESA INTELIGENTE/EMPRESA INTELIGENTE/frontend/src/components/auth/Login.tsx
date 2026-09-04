import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Enviar solicitud de código OTP al correo
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Cambiar a true si deseas permitir registros automáticos
        },
      });

      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar el código OTP de 6 dígitos ingresado
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

      if (error) throw error;
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Código OTP inválido o expirado.");
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
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
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
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, letterSpacing: "1px" }}>
            SISTEMA DE GESTIÓN EMPRESARIAL
          </p>
        </div>

        {/* Indicador de pasos visual */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: step === "credentials" ? "#0ea5e9" : "#64748b", fontWeight: "600" }}>
            1. Acceso
          </span>
          <span style={{ fontSize: "12px", color: step === "otp" ? "#0ea5e9" : "#64748b", fontWeight: "600" }}>
            2. Código OTP
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

        {/* Formulario 1: Correo electrónico */}
        {step === "credentials" ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#cbd5e1" }}>
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
              {loading ? "Enviando código..." : "Iniciar sesión ➔"}
            </button>
          </form>
        ) : (
          /* Formulario 2: Código OTP de verificación */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#cbd5e1" }}>
                Código OTP enviado a tu correo
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "18px",
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
              ← Volver al correo
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "30px",
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