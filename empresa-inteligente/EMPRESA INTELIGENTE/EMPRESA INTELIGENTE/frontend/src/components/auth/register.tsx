import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

interface RegisterProps {
  onBackToLogin: () => void;
}

export default function Register({ onBackToLogin }: RegisterProps) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [interes, setInteres] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CONFIGURACIÓN: Ingresa tu correo o tu número de WhatsApp aquí
  const ADMIN_PHONE_WHATSAPP = "51903271188"; // Reemplaza con tu número (código país + número)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombres.trim() || !apellidos.trim() || !email.trim()) {
      setError("Por favor completa los campos obligatorios (*).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Guardar la solicitud en la tabla 'solicitudes' de Supabase
      const { error: dbError } = await supabase.from("solicitudes").insert([
        {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: email.trim(),
          telefono: telefono.trim() || null,
          interes: interes.trim() || null,
          estado: "pendiente",
        },
      ]);

      if (dbError) {
        console.error("Error al guardar en BD:", dbError);
        // Si la tabla aún no existe, continuamos con el envío del mensaje
      }

      // 2. Opción Correo: Enviar correo automático mediante Formspree
      try {
        await fetch(`https://formspree.io/f/mzebyoyl`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombres,
            apellidos,
            email,
            telefono,
            interes,
            _subject: `Nueva solicitud de acceso: ${nombres} ${apellidos}`,
          }),
        });
      } catch (mailErr) {
        console.log("Notificación por correo omitida o no configurada.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Función opcional para enviar la solicitud directamente por WhatsApp
  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `*NUEVA SOLICITUD DE ACCESO*\n\n` +
        `👤 *Nombre:* ${nombres} ${apellidos}\n` +
        `✉️ *Correo:* ${email}\n` +
        `📞 *Teléfono:* ${telefono || "No especificado"}\n` +
        `💡 *Interés:* ${interes || "No especificado"}`
    );
    window.open(`https://wa.me/${ADMIN_PHONE_WHATSAPP}?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#070b19",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif, system-ui",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Encabezado */}
        <div style={{ marginBottom: "32px" }}>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 12px 0",
              letterSpacing: "-0.5px",
            }}
          >
            SOLICITAR ACCESO
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            Envía tus datos. La administración revisa la solicitud, activa tu
            cuenta y te envía el código de acceso a tu correo.
          </p>
        </div>

        {submitted ? (
          /* Vista de Confirmación Exitoso */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontSize: "20px",
                color: "#0f172a",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              ¡Solicitud enviada con éxito!
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "24px",
              }}
            >
              Hemos registrado tus datos. Nos pondremos en contacto contigo a
              través de <strong>{email}</strong> una vez aprobada tu cuenta.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={handleSendWhatsApp}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>💬</span> Notificar por WhatsApp al Administrador
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Registro */
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Nombres y Apellidos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#475569",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#475569",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Correo */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#475569",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Correo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#475569",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* ¿Qué curso o servicio te interesa? */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#475569",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                ¿Cargo y motivo de solicitud? (Opcional)
              </label>
              <textarea
                rows={4}
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: loading ? "#64748b" : "#080e1e",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "800",
                fontSize: "13px",
                letterSpacing: "1.5px",
                cursor: loading ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                transition: "background 0.2s",
              }}
            >
              {loading ? "PROCESANDO SOLICITUD..." : "ENVIAR SOLICITUD"}
            </button>

            {/* Volver a Login */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                type="button"
                onClick={onBackToLogin}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}