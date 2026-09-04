import { useState } from "react";

function Optimizacion() {
  const [costo, setCosto] = useState("");
  const [resultado, setResultado] = useState(false);

  const optimizar = () => {
    if (!costo.trim()) {
      alert("Ingresa el costo inicial");
      return;
    }

    setResultado(true);
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Optimización</h1>
          <p>
            Optimización de recursos y costos empresariales
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Optimizar costos</h3>
            <span>
              Ingresa el costo inicial del proceso
            </span>
          </div>
        </div>

        <div className="form-group">

          <label>Costo inicial</label>

          <input
            type="number"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            placeholder="Ejemplo: 10000"
          />

        </div>

        <div className="form-actions">

          <button
            type="button"
            onClick={() => {
              setCosto("");
              setResultado(false);
            }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={optimizar}
          >
            ⚙️ Ejecutar optimización
          </button>

        </div>

      </section>

      {resultado && (

        <>
          <section className="kpi-grid">

            <div className="kpi-card">
              <h3>Costo inicial</h3>
              <div className="number">
                S/ {costo}
              </div>
              <div className="description">
                Costo antes de optimizar
              </div>
            </div>

            <div className="kpi-card">
              <h3>Costo optimizado</h3>
              <div className="number">
                S/ 7,500
              </div>
              <div className="description">
                Costo después de optimizar
              </div>
            </div>

            <div className="kpi-card">
              <h3>Ahorro</h3>
              <div className="number">
                S/ 2,500
              </div>
              <div className="description">
                Reducción obtenida
              </div>
            </div>

            <div className="kpi-card">
              <h3>Optimización</h3>
              <div className="number">
                25%
              </div>
              <div className="description">
                Reducción del costo
              </div>
            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>
                <h3>Resultado de optimización</h3>

                <span>
                  Comparación antes y después
                </span>
              </div>

            </div>

            <div className="clientes-table">

              <table>

                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Antes</th>
                    <th>Después</th>
                    <th>Resultado</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>Costo</td>
                    <td>S/ {costo}</td>
                    <td>S/ 7,500</td>
                    <td>Optimizado</td>
                  </tr>

                  <tr>
                    <td>Ahorro</td>
                    <td>0%</td>
                    <td>25%</td>
                    <td>+25%</td>
                  </tr>

                  <tr>
                    <td>Eficiencia</td>
                    <td>75%</td>
                    <td>95%</td>
                    <td>+20%</td>
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

export default Optimizacion;