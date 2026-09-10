import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    comentario: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Guardar cliente en la tabla 'clientes'
      const { data: cliente, error: errorCliente } = await supabase
        .from("clientes")
        .insert([
          {
            cliente: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            empresa: formData.empresa,
          },
        ])
        .select()
        .single();

      if (errorCliente) throw errorCliente;

      // 2. Clasificación preliminar de servicio para NLP
      let servicioDetectado = "General";
      const texto = formData.comentario.toLowerCase();
      if (
        texto.includes("atención") ||
        texto.includes("soporte") ||
        texto.includes("ayuda")
      ) {
        servicioDetectado = "Atención al Cliente";
      } else if (
        texto.includes("precio") ||
        texto.includes("pago") ||
        texto.includes("cotización") ||
        texto.includes("comprar")
      ) {
        servicioDetectado = "Ventas y Cotizaciones";
      } else if (
        texto.includes("pedido") ||
        texto.includes("envío") ||
        texto.includes("entrega") ||
        texto.includes("producto")
      ) {
        servicioDetectado = "Logística y Productos";
      }

      // 3. Guardar comentario en la tabla 'comentarios'
      const { error: errorComentario } = await supabase
        .from("comentarios")
        .insert([
          {
            cliente_id: cliente.id,
            comentario: formData.comentario,
            servicio_detectado: servicioDetectado,
          },
        ]);

      if (errorComentario) throw errorComentario;

      setEnviado(true);
    } catch (error) {
      console.error("Error al registrar solicitud:", error);
      alert("Ocurrió un error al enviar tus datos.");
    } finally {
      setCargando(false);
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
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#0f172a",
          }}
        >
          Bienvenido a Empresa Inteligente
        </h2>
        <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
          Ingresa tus datos y déjanos tu consulta o comentario.
        </p>

        {enviado ? (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#d1fae5",
              color: "#065f46",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ¡Gracias por tus datos! Tu información y comentario han sido registrados con éxito.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Empresa
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) =>
                  setFormData({ ...formData, empresa: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Comentario u Opinión *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Indícanos qué servicio requieres o déjanos tu consulta..."
                value={formData.comentario}
                onChange={(e) =>
                  setFormData({ ...formData, comentario: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              {cargando ? "Enviando..." : "Enviar Formulario"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}