import { useState } from "react";

interface Solicitud {
  id: number;
  cliente: string;
  asunto: string;
  canal: string;
  prioridad: string;
  estado: string;
  responsable: string;
  fecha: string;
}

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    {
      id: 1,
      cliente: "Juan Pérez",
      asunto: "Problema con pedido",
      canal: "WhatsApp",
      prioridad: "Alta",
      estado: "Pendiente",
      responsable: "Carlos",
      fecha: "03/09/2026"
    },
    {
      id: 2,
      cliente: "María López",
      asunto: "Consulta sobre producto",
      canal: "Web",
      prioridad: "Media",
      estado: "En proceso",
      responsable: "Ana",
      fecha: "03/09/2026"
    },
    {
      id: 3,
      cliente: "Carlos Ruiz",
      asunto: "Solicitud de información",
      canal: "Email",
      prioridad: "Baja",
      estado: "Resuelto",
      responsable: "Luis",
      fecha: "02/09/2026"
    }
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const nuevaSolicitud = () => {
    const nueva: Solicitud = {
      id: solicitudes.length + 1,
      cliente: "Nuevo cliente",
      asunto: "Nueva solicitud",
      canal: "Web",
      prioridad: "Media",
      estado: "Pendiente",
      responsable: "Sin asignar",
      fecha: "03/09/2026"
    };

    setSolicitudes([...solicitudes, nueva]);
    setMostrarFormulario(false);
  };

  const eliminarSolicitud = (id: number) => {
    if (!confirm("¿Eliminar esta solicitud?")) return;

    setSolicitudes(
      solicitudes.filter(
        solicitud => solicitud.id !== id
      )
    );
  };

  const pendientes = solicitudes.filter(
    s => s.estado === "Pendiente"
  ).length;

  const enProceso = solicitudes.filter(
    s => s.estado === "En proceso"
  ).length;

  const resueltas = solicitudes.filter(
    s => s.estado === "Resuelto"
  ).length;

  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Solicitudes</h1>
          <p>
            Gestión y seguimiento de solicitudes de clientes
          </p>
        </div>

        <button
          className="new-client-button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nueva solicitud
        </button>
      </div>

      <section className="kpi-grid">

        <div className="kpi-card">
          <h3>Total solicitudes</h3>
          <div className="number">
            {solicitudes.length}
          </div>
          <div className="description">
            Solicitudes registradas
          </div>
        </div>

        <div className="kpi-card">
          <h3>Pendientes</h3>
          <div className="number">
            {pendientes}
          </div>
          <div className="description">
            Requieren atención
          </div>
        </div>

        <div className="kpi-card">
          <h3>En proceso</h3>
          <div className="number">
            {enProceso}
          </div>
          <div className="description">
            Solicitudes en atención
          </div>
        </div>

        <div className="kpi-card">
          <h3>Resueltas</h3>
          <div className="number">
            {resueltas}
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
              <h3>Nueva solicitud</h3>
              <span>
                Registrar una nueva solicitud
              </span>
            </div>
          </div>

          <div className="form-actions">

            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={nuevaSolicitud}
            >
              Crear solicitud
            </button>

          </div>

        </section>
      )}

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Lista de solicitudes</h3>
            <span>
              Seguimiento de solicitudes de clientes
            </span>
          </div>
        </div>

        <div className="clientes-table">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Asunto</th>
                <th>Canal</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {solicitudes.map((solicitud) => (

                <tr key={solicitud.id}>

                  <td>
                    #{solicitud.id}
                  </td>

                  <td>
                    <strong>
                      {solicitud.cliente}
                    </strong>
                  </td>

                  <td>
                    {solicitud.asunto}
                  </td>

                  <td>
                    {solicitud.canal}
                  </td>

                  <td>
                    {solicitud.prioridad}
                  </td>

                  <td>
                    {solicitud.estado}
                  </td>

                  <td>
                    {solicitud.responsable}
                  </td>

                  <td>
                    {solicitud.fecha}
                  </td>

                  <td>

                    <button
                      className="action-delete"
                      onClick={() =>
                        eliminarSolicitud(solicitud.id)
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

export default Solicitudes;