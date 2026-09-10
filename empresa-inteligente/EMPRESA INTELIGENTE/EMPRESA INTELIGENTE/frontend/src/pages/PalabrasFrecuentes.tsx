import { useState } from "react";

interface Palabra {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

function PalabrasFrecuentes() {
  const [texto, setTexto] = useState("");

  const palabras: Palabra[] = [
    { palabra: "servicio", frecuencia: 184, porcentaje: 92 },
    { palabra: "pedido", frecuencia: 156, porcentaje: 78 },
    { palabra: "cliente", frecuencia: 143, porcentaje: 71 },
    { palabra: "producto", frecuencia: 128, porcentaje: 64 },
    { palabra: "atención", frecuencia: 115, porcentaje: 57 },
    { palabra: "rápido", frecuencia: 98, porcentaje: 49 },
    { palabra: "excelente", frecuencia: 86, porcentaje: 43 },
    { palabra: "problema", frecuencia: 72, porcentaje: 36 },
    { palabra: "calidad", frecuencia: 65, porcentaje: 32 },
    { palabra: "información", frecuencia: 58, porcentaje: 29 }
  ];

  const analizarTexto = () => {
    if (!texto.trim()) {
      alert("Escribe algunos comentarios primero");
      return;
    }

    alert("Análisis realizado correctamente");
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Palabras frecuentes</h1>
          <p>
            Identificación de las palabras más utilizadas
            en los comentarios
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Analizar texto</h3>
            <span>
              Introduce comentarios para encontrar
              las palabras más utilizadas
            </span>
          </div>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí varios comentarios de clientes..."
          rows={6}
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
            onClick={() => setTexto("")}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={analizarTexto}
          >
            🧠 Analizar palabras
          </button>

        </div>

      </section>

      <section className="kpi-grid">

        <div className="kpi-card">
          <h3>Palabras analizadas</h3>

          <div className="number">
            1,248
          </div>

          <div className="description">
            Palabras procesadas
          </div>
        </div>

        <div className="kpi-card">
          <h3>Palabras únicas</h3>

          <div className="number">
            386
          </div>

          <div className="description">
            Palabras diferentes
          </div>
        </div>

        <div className="kpi-card">
          <h3>Comentarios</h3>

          <div className="number">
            245
          </div>

          <div className="description">
            Comentarios analizados
          </div>
        </div>

        <div className="kpi-card">
          <h3>Palabra principal</h3>

          <div className="number">
            servicio
          </div>

          <div className="description">
            Mayor frecuencia registrada
          </div>
        </div>

      </section>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Ranking de palabras</h3>
            <span>
              Palabras con mayor frecuencia
            </span>
          </div>
        </div>

        <div className="clientes-table">

          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Palabra</th>
                <th>Frecuencia</th>
                <th>Porcentaje</th>
              </tr>
            </thead>

            <tbody>

              {palabras.map((item, index) => (

                <tr key={item.palabra}>

                  <td>
                    #{index + 1}
                  </td>

                  <td>
                    <strong>
                      {item.palabra}
                    </strong>
                  </td>

                  <td>
                    {item.frecuencia}
                  </td>

                  <td>
                    {item.porcentaje}%
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}

export default PalabrasFrecuentes;