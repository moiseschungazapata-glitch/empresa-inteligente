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

  // Paso 1: Validar credenciales y enviar OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
        throw new Error(otpError.message || "Error al enviar el código OTP.");
      }

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar el código OTP de 8 dígitos
  const handleVerifyOtp = async (e: React.FormEvent) => {
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
      backgroundColor: "#05070f",
      backgroundImage: "radial-gradient(circle at 50% 0%, #0f172a 0%, #05070f 75%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#f8fafc",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px", // Más ancho y cómodo
        backgroundColor: "#0b0f19",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "48px 40px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
      }}>
        
        {/* Cabecera Corporativa */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            marginBottom: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 6px 0", letterSpacing: "-0.025em" }}>
            Empresa <span style={{ color: "#38bdf8" }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "600" }}>
            Plataforma de Gestión Segura
          </p>
        </div>

        {/* Indicador de pasos estilo Badge Moderno */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "32px",
          backgroundColor: "#020617",
          padding: "4px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.04)"
        }}>
          <div style={{
            textAlign: "center",
            padding: "8px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: step === "credentials" ? "#1e293b" : "transparent",
            color: step === "credentials" ? "#38bdf8" : "#64748b",
            transition: "all 0.2s ease"
          }}>
            1. Credenciales
          </div>
          <div style={{
            textAlign: "center",
            padding: "8px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: step === "otp" ? "#1e293b" : "transparent",
            color: step === "otp" ? "#38bdf8" : "#64748b",
            transition: "all 0.2s ease"
          }}>
            2. Código OTP
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Formulario Paso 1 */}
        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#94a3b8" }}>
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
                  padding: "14px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#94a3b8" }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
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
                padding: "14px",
                backgroundColor: loading ? "#334155" : "#0284c7",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                transition: "background-color 0.2s"
              }}
            >
              {loading ? "Verificando credenciales..." : "Continuar al código OTP →"}
            </button>
          </form>
        ) : (
          /* Formulario Paso 2 */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "12px", color: "#94a3b8" }}>
                Ingresa el código de 8 dígitos enviado a tu correo
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
                  padding: "16px",
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
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
                padding: "14px",
                backgroundColor: loading ? "#334155" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                marginBottom: "16px"
              }}
            >
              {loading ? "Validando código..." : "Validar código y acceder"}
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
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {/* Footer corporativo */}
        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          textAlign: "center",
          fontSize: "11px",
          color: "#475569",
          letterSpacing: "0.5px"
        }}>
          🔒 Seguridad cifrada de extremo a extremo • Empresa Inteligente 2026
        </div>

      </div>
    </div>
  );
}