import { useState } from "react";

function Clasificacion() {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState(false);

  const clasificar = () => {
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
          <h1>Clasificación</h1>

          <p>
            Clasificación automática de comentarios mediante NLP
          </p>
        </div>

      </div>

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>Clasificar comentario</h3>

            <span>
              Introduce un comentario para determinar su categoría
            </span>
          </div>

        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Ejemplo: Tengo un problema con mi pedido..."
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
            onClick={clasificar}
          >
            🧠 Clasificar comentario
          </button>

        </div>

      </section>

      {resultado && (

        <>
          <section className="kpi-grid">

            <div className="kpi-card">

              <h3>Categoría detectada</h3>

              <div className="number">
                Soporte
              </div>

              <div className="description">
                Categoría identificada por el sistema
              </div>

            </div>

            <div className="kpi-card">

              <h3>Confianza</h3>

              <div className="number">
                92%
              </div>

              <div className="description">
                Nivel de confianza de la clasificación
              </div>

            </div>

            <div className="kpi-card">

              <h3>Palabras analizadas</h3>

              <div className="number">
                {comentario.trim().split(/\s+/).length}
              </div>

              <div className="description">
                Palabras procesadas
              </div>

            </div>

            <div className="kpi-card">

              <h3>Estado</h3>

              <div className="number">
                Clasificado
              </div>

              <div className="description">
                Análisis completado correctamente
              </div>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>
                <h3>Resultado</h3>

                <span>
                  Resultado de la clasificación
                </span>
              </div>

            </div>

            <p>
              <strong>Comentario:</strong>
            </p>

            <p
              style={{
                background: "#f9fafb",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "10px",
                marginBottom: "20px"
              }}
            >
              {comentario}
            </p>

            <p>
              <strong>Categoría:</strong> Soporte
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>Confianza:</strong> 92%
            </p>

          </section>
        </>

      )}

    </main>
  );
}

export default Clasificacion;