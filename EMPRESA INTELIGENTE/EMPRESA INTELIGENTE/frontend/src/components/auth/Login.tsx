import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirige automáticamente a tu web en Vercel tras hacer clic en el correo
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setMessage("¡Enlace enviado con éxito! Revisa tu correo y haz clic en el botón para ingresar.");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al enviar el enlace de acceso.");
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

        {message && (
          <div style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid #22c55e",
            color: "#86efac",
            padding: "12px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px",
            lineHeight: "1.4"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#cbd5e1" }}>
              Correo electrónico corporativo
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
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Enviando enlace..." : "Enviar enlace de acceso ➔"}
          </button>
        </form>

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