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

  return <main className="dashboard">
    <header className="topbar"><div><span className="eyebrow">INTELIGENCIA NLP</span><h1>Analizar comentario</h1><p>Explora el sentimiento y la categoría de los comentarios recibidos.</p></div></header>
    <section className="panel"><div className="panel-header"><div><h3>Comentarios recibidos</h3><span>Selecciona un comentario para consultar su análisis</span></div><span className="count-badge">{comentariosRecibidos.length}</span></div>
      {cargando ? <p role="status">Cargando comentarios…</p> : comentariosRecibidos.length === 0 ? <p>No hay comentarios registrados aún.</p> : <div className="comment-list">
        {comentariosRecibidos.map(item => <article key={item.id} className={"comment-item " + (comentarioSeleccionado === item.contenido ? "selected" : "")}><div className="comment-text"><strong>“{item.contenido}”</strong><small>{item.canal || "Web"} · {item.estado || "Pendiente"}</small></div><button type="button" className="btn-primary" onClick={() => analizarComentarioDirecto(item.contenido)}>Analizar</button></article>)}
      </div>}
    </section>
    {!analisis && <div className="analysis-result analysis-empty">Selecciona «Analizar» para ver aquí el resultado del comentario.</div>}
    {comentarioSeleccionado && analisis && <div className="analysis-result" aria-live="polite">
      <section className="kpi-grid">
        <div className="kpi-card"><h3>Sentimiento</h3><div className="number metric-label" style={{ color: analisis.sentimiento === "Positivo" ? "var(--success)" : analisis.sentimiento === "Negativo" ? "var(--danger)" : "var(--warning)" }}>{analisis.sentimiento}</div><div className="description">Polaridad del comentario</div></div>
        <div className="kpi-card"><h3>Categoría detectada</h3><div className="number metric-label">{analisis.categoria}</div><div className="description">Clasificación del requerimiento</div></div>
        <div className="kpi-card"><h3>Confianza estimada</h3><div className="number">{analisis.confianza}%</div><div className="description">Estimación según coincidencias</div></div>
        <div className="kpi-card"><h3>Palabras procesadas</h3><div className="number">{comentarioSeleccionado.trim().split(/\s+/).length}</div><div className="description">Total de términos del comentario</div></div>
      </section>
      <section className="panel"><div className="panel-header"><div><h3>Resultado del análisis</h3><span>Detalle del comentario seleccionado</span></div></div>
        <blockquote className="analysis-quote">“{comentarioSeleccionado}”</blockquote>
        <p>El comentario se clasificó como <strong>{analisis.categoria}</strong>, con un sentimiento <strong>{analisis.sentimiento.toLowerCase()}</strong>.</p>
        <div className="keyword-list">{analisis.palabrasClave.length ? analisis.palabrasClave.map(word => <span className="keyword" key={word}>{word}</span>) : <p>No se detectaron palabras clave.</p>}</div>
      </section>
    </div>}
  </main>;
}

export default AnalizarComentario;
