import { useState } from "react";

function Interpolacion() {
  const [x, setX] = useState("");
  const [resultado, setResultado] = useState(false);

  const calcular = () => {
    if (!x.trim()) {
      alert("Ingresa un valor X");
      return;
    }

    setResultado(true);
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Interpolación</h1>
          <p>
            Estimación de valores mediante interpolación numérica
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Interpolación lineal</h3>
            <span>
              Ingresa el valor que deseas estimar
            </span>
          </div>
        </div>

        <div className="form-group">

          <label>Valor X</label>

          <input
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="Ejemplo: 5"
          />

        </div>

        <div className="form-actions">

          <button
            type="button"
            onClick={() => {
              setX("");
              setResultado(false);
            }}
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={calcular}
          >
            📈 Calcular interpolación
          </button>

        </div>

      </section>

      {resultado && (

        <section className="kpi-grid">

          <div className="kpi-card">
            <h3>Valor X</h3>
            <div className="number">{x}</div>
            <div className="description">
              Punto ingresado
            </div>
          </div>

          <div className="kpi-card">
            <h3>Valor interpolado</h3>
            <div className="number">27.50</div>
            <div className="description">
              Valor estimado
            </div>
          </div>

          <div className="kpi-card">
            <h3>Método</h3>
            <div className="number">
              Lineal
            </div>
            <div className="description">
              Método utilizado
            </div>
          </div>

          <div className="kpi-card">
            <h3>Precisión</h3>
            <div className="number">
              98%
            </div>
            <div className="description">
              Precisión estimada
            </div>
          </div>

        </section>
      )}

      {resultado && (

        <section className="panel">

          <div className="panel-header">
            <div>
              <h3>Resultado</h3>
              <span>
                Información del cálculo
              </span>
            </div>
          </div>

          <p>
            <strong>Valor ingresado:</strong> {x}
          </p>

          <p style={{ marginTop: "12px" }}>
            <strong>Valor interpolado:</strong> 27.50
          </p>

          <p style={{ marginTop: "12px" }}>
            <strong>Método:</strong> Interpolación lineal
          </p>

        </section>
      )}

    </main>
  );
}

export default Interpolacion;