import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import Modal from "../components/Modal";
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
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [registroFacial, setRegistroFacial] = useState<{ nombre: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

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

      setRegistroFacial({ nombre: nombre.trim(), email: email.trim().toLowerCase() });

      // Limpiar formulario
      setNombre("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRol("Analista");

      await obtenerUsuarios();


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

    setEliminandoId(id);

    try {
      const { data, error } = await supabase.functions.invoke(
        "eliminar-usuario",
        { body: { id } }
      );

      if (error) {
        let mensaje = error.message;

        try {
          const body = await error.context?.json();
          if (body?.error) mensaje = body.error;
        } catch {
          // Conservamos el mensaje original si la respuesta no contiene JSON.
        }

        alert("Error al eliminar: " + mensaje);
        return;
      }

      if (!data?.success) {
        alert(data?.error || "No se pudo eliminar el usuario.");
        return;
      }

      await obtenerUsuarios();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al eliminar el usuario.");
    } finally {
      setEliminandoId(null);
    }
  };

  const visibles = usuarios.filter(u => (u.nombre + " " + u.email + " " + u.rol).toLowerCase().includes(search.toLowerCase()));
  const closeForm = () => { setFormOpen(false); setRegistroFacial(null); setPassword(""); setConfirmPassword(""); };
  return <main className="dashboard users-page">
    <header className="users-heading"><div><span className="eyebrow">CONFIGURACIÓN / EQUIPO</span><h1>Gestión de usuarios</h1><p>Administra tu equipo y sus accesos a la plataforma.</p></div>
      <button className="btn-primary" onClick={() => setFormOpen(true)}><span aria-hidden="true">＋</span> Nuevo usuario</button>
    </header>
    <section className="panel users-list">
      <div className="users-toolbar"><div><h2>Usuarios del equipo <span className="count-badge">{usuarios.length}</span></h2><p>Personas registradas en tu organización</p></div>
        <label className="user-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar usuarios" placeholder="Buscar por nombre, correo o rol…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      </div>
      {error && <p role="alert" className="inline-error">No se pudo cargar la lista: {error} <button className="btn-secondary" onClick={obtenerUsuarios}>Reintentar</button></p>}
      <div className="users-table-wrap"><table><thead><tr><th>Usuario</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th className="align-right">Acciones</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={5} className="table-empty">Cargando usuarios…</td></tr> : visibles.length === 0 ? <tr><td colSpan={5} className="table-empty">{search ? "No hay usuarios que coincidan con tu búsqueda." : "Aún no hay usuarios registrados."}</td></tr> : visibles.map(u => <tr key={u.id}>
          <td><div className="table-person"><span className="table-avatar">{u.nombre.split(/\s+/).slice(0, 2).map(n => n[0]).join("").toUpperCase()}</span><div><strong>{u.nombre}</strong><small>ID {String(u.id).padStart(3, "0")}</small></div></div></td>
          <td>{u.email}</td><td><span className="role-badge">{u.rol}</span></td><td><span className={"status-badge " + (u.activo ? "is-active" : "")}><span />{u.activo ? "Activo" : "Inactivo"}</span></td>
          <td className="align-right"><button className="btn-danger" disabled={eliminandoId !== null} aria-label={"Eliminar a " + u.nombre} onClick={() => eliminarUsuario(u.id)}>{eliminandoId === u.id ? "Eliminando…" : "Eliminar"}</button></td>
        </tr>)}</tbody></table></div>
      <footer className="users-list-footer">{visibles.length} de {usuarios.length} usuarios</footer>
    </section>
    {formOpen && <Modal title={registroFacial ? "Registro facial" : "Nuevo trabajador"} busy={creando || registroFacial !== null} onClose={closeForm}>
      {registroFacial ? <RegistroRostro {...registroFacial} onClose={closeForm} /> : <form onSubmit={handleSubmit}>
        <p className="form-intro">Completa los datos del trabajador y selecciona su función dentro del equipo.</p>
        <fieldset className="user-form-fields" disabled={creando}>
          <label className="field-label full-width">Nombre completo<input required value={nombre} autoComplete="name" placeholder="Ej. Ana García López" onChange={e => setNombre(e.target.value)} /></label>
          <label className="field-label full-width">Correo electrónico<input required type="email" autoComplete="email" value={email} placeholder="nombre@empresa.com" onChange={e => setEmail(e.target.value)} /></label>
          <label className="field-label">Contraseña<input required minLength={6} type="password" autoComplete="new-password" value={password} placeholder="Mínimo 6 caracteres" onChange={e => setPassword(e.target.value)} /></label>
          <label className="field-label">Confirmar contraseña<input required minLength={6} type="password" autoComplete="new-password" value={confirmPassword} placeholder="Repite la contraseña" onChange={e => setConfirmPassword(e.target.value)} /></label>
          <label className="field-label full-width">Rol del trabajador<select aria-describedby="role-description" value={rol} onChange={e => setRol(e.target.value)}><option>Analista</option><option>Administrador</option><option>Supervisor</option></select><span id="role-description" className="role-description">{rol === "Administrador" ? "Responsable de la administración y configuración del sistema." : rol === "Supervisor" ? "Responsable de supervisar al equipo y revisar sus resultados." : "Encargado de analizar comentarios, datos y reportes."} El rol describe su función; el estado indica si la cuenta está activa.</span></label>
          <div className="enrollment-note full-width"><strong>Registro facial</strong><p>Para registrar el rostro ahora, el trabajador debe estar presente y tener acceso a su correo y a la cámara.</p></div>
        </fieldset>
        <div className="modal-actions"><button type="button" className="btn-secondary" disabled={creando} onClick={closeForm}>Cancelar</button><button type="submit" name="accion" value="rostro" className="btn-primary" disabled={creando}>{creando ? "Creando…" : "Crear y registrar rostro"}</button></div>
      </form>}
    </Modal>}
  </main>;
}

export default Usuarios;
