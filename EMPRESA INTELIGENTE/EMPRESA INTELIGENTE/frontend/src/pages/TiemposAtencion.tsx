import { useState } from "react";

interface TiempoAtencion {
  id: number;
  cliente: string;
  solicitud: string;
  operador: string;
  respuesta: number;
  resolucion: number;
  estado: string;
  fecha: string;
}

function TiemposAtencion() {
  const [registros, setRegistros] = useState<TiempoAtencion[]>([
    {
      id: 1,
      cliente: "Juan Pérez",
      solicitud: "Problema con pedido",
      operador: "Carlos",
      respuesta: 5,
      resolucion: 25,
      estado: "Resuelto",
      fecha: "03/09/2026"
    },
    {
      id: 2,
      cliente: "María López",
      solicitud: "Consulta sobre producto",
      operador: "Ana",
      respuesta: 8,
      resolucion: 40,
      estado: "En proceso",
      fecha: "03/09/2026"
    },
    {
      id: 3,
      cliente: "Carlos Ruiz",
      solicitud: "Solicitud de información",
      operador: "Luis",
      respuesta: 3,
      resolucion: 15,
      estado: "Resuelto",
      fecha: "02/09/2026"
    },
    {
      id: 4,
      cliente: "Ana Torres",
      solicitud: "Reclamo por servicio",
      operador: "Carlos",
      respuesta: 10,
      resolucion: 55,
      estado: "Pendiente",
      fecha: "02/09/2026"
    }
  ]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const promedioRespuesta =
    registros.reduce(
      (total, registro) =>
        total + registro.respuesta,
      0
    ) / registros.length;

  const promedioResolucion =
    registros.reduce(
      (total, registro) =>
        total + registro.resolucion,
      0
    ) / registros.length;

  const resueltos = registros.filter(
    registro => registro.estado === "Resuelto"
  ).length;

  const agregarRegistro = () => {
    const nuevo: TiempoAtencion = {
      id: registros.length + 1,
      cliente: "Nuevo cliente",
      solicitud: "Nueva solicitud",
      operador: "Sin asignar",
      respuesta: 0,
      resolucion: 0,
      estado: "Pendiente",
      fecha: "03/09/2026"
    };

    setRegistros([...registros, nuevo]);
    setMostrarFormulario(false);
  };

  const eliminarRegistro = (id: number) => {
    if (!confirm("¿Eliminar este registro?")) return;

    setRegistros(
      registros.filter(
        registro => registro.id !== id
      )
    );
  };

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Tiempos de atención</h1>
          <p>
            Control y análisis del tiempo de atención
            a los clientes
          </p>
        </div>

        <button
          className="new-client-button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo registro
        </button>
      </div>

      <section className="kpi-grid">

        <div className="kpi-card">
          <h3>Total registros</h3>

          <div className="number">
            {registros.length}
          </div>

          <div className="description">
            Atenciones registradas
          </div>
        </div>

        <div className="kpi-card">
          <h3>Tiempo promedio respuesta</h3>

          <div className="number">
            {promedioRespuesta.toFixed(1)} min
          </div>

          <div className="description">
            Tiempo hasta la primera respuesta
          </div>
        </div>

        <div className="kpi-card">
          <h3>Tiempo promedio resolución</h3>

          <div className="number">
            {promedioResolucion.toFixed(1)} min
          </div>

          <div className="description">
            Tiempo promedio para resolver
          </div>
        </div>

        <div className="kpi-card">
          <h3>Casos resueltos</h3>

          <div className="number">
            {resueltos}
          </div>

          <div className="description">
            Solicitudes solucionadas
          </div>
        </div>

      </section>

      {mostrarFormulario && (
        <section className="panel">

          <div className="panel-header">
            <div>
              <h3>Nuevo registro</h3>

              <span>
                Registrar tiempo de atención
              </span>
            </div>
          </div>

          <div className="form-actions">

            <button
              type="button"
              onClick={() =>
                setMostrarFormulario(false)
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={agregarRegistro}
            >
              Crear registro
            </button>

          </div>

        </section>
      )}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Registro de tiempos
            </h3>

            <span>
              Seguimiento del rendimiento de atención
            </span>
          </div>

        </div>

        <div className="clientes-table">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Solicitud</th>
                <th>Operador</th>
                <th>Respuesta</th>
                <th>Resolución</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>

            </thead>

            <tbody>

              {registros.map((registro) => (

                <tr key={registro.id}>

                  <td>
                    #{registro.id}
                  </td>

                  <td>
                    <strong>
                      {registro.cliente}
                    </strong>
                  </td>

                  <td>
                    {registro.solicitud}
                  </td>

                  <td>
                    {registro.operador}
                  </td>

                  <td>
                    {registro.respuesta} min
                  </td>

                  <td>
                    {registro.resolucion} min
                  </td>

                  <td>
                    {registro.estado}
                  </td>

                  <td>
                    {registro.fecha}
                  </td>

                  <td>

                    <button
                      className="action-delete"
                      onClick={() =>
                        eliminarRegistro(
                          registro.id
                        )
                      }
                    >
                      Eliminar
                    </button>

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

export default TiemposAtencion;