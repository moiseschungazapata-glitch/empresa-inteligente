import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface RegistroAuditoria {
  id: number;
  usuario: string;
  accion: string;
  tabla: string;
  registro: string;
  detalles: string;
  fecha: string;
}

function Auditoria() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtro, setFiltro] = useState("Todas");

  const obtenerAuditoria = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("auditoria")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error al cargar auditoría:", error.message);
    } else {
      setRegistros(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerAuditoria();
  }, []);

  const eliminarRegistro = async (id: number) => {
    if (!window.confirm("¿Eliminar este registro de auditoría?")) return;

    const { error } = await supabase.from("auditoria").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      setRegistros(registros.filter(registro => registro.id !== id));
    }
  };

  const registrosFiltrados =
    filtro === "Todas"
      ? registros
      : registros.filter(registro => registro.accion === filtro);

  const creaciones = registros.filter(r => r.accion === "CREAR").length;
  const actualizaciones = registros.filter(r => r.accion === "ACTUALIZAR").length;
  const eliminaciones = registros.filter(r => r.accion === "ELIMINAR").length;

  if (loading) return <p className="loading">Cargando registros de auditoría...</p>;

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Auditoría</h1>
          <p>Registro y seguimiento de las acciones realizadas en el sistema (Supabase)</p>
        </div>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card">
          <h3>Total acciones</h3>
          <div className="number">{registros.length}</div>
          <div className="description">Acciones registradas</div>
        </div>

        <div className="kpi-card">
          <h3>Creaciones</h3>
          <div className="number">{creaciones}</div>
          <div className="description">Registros creados</div>
        </div>

        <div className="kpi-card">
          <h3>Actualizaciones</h3>
          <div className="number">{actualizaciones}</div>
          <div className="description">Registros modificados</div>
        </div>

        <div className="kpi-card">
          <h3>Eliminaciones</h3>
          <div className="number">{eliminaciones}</div>
          <div className="description">Registros eliminados</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Registro de actividades</h3>
            <span>Historial de acciones realizadas por los usuarios</span>
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              background: "white"
            }}
          >
            <option value="Todas">Todas las acciones</option>
            <option value="CREAR">Crear</option>
            <option value="ACTUALIZAR">Actualizar</option>
            <option value="ELIMINAR">Eliminar</option>
            <option value="LOGIN">Login</option>
            <option value="ANALIZAR">Analizar</option>
          </select>
        </div>

        <div className="clientes-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Tabla</th>
                <th>Registro</th>
                <th>Detalles</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((registro) => (
                  <tr key={registro.id}>
                    <td>#{registro.id}</td>
                    <td><strong>{registro.usuario}</strong></td>
                    <td>{registro.accion}</td>
                    <td>{registro.tabla}</td>
                    <td>{registro.registro}</td>
                    <td>{registro.detalles}</td>
                    <td>{registro.fecha}</td>
                    <td>
                      <button
                        className="action-delete"
                        onClick={() => eliminarRegistro(registro.id)}
                        style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                    No hay registros de auditoría disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Auditoria;