import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabaseClient";
import AnalizarComentario from "./pages/AnalizarComentario";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Comentarios from "./pages/Comentarios";
import Sidebar from "./components/dashboard/Sidebar";
import Solicitudes from "./pages/Solicitudes";
import "./index.css";
import TiemposAtencion from "./pages/TiemposAtencion";
import PalabrasFrecuentes from "./pages/PalabrasFrecuentes";
import Categorias from "./pages/Categorias";
import Clasificacion from "./pages/Clasificacion";
import Estadisticas from "./pages/Estadisticas";
import Interpolacion from "./pages/Interpolacion";
import Optimizacion from "./pages/Optimizacion";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Auditoria from "./pages/Auditoria";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Estado para abrir/cerrar el menú en celular

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2>Cargando Empresa Inteligente...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", textAlign: "center" }}>
          <h1 style={{ marginBottom: "0.5rem", color: "#1e293b" }}>Empresa Inteligente</h1>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>Inicia sesión con tu cuenta corporativa de GitHub para continuar</p>
          <button 
            onClick={handleLogin}
            style={{ 
              backgroundColor: "#0f172a", 
              color: "white", 
              padding: "12px 24px", 
              borderRadius: "8px", 
              border: "none", 
              fontWeight: "600", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto"
            }}
          >
            Iniciar sesión con GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Barra lateral con estado móvil */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
      />

      <div className="content">
        {/* Barra superior para celulares con botón de menú hamburguesa */}
        <div className="mobile-topbar">
          <button
            onClick={() => setIsMobileOpen(true)}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", color: "#0f172a" }}
          >
            ☰
          </button>
          <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>Empresa Inteligente</span>
          <div style={{ width: "24px" }} /> {/* Espaciador simétrico */}
        </div>

        {activePage === "Dashboard" && <Dashboard />}
        {activePage === "Clientes" && <Clientes />}
        {activePage === "Comentarios" && <Comentarios />}
        {activePage === "Solicitudes" && <Solicitudes />}
        {activePage === "Tiempos de atención" && <TiemposAtencion />}
        {activePage === "Analizar comentario" && <AnalizarComentario />}
        {activePage === "Palabras frecuentes" && <PalabrasFrecuentes />}
        {activePage === "Categorías" && <Categorias />}
        {activePage === "Clasificación" && <Clasificacion />}
        {activePage === "Estadísticas" && <Estadisticas />}
        {activePage === "Interpolación" && <Interpolacion />}
        {activePage === "Optimización" && <Optimizacion />}
        {activePage === "Reportes" && <Reportes />}
        {activePage === "Usuarios" && <Usuarios />}
        {activePage === "Auditoria" && <Auditoria />}

        {activePage !== "Dashboard" &&
          activePage !== "Clientes" &&
          activePage !== "Comentarios" && (
          <main className="placeholder">
            <h1>{activePage}</h1>
            <p>Este módulo será desarrollado en el siguiente paso.</p>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;