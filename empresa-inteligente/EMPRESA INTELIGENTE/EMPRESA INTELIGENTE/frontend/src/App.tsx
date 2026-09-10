import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabaseClient";
import Login from "./components/auth/Login";
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#070b19", color: "white" }}>
        <h2>Cargando Empresa Inteligente...</h2>
      </div>
    );
  }

  // Si no hay sesión, se muestra el componente de Login profesional con OTP
  if (!session) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
      />

      <div className="content">
        <div className="mobile-topbar">
          <button
            onClick={() => setIsMobileOpen(true)}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", color: "#0f172a" }}
          >
            ☰
          </button>
          <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>Empresa Inteligente</span>
          <div style={{ width: "24px" }} />
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