import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

interface RankingPalabra {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

export function PalabrasFrecuentes() {
  const [ranking, setRanking] = useState<RankingPalabra[]>([]);
  const [totalPalabras, setTotalPalabras] = useState(0);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [palabrasUnicas, setPalabrasUnicas] = useState(0);
  const [palabraPrincipal, setPalabraPrincipal] = useState("-");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerYAnalizarComentarios();
  }, []);

  const obtenerYAnalizarComentarios = async () => {
    setCargando(true);
    try {
      // 1. Corregido: Se lee la columna 'contenido' de la tabla 'comentarios'
      const { data, error } = await supabase
        .from("comentarios")
        .select("contenido");

      if (error) throw error;

      if (!data || data.length === 0) {
        setCargando(false);
        return;
      }

      setTotalComentarios(data.length);

      // Stopwords en español para ignorar en el análisis
      const ignorar = new Set([
        "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las",
        "por", "un", "para", "con", "no", "una", "su", "al", "lo", "como", 
        "es", "mas", "más", "este", "esta", "estos", "estas", "pero", "sus"
      ]);

      const contador: Record<string, number> = {};
      let totalContadas = 0;

      // Recorremos los comentarios leyendo la propiedad 'contenido'
      (data as { contenido: string }[]).forEach((row) => {
        if (!row.contenido) return;

        const palabras = row.contenido
          .toLowerCase()
          .replace(/[^\w\sáéíóúñ]/g, "")
          .split(/\s+/);

        palabras.forEach((palabra) => {
          if (palabra.length > 2 && !ignorar.has(palabra)) {
            contador[palabra] = (contador[palabra] || 0) + 1;
            totalContadas++;
          }
        });
      });

      setTotalPalabras(totalContadas);
      setPalabrasUnicas(Object.keys(contador).length);

      const resultado = Object.entries(contador)
        .map(([palabra, frecuencia]) => ({
          palabra,
          frecuencia,
          porcentaje: Math.round((frecuencia / data.length) * 100),
        }))
        .sort((a, b) => b.frecuencia - a.frecuencia);

      if (resultado.length > 0) {
        setPalabraPrincipal(resultado[0].palabra);
      }

      setRanking(resultado.slice(0, 10));
    } catch (err) {
      console.error("Error analizando comentarios:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a" }}>
        Palabras frecuentes
      </h1>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Identificación de las palabras más utilizadas en los comentarios recibidos
      </p>

      {/* Cards de Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Palabras analizadas
          </span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#0f172a" }}>
            {totalPalabras}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Palabras únicas
          </span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#0f172a" }}>
            {palabrasUnicas}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Comentarios
          </span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#0f172a" }}>
            {totalComentarios}
          </h2>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            Palabra principal
          </span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#2563eb", textTransform: "capitalize" }}>
            {palabraPrincipal}
          </h2>
        </div>
      </div>

      {/* Tabla Ranking */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Ranking de palabras
        </h3>

        {cargando ? (
          <p style={{ color: "#64748b" }}>Cargando análisis de comentarios...</p>
        ) : ranking.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No hay comentarios registrados actualmente para analizar.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                <th style={{ padding: "12px" }}>#</th>
                <th style={{ padding: "12px" }}>Palabra</th>
                <th style={{ padding: "12px" }}>Frecuencia</th>
                <th style={{ padding: "12px" }}>Porcentaje de presencia</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, idx) => (
                <tr
                  key={item.palabra}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "12px", color: "#64748b" }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold", textTransform: "capitalize" }}>
                    {item.palabra}
                  </td>
                  <td style={{ padding: "12px" }}>{item.frecuencia}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "100px",
                          backgroundColor: "#e2e8f0",
                          height: "8px",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(item.porcentaje, 100)}%`,
                            backgroundColor: "#2563eb",
                            height: "100%",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                        {item.porcentaje}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PalabrasFrecuentes;