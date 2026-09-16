import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import RegistroRostro from "../components/auth/RegistroRostro";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at?: string;
  auth_user_id?: string | null;
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [registroFacial, setRegistroFacial] = useState<{ nombre: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState("Analista");

  // ==============================
  // OBTENER USUARIOS
  // ==============================
  const obtenerUsuarios = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
  console.log("USUARIOS RECIBIDOS:", data);
  setUsuarios(data || []);
}

    setLoading(false);
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // ==============================
  // CREAR USUARIO
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creando || registroFacial) return;
    const registrarRostro = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "rostro";

    if (
      !nombre.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !rol
    ) {
      alert("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setCreando(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "crear-usuario",
        {
          body: {
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            password,
            rol,
          },
        }
      );

      if (error) {
        let mensaje = error.message;

        try {
          const body = await error.context?.json();

          if (body?.error) {
            mensaje = body.error;
          }
        } catch {
          // Si no se puede leer el error, usamos el mensaje original
        }

        alert("No se pudo crear el usuario: " + mensaje);
        return;
      }

      if (!data?.success) {
        alert(data?.error || "No se pudo crear el usuario.");
        return;
      }

      if (registrarRostro) {
        setRegistroFacial({ nombre: nombre.trim(), email: email.trim().toLowerCase() });
      }

      // Limpiar formulario
      setNombre("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRol("Analista");

      await obtenerUsuarios();

      if (!registrarRostro) alert("Usuario creado correctamente.");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al crear el usuario.");
    } finally {
      setCreando(false);
    }
  };

  // ==============================
  // ELIMINAR REGISTRO
  // ==============================
  const eliminarUsuario = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este registro?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }

    setUsuarios((actuales) =>
      actuales.filter((usuario) => usuario.id !== id)
    );
  };

  // ==============================
  // ESTADOS DE CARGA
  // ==============================
  if (loading) {
    return (
      <main className="dashboard">
        <p className="loading">
          Cargando usuarios...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <p className="error">
          Error: {error}
        </p>
      </main>
    );
  }

  // ==============================
  // INTERFAZ
  // ==============================
  return (
    <main className="dashboard">

      <div className="topbar">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>
            Administra los trabajadores que pueden ingresar al sistema.
          </p>
        </div>
      </div>

      {/* ==============================
          FORMULARIO
      ============================== */}

      <section className="panel">

        <div className="panel-header">
          <h3>Registrar nuevo trabajador</h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          <fieldset disabled={creando || registroFacial !== null} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="Administrador">
              Administrador
            </option>

            <option value="Analista">
              Analista
            </option>

            <option value="Supervisor">
              Supervisor
            </option>
          </select>

          <button
            type="submit"
            className="btn-primary"
            disabled={creando}
          >
            {creando
              ? "Creando usuario..."
              : "Crear usuario"}
          </button>

          <button type="submit" name="accion" value="rostro" className="btn-primary" disabled={creando}>
            Crear usuario y registrar rostro
          </button>
          <p>Para registrar el rostro, el trabajador debe estar presente y tener acceso a su correo.</p>
          </fieldset>

        </form>

      </section>

      {registroFacial && <RegistroRostro {...registroFacial} onClose={() => setRegistroFacial(null)} />}

      {/* ==============================
          TABLA
      ============================== */}

      <section className="panel">

        <div className="panel-header">
          <h3>
            Usuarios registrados ({usuarios.length})
          </h3>
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

              {usuarios.length === 0 ? (

                <tr>
                  <td colSpan={6}>
                    No hay usuarios registrados.
                  </td>
                </tr>

              ) : (

                usuarios.map((usuario) => (

                  <tr key={usuario.id}>

                    <td>
                      {usuario.id}
                    </td>

                    <td>
                      {usuario.nombre}
                    </td>

                    <td>
                      {usuario.email}
                    </td>

                    <td>
                      {usuario.rol}
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          usuario.activo
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {usuario.activo
                          ? "Activo"
                          : "Inactivo"}
                      </span>

                    </td>

                    <td>

                      <button
                        onClick={() =>
                          eliminarUsuario(usuario.id)
                        }
                        className="btn-danger"
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}

export default Usuarios;

