import { useState } from "react";

function AnalizarComentario() {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState(false);

  const analizar = () => {
    if (!comentario.trim()) {
      alert("Escribe un comentario primero");
      return;
    }

    setResultado(true);
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Analizar comentario</h1>
          <p>
            Análisis inteligente de comentarios mediante NLP
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Comentario del cliente</h3>
            <span>
              Introduce el texto que deseas analizar
            </span>
          </div>
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Ejemplo: El servicio fue excelente y recibí mi pedido rápidamente..."
          rows={7}
          style={{
            width: "100%",
            padding: "15px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: "14px"
          }}
        />

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setComentario("");
              setResultado(false);
            }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={analizar}
          >
            🧠 Analizar comentario
          </button>
        </div>

      </section>

      {resultado && (
        <section className="kpi-grid">

          <div className="kpi-card">
            <h3>Sentimiento</h3>
            <div className="number">
              Positivo
            </div>
            <div className="description">
              El comentario presenta una opinión favorable
            </div>
          </div>

          <div className="kpi-card">
            <h3>Categoría</h3>
            <div className="number">
              Felicitación
            </div>
            <div className="description">
              Categoría detectada automáticamente
            </div>
          </div>

          <div className="kpi-card">
            <h3>Confianza</h3>
            <div className="number">
              94%
            </div>
            <div className="description">
              Nivel de confianza del análisis
            </div>
          </div>

          <div className="kpi-card">
            <h3>Palabras</h3>
            <div className="number">
              {comentario.trim().split(/\s+/).length}
            </div>
            <div className="description">
              Palabras detectadas
            </div>
          </div>

        </section>
      )}

      {resultado && (
        <section className="panel">

          <div className="panel-header">
            <div>
              <h3>Resultado del análisis</h3>
              <span>
                Información obtenida mediante procesamiento de lenguaje
              </span>
            </div>
          </div>

          <p style={{ marginBottom: "15px" }}>
            <strong>Texto analizado:</strong>
          </p>

          <p
            style={{
              background: "#f9fafb",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {comentario}
          </p>

          <p>
            <strong>Interpretación:</strong> El sistema ha
            identificado un sentimiento positivo y ha
            clasificado el comentario como una felicitación.
          </p>

        </section>
      )}

    </main>
  );
}

export default AnalizarComentario;