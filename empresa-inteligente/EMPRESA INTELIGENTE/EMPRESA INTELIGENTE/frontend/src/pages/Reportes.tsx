import { useState } from "react";

function Reportes() {
  const [tipo, setTipo] = useState("Atención");
  const [fechaInicio, setFechaInicio] = useState("2026-09-01");
  const [fechaFin, setFechaFin] = useState("2026-09-03");
  const [generado, setGenerado] = useState(false);

  const generarReporte = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona las fechas");
      return;
    }

    setGenerado(true);
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Reportes</h1>
          <p>
            Generación y análisis de reportes empresariales
          </p>
        </div>
      </div>

      {/* CONFIGURACIÓN DEL REPORTE */}

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Generar reporte</h3>
            <span>
              Selecciona el tipo y periodo del reporte
            </span>
          </div>
        </div>

        <div className="form-group">

          <label>Tipo de reporte</label>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{
              padding: "11px 13px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              outline: "none"
            }}
          >
            <option value="Atención">
              Reporte de Atención
            </option>

            <option value="NLP">
              Reporte de NLP
            </option>

            <option value="Estadísticas">
              Reporte de Estadísticas
            </option>
          </select>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "20px"
          }}
        >

          <div className="form-group">

            <label>Fecha inicial</label>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>
                setFechaInicio(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Fecha final</label>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) =>
                setFechaFin(e.target.value)
              }
            />

          </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            onClick={() => setGenerado(false)}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={generarReporte}
          >
            📊 Generar reporte
          </button>

        </div>

      </section>

      {/* RESULTADOS */}

      {generado && (

        <>

          <section className="kpi-grid">

            <div className="kpi-card">

              <h3>Registros</h3>

              <div className="number">
                1,248
              </div>

              <div className="description">
                Registros analizados
              </div>

            </div>

            <div className="kpi-card">

              <h3>Promedio</h3>

              <div className="number">
                16.4 min
              </div>

              <div className="description">
                Tiempo promedio
              </div>

            </div>

            <div className="kpi-card">

              <h3>Eficiencia</h3>

              <div className="number">
                94%
              </div>

              <div className="description">
                Nivel de eficiencia
              </div>

            </div>

            <div className="kpi-card">

              <h3>Estado</h3>

              <div className="number">
                Listo
              </div>

              <div className="description">
                Reporte generado
              </div>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>
                <h3>
                  Reporte de {tipo}
                </h3>

                <span>
                  Periodo: {fechaInicio} → {fechaFin}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px"
                }}
              >

                <button
                  className="new-client-button"
                  onClick={() =>
                    alert("Reporte exportado correctamente")
                  }
                >
                  📥 Exportar
                </button>

                <button
                  className="new-client-button"
                  onClick={() =>
                    window.print()
                  }
                >
                  🖨️ Imprimir
                </button>

              </div>

            </div>

            <div className="clientes-table">

              <table>

                <thead>

                  <tr>
                    <th>Indicador</th>
                    <th>Resultado</th>
                    <th>Estado</th>
                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td>Total de registros</td>
                    <td>1,248</td>
                    <td>Correcto</td>
                  </tr>

                  <tr>
                    <td>Tiempo promedio</td>
                    <td>16.4 min</td>
                    <td>Correcto</td>
                  </tr>

                  <tr>
                    <td>Comentarios positivos</td>
                    <td>68%</td>
                    <td>Correcto</td>
                  </tr>

                  <tr>
                    <td>Comentarios negativos</td>
                    <td>18%</td>
                    <td>Revisar</td>
                  </tr>

                  <tr>
                    <td>Comentarios neutros</td>
                    <td>14%</td>
                    <td>Correcto</td>
                  </tr>

                  <tr>
                    <td>Precisión NLP</td>
                    <td>94%</td>
                    <td>Correcto</td>
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

export default Reportes;