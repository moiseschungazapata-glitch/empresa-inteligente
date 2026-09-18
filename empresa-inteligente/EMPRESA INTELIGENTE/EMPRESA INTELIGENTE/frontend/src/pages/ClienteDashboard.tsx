import { useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "../services/supabaseClient";
import "../cliente-dashboard.css";

type IconName = "users" | "chart" | "building" | "star" | "brain" | "pin" | "send" | "lock";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.5-4 2.6-6 6-6s5.5 2 6 6M15 14c3.2 0 5 1.7 5.5 5"/></>,
    chart: <><path d="M4 20V11h4v9M10 20V5h4v15M16 20v-7h4v7"/></>,
    building: <><path d="M5 21V4h11v17M16 9h3v12M8 8h2M12 8h1M8 12h2M12 12h1M8 16h2M12 16h1M3 21h18"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>,
    brain: <><path d="M9 4a3 3 0 0 0-5 2.2A3.5 3.5 0 0 0 3 13a3.5 3.5 0 0 0 4 5.7A3 3 0 0 0 12 17V7a3 3 0 0 0-3-3Z"/><path d="M15 4a3 3 0 0 1 5 2.2A3.5 3.5 0 0 1 21 13a3.5 3.5 0 0 1-4 5.7A3 3 0 0 1 12 17V7a3 3 0 0 1 3-3ZM8 9H5M19 9h-3M8 14H5M19 14h-3"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    send: <><path d="m3 11 18-8-8 18-2.5-7.5L3 11Z"/><path d="m10.5 13.5 5-5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function ClienteDashboard() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [canal, setCanal] = useState("Web");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function enviarComentario(event: FormEvent) {
    event.preventDefault();
    if (enviando || !nombre.trim() || !email.trim() || !comentario.trim()) return;
    setEnviando(true);
    setMensaje(null);
    try {
      const { data: cliente, error: clienteError } = await supabase.from("clientes")
        .insert([{ nombre: nombre.trim(), email: email.trim().toLowerCase() }]).select("id").single();
      if (clienteError) throw clienteError;
      const { error } = await supabase.from("comentarios").insert([{
        cliente_id: cliente.id, contenido: comentario.trim(), canal,
        estado: "Pendiente", categoria: "Consulta", procesado: false,
      }]);
      if (error) throw error;
      setNombre(""); setEmail(""); setCanal("Web"); setComentario("");
      setMensaje({ tipo: "ok", texto: "Gracias. Tu comentario fue enviado correctamente." });
    } catch (error) {
      console.error("No se pudo enviar el comentario:", error);
      setMensaje({ tipo: "error", texto: "No pudimos enviar tu comentario. Inténtalo nuevamente." });
    } finally { setEnviando(false); }
  }

  return <div className="cliente-dashboard">
    <header className="cliente-header">
      <a className="cliente-brand" href="#inicio" aria-label="Empresa Inteligente, inicio">
        <span className="cliente-brand-mark">EI</span><span><strong>EMPRESA INTELIGENTE</strong><small>Datos que impulsan tu crecimiento</small></span>
      </a>
      <nav aria-label="Navegación principal"><a className="active" href="#inicio">Inicio</a><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav>
      <a className="cliente-login" href="/"><Icon name="lock"/>Acceso al sistema</a>
    </header>

    <main>
      <section className="cliente-hero" id="inicio">
        <div className="hero-copy">
          <span className="cliente-eyebrow">INTELIGENCIA PARA DECISIONES REALES</span>
          <h1>Convierte cada comentario<br/>en una decisión inteligente</h1>
          <p>Analizamos la voz de tus clientes con inteligencia artificial para que tu empresa tome mejores decisiones, más rápido y con mayor impacto.</p>
          <a className="cliente-primary" href="#servicios">Conocer servicios <span>→</span></a>
          <div className="hero-benefits"><span>✓ Opiniones en datos</span><span>✓ Clientes más satisfechos</span><span>✓ Crecimiento sostenible</span></div>
        </div>
        <div className="hero-insights" aria-label="Vista previa de análisis">
          <article className="insight-card sentiment-card"><header><strong>Sentimiento de clientes</strong><small>Últimos 6 meses⌄</small></header><div className="sentiment-content"><div className="donut"><span><strong>1,248</strong><small>comentarios</small></span></div><ul><li><i className="green"/>Positivo <b>72%</b></li><li><i className="blue"/>Neutral <b>18%</b></li><li><i className="red"/>Negativo <b>10%</b></li></ul></div></article>
          <article className="insight-card quote-card"><span>“</span><p>“Excelente servicio, la atención fue muy rápida y amable. ¡Totalmente recomendado!”</p><b>↑ Positivo</b></article>
          <article className="insight-card trend-card"><header><strong>Tendencia de comentarios</strong><b>+ 28% ↑<small>vs. periodo anterior</small></b></header><svg viewBox="0 0 520 130" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4169e1" stopOpacity=".36"/><stop offset="1" stopColor="#4169e1" stopOpacity="0"/></linearGradient></defs><path className="grid" d="M0 25H520M0 65H520M0 105H520M60 0V120M130 0V120M200 0V120M270 0V120M340 0V120M410 0V120M480 0V120"/><path className="area" d="M0 102L70 75L140 82L210 60L280 45L350 39L420 18L500 8L500 120L0 120Z"/><path className="line" d="M0 102L70 75L140 82L210 60L280 45L350 39L420 18L500 8"/></svg><div className="months"><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span></div></article>
          <article className="insight-card topics-card"><strong>Temas más mencionados</strong>{[["Atención al cliente","32%"],["Calidad del servicio","24%"],["Precios","18%"],["Tiempo de respuesta","16%"],["Otros","10%"]].map(([label,value])=><div key={label}><span>{label}</span><i><b style={{width:value}}/></i><small>{value}</small></div>)}</article>
        </div>
      </section>

      <section className="cliente-stats" aria-label="Indicadores destacados">
        <div><Icon name="users"/><span><strong>+1,200</strong><small>Comentarios analizados al mes</small></span></div><div><Icon name="chart"/><span><strong>95%</strong><small>Precisión en análisis de sentimiento</small></span></div><div><Icon name="building"/><span><strong>50+</strong><small>Empresas confían en nosotros</small></span></div><div><Icon name="star"/><span><strong>4.8/5</strong><small>Satisfacción de clientes</small></span></div>
      </section>

      <section className="cliente-lower" id="servicios">
        <div className="services-side"><header><h2>Nuestros servicios</h2><a href="#servicios">Ver todos los servicios →</a></header><div className="services-grid">
          <article><Icon name="brain"/><h3>Análisis NLP</h3><p>Transformamos comentarios en insights con procesamiento de lenguaje natural.</p><a href="#nosotros">Conocer más →</a></article>
          <article><Icon name="users"/><h3>Gestión de clientes</h3><p>Centraliza, organiza y entiende la voz de tus clientes en un solo lugar.</p><a href="#nosotros">Conocer más →</a></article>
          <article><Icon name="chart"/><h3>Reportes inteligentes</h3><p>Convierte datos en decisiones con dashboards claros y en tiempo real.</p><a href="#nosotros">Conocer más →</a></article>
        </div></div>
        <section className="cliente-contact" id="contacto"><h2>Cuéntanos cómo podemos ayudarte</h2><p>Déjanos tu comentario o consulta sobre nuestros servicios.</p><form onSubmit={enviarComentario}>
          <label>Nombre completo<input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="name"/></label><label>Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com" autoComplete="email"/></label><label>Canal de contacto<select value={canal} onChange={e=>setCanal(e.target.value)}><option>Web</option><option>Correo</option><option>Teléfono</option></select></label><label>Comentario<textarea required value={comentario} onChange={e=>setComentario(e.target.value)} placeholder="Cuéntanos tu consulta..." rows={2}/></label>{mensaje&&<p className={"form-message "+mensaje.tipo} role="status">{mensaje.texto}</p>}<button type="submit" disabled={enviando}><Icon name="send"/>{enviando?"Enviando...":"Enviar comentario"}</button>
        </form></section>
      </section>
    </main>

    <footer className="cliente-footer" id="nosotros"><div className="footer-brand"><span className="cliente-brand-mark">EI</span><span><strong>EMPRESA INTELIGENTE</strong><small>Datos que impulsan tu crecimiento</small></span></div><div><strong>Enlaces</strong><span><a href="#inicio">Inicio</a><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></span></div><div className="footer-location"><Icon name="pin"/><span><strong>Lima, Perú</strong><small>Soluciones empresariales inteligentes</small></span></div><p>Un futuro más inteligente<br/>comienza escuchando.</p><div className="footer-bottom"><span>© 2026 EMPRESA INTELIGENTE. Todos los derechos reservados.</span><span>Política de privacidad · Soporte</span></div></footer>
  </div>;
}

export default ClienteDashboard;
