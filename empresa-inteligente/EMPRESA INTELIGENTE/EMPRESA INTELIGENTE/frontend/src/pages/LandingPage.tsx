import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";

export function LandingPage() {
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;

    setEnviando(true);
    try {
      // 1. Crear un cliente anónimo temporal para cumplir con la clave foránea 'cliente_id'
      const { data: cliente, error: errorCliente } = await supabase
        .from("clientes")
        .insert([{ nombre: "Cliente Público Anónimo", email: `anon_${Date.now()}@landing.com` }])
        .select()
        .single();

      if (errorCliente) throw errorCliente;

      // 2. Insertar el comentario usando la columna exacta 'contenido'
      const { error: errorComentario } = await supabase.from("comentarios").insert([
        {
          cliente_id: cliente.id,
          contenido: comentario,
          canal: "Web",
          estado: "Pendiente",
          categoria: "Consulta",
          procesado: false,
        },
      ]);

      if (errorComentario) throw errorComentario;

      setExito(true);
      setComentario("");
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      alert("Hubo un error al guardar tu comentario. Revisa los permisos de la base de datos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#070b19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
          Empresa Inteligente
        </h2>
        <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
          Déjanos tu comentario o consulta a continuación:
        </p>

        {exito ? (
          <div style={{ padding: "16px", backgroundColor: "#d1fae5", color: "#065f46", borderRadius: "8px" }}>
            ¡Gracias! Tu comentario ha sido enviado exitosamente.
            <button
              onClick={() => setExito(false)}
              style={{
                display: "block",
                marginTop: "12px",
                background: "none",
                border: "none",
                color: "#047857",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Enviar otro comentario
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <textarea
              rows={5}
              required
              placeholder="Escribe tu comentario aquí..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={enviando}
              style={{
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {enviando ? "Enviando..." : "Enviar comentario"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LandingPage;