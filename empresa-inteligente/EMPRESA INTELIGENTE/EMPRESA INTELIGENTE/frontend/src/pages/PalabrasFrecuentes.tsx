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

  return <main className="dashboard">
    <header className="topbar"><div><span className="eyebrow">INTELIGENCIA NLP</span><h1>Palabras frecuentes</h1><p>Identifica los términos más utilizados en los comentarios de tus clientes.</p></div></header>
    <section className="kpi-grid">
      {[{ label: "Palabras analizadas", value: totalPalabras, detail: "Términos relevantes detectados" }, { label: "Palabras únicas", value: palabrasUnicas, detail: "Vocabulario de los comentarios" }, { label: "Comentarios", value: totalComentarios, detail: "Comentarios incluidos en el análisis" }, { label: "Palabra principal", value: palabraPrincipal, detail: "El término con más apariciones" }].map(metric => <div className="kpi-card" key={metric.label}><h3>{metric.label}</h3><div className="number ranking-word">{cargando ? "—" : metric.value}</div><div className="description">{metric.detail}</div></div>)}
    </section>
    <section className="panel"><div className="panel-header"><div><h3>Ranking de palabras</h3><span>Los 10 términos más frecuentes de tus comentarios</span></div></div>
      {cargando ? <p role="status">Cargando análisis de comentarios…</p> : ranking.length === 0 ? <p>No hay comentarios registrados actualmente para analizar.</p> : <div className="clientes-table"><table><thead><tr><th>Posición</th><th>Palabra</th><th>Frecuencia</th><th>Porcentaje de presencia</th></tr></thead><tbody>
        {ranking.map((item, index) => <tr key={item.palabra}><td>#{index + 1}</td><td className="ranking-word">{item.palabra}</td><td>{item.frecuencia}</td><td><div className="frequency-meter"><div><span style={{ width: Math.min(item.porcentaje, 100) + "%" }} /></div><span>{item.porcentaje}%</span></div></td></tr>)}
      </tbody></table></div>}
    </section>
  </main>;
}

export default PalabrasFrecuentes;
