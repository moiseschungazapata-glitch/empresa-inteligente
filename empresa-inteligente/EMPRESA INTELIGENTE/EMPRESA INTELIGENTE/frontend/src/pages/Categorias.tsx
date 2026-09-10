import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: string;
}

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>("");
  
  // Estados para el formulario de agregar
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");

  // 1. Cargar datos de Supabase al iniciar
  const obtenerCategorias = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) {
      console.error("Error al cargar categorías:", error.message);
    } else {
      setCategorias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  // 2. Función para Agregar un registro
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const { error } = await supabase
      .from("categorias")
      .insert([{ nombre, descripcion, estado: "Activa" }]);

    if (error) {
      alert("Error al registrar: " + error.message);
    } else {
      setNombre("");
      setDescripcion("");
      obtenerCategorias(); // Recarga la tabla automáticamente
    }
  };

  // 3. Función para Eliminar un registro
  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro empresarial?")) return;

    const { error } = await supabase.from("categorias").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      setCategorias(categorias.filter((cat) => cat.id !== id));
    }
  };

  // 4. Filtrado en tiempo real
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Gestión de Categorías</h1>
          <p>Módulo conectado a Supabase para control empresarial</p>
        </div>
      </div>

      {/* Sección de Filtro y Formulario */}
      <section className="panel">
        <h3>Agregar Nueva Categoría</h3>
        <form onSubmit={handleAgregar} className="form-grid" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px" }}>
            Agregar
          </button>
        </form>
      </section>

      {/* Tabla y Buscador */}
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Listado de Categorías ({categoriasFiltradas.length})</h3>
          <input
            type="text"
            placeholder="Filtrar categorías..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "250px" }}
          />
        </div>

        {loading ? (
          <p>Cargando datos de la base de datos...</p>
        ) : (
          <div className="clientes-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((cat) => (
                    <tr key={cat.id}>
                      <td>#{cat.id}</td>
                      <td><strong>{cat.nombre}</strong></td>
                      <td>{cat.descripcion || "Sin descripción"}</td>
                      <td>
                        <button
                          onClick={() => handleEliminar(cat.id)}
                          style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                      No se encontraron registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Categorias;