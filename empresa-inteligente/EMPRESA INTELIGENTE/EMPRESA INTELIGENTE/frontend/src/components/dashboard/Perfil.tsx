import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import Modal from "../Modal";

export default function Perfil() {
  const [profile, setProfile] = useState({ id: "", nombre: "Mi cuenta", email: "", rol: "", photo: "" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("nombre, rol").eq("auth_user_id", user.id).maybeSingle();
      let photo = user.user_metadata?.avatar_url || "";
      try { photo = localStorage.getItem(`profile-photo:${user.id}`) || photo; } catch { /* Almacenamiento opcional. */ }
      if (active) setProfile({ id: user.id, nombre: data?.nombre || user.user_metadata?.nombre || user.email?.split("@")[0] || "Mi cuenta", email: user.email || "", rol: data?.rol || "Trabajador", photo });
    })();
    return () => { active = false; };
  }, []);
  const initials = profile.nombre.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  async function photoSelected(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Elige una imagen JPG, PNG o WebP de hasta 2 MB."); return;
    }
    try {
      const photo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      localStorage.setItem(`profile-photo:${profile.id}`, photo);
      setProfile(current => ({ ...current, photo }));
    } catch { setError("No se pudo guardar la foto en este navegador."); }
  }
  return <>
    <button className="sidebar-user profile-trigger" onClick={() => setOpen(true)} title="Abrir mi perfil">
      <span className="profile-avatar">{profile.photo ? <img src={profile.photo} alt="" onError={() => setProfile(p => ({ ...p, photo: "" }))} /> : initials}</span>
      <span className="sidebar-user-info"><strong>{profile.nombre}</strong><small>{profile.rol}</small></span>
      <span className="profile-chevron" aria-hidden="true">↗</span>
    </button>
    {open && <Modal title="Mi perfil" onClose={() => setOpen(false)} busy={busy}>
      <div className="profile-details"><span className="profile-avatar large">{profile.photo ? <img src={profile.photo} alt="Foto de perfil" /> : initials}</span><h3>{profile.nombre}</h3><p>{profile.email}</p><span className="badge">{profile.rol}</span></div>
      <label className="field-label">Foto de perfil<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!profile.id} onChange={e => { void photoSelected(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <p className="form-hint">JPG, PNG o WebP · Máximo 2 MB. La foto se guarda solo en este navegador; es independiente del registro facial.</p>
      {error && <p role="alert" className="inline-error">{error}</p>}
      <div className="modal-actions"><button className="btn-secondary" disabled={busy} onClick={() => setOpen(false)}>Listo</button><button className="btn-danger" disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try { const { error } = await supabase.auth.signOut(); if (error) throw error; }
        catch { setError("No se pudo cerrar la sesión. Intenta nuevamente."); }
        finally { setBusy(false); }
      }}>{busy ? "Cerrando…" : "Cerrar sesión"}</button></div>
    </Modal>}
  </>;
}
