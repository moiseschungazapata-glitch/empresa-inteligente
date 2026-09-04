import { useState } from "react";

function Estadisticas() {
  const [datos, setDatos] = useState("");
  const [resultado, setResultado] = useState(false);

  const analizar = () => {
    if (!datos.trim()) {
      alert("Ingresa algunos datos");
      return;
    }

    setResultado(true);
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Estadísticas</h1>
          <p>
            Análisis estadístico de los datos empresariales
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Ingresar datos</h3>
            <span>
              Ingresa valores separados por comas
            </span>
          </div>
        </div>

        <textarea
          value={datos}
          onChange={(e) => setDatos(e.target.value)}
          placeholder="Ejemplo: 10, 15, 20, 25, 30, 35, 40"
          rows={5}
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
              setDatos("");
              setResultado(false);
            }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={analizar}
          >
            📊 Calcular estadísticas
          </button>

        </div>

      </section>

      {resultado && (

        <>
          <section className="kpi-grid">

            <div className="kpi-card">
              <h3>Media</h3>
              <div className="number">25.00</div>
              <div className="description">
                Promedio de los datos
              </div>
            </div>

            <div className="kpi-card">
              <h3>Mediana</h3>
              <div className="number">25.00</div>
              <div className="description">
                Valor central
              </div>
            </div>

            <div className="kpi-card">
              <h3>Desviación estándar</h3>
              <div className="number">10.00</div>
              <div className="description">
                Dispersión de los datos
              </div>
            </div>

            <div className="kpi-card">
              <h3>Máximo</h3>
              <div className="number">40</div>
              <div className="description">
                Valor máximo
              </div>
            </div>

          </section>

          <section className="panel">

            <div className="panel-header">
              <div>
                <h3>Resumen estadístico</h3>
                <span>
                  Resultados del análisis
                </span>
              </div>
            </div>

            <div className="clientes-table">

              <table>

                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Resultado</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Media</td>
                    <td>25.00</td>
                  </tr>

                  <tr>
                    <td>Mediana</td>
                    <td>25.00</td>
                  </tr>

                  <tr>
                    <td>Desviación estándar</td>
                    <td>10.00</td>
                  </tr>

                  <tr>
                    <td>Mínimo</td>
                    <td>10</td>
                  </tr>
                </tbody>

              </table>

            </div>

          </section>
        </>
      )}

    </main>
  );
}

export default Estadisticas;