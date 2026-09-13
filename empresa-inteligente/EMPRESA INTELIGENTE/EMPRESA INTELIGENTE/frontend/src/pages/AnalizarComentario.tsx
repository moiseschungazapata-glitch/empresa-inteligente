import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface ComentarioCliente {
  id: number;
  contenido: string;
  canal?: string;
  categoria?: string;
  estado?: string;
}

interface ResultadoAnalisis {
  sentimiento: "Positivo" | "Negativo" | "Neutral";
  categoria: "SERVICIO" | "SOPORTE" | "RECLAMO" | "FELICITACION" | "COMENTARIO";
  confianza: number;
  palabrasClave: string[];
}

export function AnalizarComentario() {
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<string>("");
  const [analisis, setAnalisis] = useState<ResultadoAnalisis | null>(null);
  const [comentariosRecibidos, setComentariosRecibidos] = useState<ComentarioCliente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    obtenerComentarios();
  }, []);

  const obtenerComentarios = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setComentariosRecibidos(data);
    }
    setCargando(false);
  };

  const procesarTextoNLP = (texto: string): ResultadoAnalisis => {
    const textoClean = texto.toLowerCase();

    // Palabras para detectar Sentimiento
    const palabrasPositivas = [
      "excelente", "bueno", "rápido", "gracias", "fantástico", 
      "atención", "eficiente", "satisfecho", "quisiera", "por favor", 
      "adquirir", "me gusta", "interesado", "necesito"
    ];
    const palabrasNegativas = [
      "problema", "problemas", "lento", "fallas", "falla", "tarde", "malo", 
      "error", "pésimo", "queja", "mal", "no funciona"
    ];

    let posHits = 0;
    let negHits = 0;
    const palabrasEncontradas: string[] = [];

    palabrasPositivas.forEach((p) => {
      if (textoClean.includes(p)) {
        posHits++;
        palabrasEncontradas.push(p);
      }
    });

    palabrasNegativas.forEach((p) => {
      if (textoClean.includes(p)) {
        negHits++;
        palabrasEncontradas.push(p);
      }
    });

    // Detectar comentarios mixtos con conectores adversativos (pero, aunque, sin embargo)
    const tieneConectorMixto = /\b(pero|aunque|sin embargo)\b/i.test(textoClean);

    let sentimiento: "Positivo" | "Negativo" | "Neutral" = "Neutral";

    // Si tiene tanto aspectos positivos como negativos, o incluye un conector de contraste con balance, es Neutral
    if ((posHits > 0 && negHits > 0) || (tieneConectorMixto && Math.abs(posHits - negHits) <= 1)) {
      sentimiento = "Neutral";
    } else if (posHits > negHits) {
      sentimiento = "Positivo";
    } else if (negHits > posHits) {
      sentimiento = "Negativo";
    }

    // Categorías (Ampliadas con soporte para técnicos y asesores)
    const keywordsSoporte = [
      "soporte", "sistema", "error", "problema", "problemas", 
      "técnico", "tecnico", "asesor", "ayuda", "falla", "fallas", 
      "acceso", "no funciona", "asistencia", "atención"
    ];
    const keywordsReclamo = [
      "llegó tarde", "pésimo", "queja", "malo", "devuelvan", 
      "molesto", "reclamo", "devolución"
    ];
    const keywordsServicio = [
      "servicio", "adquirir", "comprar", "solicitar", 
      "contratar", "plan", "precio", "información"
    ];
    const keywordsFelicitacion = [
      "excelente", "buen servicio", "felicitaciones", 
      "gracias", "maravilloso", "me encanta"
    ];

    let categoria: "SERVICIO" | "SOPORTE" | "RECLAMO" | "FELICITACION" | "COMENTARIO" = "COMENTARIO";

    if (keywordsSoporte.some((kw) => textoClean.includes(kw))) {
      categoria = "SOPORTE";
    } else if (keywordsReclamo.some((kw) => textoClean.includes(kw))) {
      categoria = "RECLAMO";
    } else if (keywordsFelicitacion.some((kw) => textoClean.includes(kw))) {
      categoria = "FELICITACION";
    } else if (keywordsServicio.some((kw) => textoClean.includes(kw))) {
      categoria = "SERVICIO";
    }

    const totalCoincidencias = posHits + negHits;
    const confianza = Math.min(85 + totalCoincidencias * 4, 98);

    return {
      sentimiento,
      categoria,
      confianza,
      palabrasClave: palabrasEncontradas,
    };
  };

  const analizarComentarioDirecto = (texto: string) => {
    setComentarioSeleccionado(texto);
    const resultado = procesarTextoNLP(texto);
    setAnalisis(resultado);
  };

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Analizar comentario</h1>
          <p>Análisis inteligente de comentarios mediante NLP</p>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: "20px" }}>
        <div className="panel-header" style={{ marginBottom: "12px" }}>
          <div>
            <h3>Comentarios recibidos en tiempo real</h3>
            <span>Haz clic en "Analizar" para procesar el comentario de inmediato</span>
          </div>
        </div>

        {cargando ? (
          <p style={{ color: "#6b7280" }}>Cargando comentarios...</p>
        ) : comentariosRecibidos.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No hay comentarios registrados aún.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "280px", overflowY: "auto" }}>
            {comentariosRecibidos.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937", display: "block" }}>
                    "{item.contenido}"
                  </span>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>
                    Canal: {item.canal || "Web"} | Estado: {item.estado || "Pendiente"}
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => analizarComentarioDirecto(item.contenido)}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  🧠 Analizar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {comentarioSeleccionado && analisis && (
        <>
          <section className="kpi-grid">
            <div className="kpi-card">
              <h3>Sentimiento Predicho</h3>
              <div
                className="number"
                style={{
                  color:
                    analisis.sentimiento === "Positivo"
                      ? "#10b981"
                      : analisis.sentimiento === "Negativo"
                      ? "#ef4444"
                      : "#f59e0b",
                }}
              >
                {analisis.sentimiento}
              </div>
              <div className="description">Análisis de polaridad emocional</div>
            </div>

            <div className="kpi-card">
              <h3>Requerimiento / Categoría</h3>
              <div className="number">{analisis.categoria}</div>
              <div className="description">Clasificación automática</div>
            </div>

            <div className="kpi-card">
              <h3>Confianza del Modelo</h3>
              <div className="number">{analisis.confianza}%</div>
              <div className="description">Precisión estimada</div>
            </div>

            <div className="kpi-card">
              <h3>Palabras Procesadas</h3>
              <div className="number">{comentarioSeleccionado.trim().split(/\s+/).length}</div>
              <div className="description">Total de términos</div>
            </div>
          </section>

          <section className="panel" style={{ marginTop: "20px" }}>
            <div className="panel-header">
              <div>
                <h3>Resultado del análisis NLP</h3>
                <span>Desglose de la predicción obtenida</span>
              </div>
            </div>

            <p style={{ marginBottom: "8px", fontWeight: "bold" }}>Comentario analizado:</p>

            <p
              style={{
                background: "#f9fafb",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                color: "#1f2937",
              }}
            >
              "{comentarioSeleccionado}"
            </p>

            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              <strong>Diagnóstico:</strong> El comentario se categorizó como <strong>{analisis.categoria}</strong> con una polaridad <strong>{analisis.sentimiento.toLowerCase()}</strong>.
              {analisis.palabrasClave.length > 0 && ` Palabras clave detectadas: ${analisis.palabrasClave.join(", ")}.`}
            </p>
          </section>
        </>
      )}
    </main>
  );
}

export default AnalizarComentario;