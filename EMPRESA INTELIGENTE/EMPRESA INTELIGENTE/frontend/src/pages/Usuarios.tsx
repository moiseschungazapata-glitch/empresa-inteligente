import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  created_at?: string;
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario para la BD
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Analista");

  // 1. Cargar datos de la BD al montar el componente (GET)
  const obtenerUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("usuarios").select("*").order("id", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // 2. Guardar un nuevo usuario en la BD (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    const { error } = await supabase.from("usuarios").insert([
      { nombre, email, rol, estado: "Activo" }
    ]);

    if (error) {
      alert("No se pudo registrar el usuario en la BD: " + error.message);
    } else {
      setNombre("");
      setEmail("");
      obtenerUsuarios(); // Recarga la lista de usuarios
      alert("Usuario guardado exitosamente en la base de datos");
    }
  };

  // 3. Eliminar usuario de la BD (DELETE)
  const eliminarUsuario = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro de la base de datos?")) return;

    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar el registro: " + error.message);
    } else {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  if (loading) return <p className="loading">Cargando registros de la base de datos...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Conectado a la tabla `usuarios` de Supabase</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Registrar nuevo usuario</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="Administrador">Administrador</option>
            <option value="Analista">Analista</option>
            <option value="Supervisor">Supervisor</option>
          </select>
          <button type="submit" className="btn-primary">Guardar en BD</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Usuarios Registrados ({usuarios.length})</h3>
        </div>
        <div className="clientes-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>
                    <span className={`badge ${u.estado?.toLowerCase()}`}>{u.estado}</span>
                  </td>
                  <td>
                    <button onClick={() => eliminarUsuario(u.id)} className="btn-danger">
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

export default Usuarios;