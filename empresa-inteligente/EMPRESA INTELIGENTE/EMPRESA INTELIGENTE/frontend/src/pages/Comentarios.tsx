import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export interface Comentario {
  id: number;
  cliente: string;
  contenido: string;
  canal: string;
  categoria: string;
  estado: string;
}

function Comentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoContenido, setNuevoContenido] = useState("");

  // 1. Cargar datos iniciales y configurar Tiempo Real
  useEffect(() => {
    fetchComentarios();

    const channel = supabase
      .channel('comentarios-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comentarios' },
        () => {
          fetchComentarios(); // Recarga automática instantánea
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComentarios = async () => {
    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar comentarios:", error.message);
    } else if (data) {
      setComentarios(data);
    }
  };

  const agregarComentario = async () => {
    if (!nuevoContenido.trim()) {
      alert("El comentario no puede estar vacío.");
      return;
    }

    const { error } = await supabase.from("comentarios").insert([
      {
        cliente: "Cliente Web",
        contenido: nuevoContenido,
        canal: "Web",
        categoria: "Consulta",
        estado: "Pendiente"
      }
    ]);

    if (error) {
      console.error("Error al guardar comentario:", error.message);
      alert("Hubo un error al guardar el comentario.");
    } else {
      setNuevoContenido("");
      setMostrarFormulario(false);
    }
  };

  const eliminarComentario = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este comentario?")) return;

    const { error } = await supabase.from("comentarios").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      setComentarios(comentarios.filter((c) => c.id !== id));
    }
  };

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Comentarios</h1>
          <p>Gestión y análisis de comentarios de clientes</p>
        </div>
        <button
          className="new-client-button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo comentario
        </button>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card">
          <h3>Total comentarios</h3>
          <div className="number">{comentarios.length}</div>
          <div className="description">Comentarios registrados</div>
        </div>

        <div className="kpi-card">
          <h3>Pendientes</h3>
          <div className="number">
            {comentarios.filter((c) => c.estado === "Pendiente").length}
          </div>
          <div className="description">Pendientes de análisis</div>
        </div>
      </section>

      {mostrarFormulario && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Nuevo comentario</h3>
              <span>Registrar comentario</span>
            </div>
          </div>

          <textarea
            placeholder="Escribe el comentario..."
            rows={5}
            value={nuevoContenido}
            onChange={(e) => setNuevoContenido(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              resize: "vertical"
            }}
          />

          <div className="form-actions" style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={agregarComentario}
            >
              Guardar comentario
            </button>
          </div>
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Lista de comentarios</h3>
            <span>Comentarios registrados en el sistema</span>
          </div>
        </div>

        <div className="clientes-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Comentario</th>
                <th>Canal</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.map((comentario) => (
                <tr key={comentario.id}>
                  <td>#{comentario.id}</td>
                  <td>
                    <strong>{comentario.cliente}</strong>
                  </td>
                  <td>{comentario.contenido}</td>
                  <td>{comentario.canal}</td>
                  <td>{comentario.categoria}</td>
                  <td>{comentario.estado}</td>
                  <td>
                    <button
                      onClick={() => eliminarComentario(comentario.id)}
                      style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
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

export default Comentarios;