import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validación y acceso directo al dashboard
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      // Ingreso exitoso directo al dashboard
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
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
        maxWidth: "480px", // Mantiene el ancho elegante y cómodo
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

        {/* Formulario de Acceso Directo */}
        <form onSubmit={handleLogin}>
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
            {loading ? "Iniciando sesión..." : "Ingresar al Sistema →"}
          </button>
        </form>

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