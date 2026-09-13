import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabaseClient";

import Login from "./components/auth/Login";
import Register from "./components/auth/register";

import LandingPage from "./pages/LandingPage";
import AnalizarComentario from "./pages/AnalizarComentario";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Comentarios from "./pages/Comentarios";
import Sidebar from "./components/dashboard/Sidebar";
import Solicitudes from "./pages/Solicitudes";
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

import "./index.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Controla Login / Registro
  const [showRegister, setShowRegister] = useState(false);

  // Indica si estamos dentro del proceso de registro
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Detectar si la URL actual corresponde a la ruta pública del cliente
  const isLandingPath =
    window.location.pathname === "/landing" ||
    window.location.pathname === "/landing/";

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

  // 2. Si el usuario ingresa a /landing, mostrar la página pública sin pasar por el Login ni la carga
  if (isLandingPath) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#070b19",
          color: "white",
        }}
      >
        <h2>Cargando Empresa Inteligente...</h2>
      </div>
    );
  }

  // Si está registrándose, mostrar SIEMPRE el registro
  if (showRegister || isRegistering) {
    return (
      <Register
        onBackToLogin={async () => {
          setIsRegistering(false);
          setShowRegister(false);

          await supabase.auth.signOut();
          setSession(null);
        }}
      />
    );
  }

  // Si no hay sesión, mostrar Login
  if (!session) {
    return (
      <Login
        onLoginSuccess={() => window.location.reload()}
        onRegister={() => {
          setShowRegister(true);
          setIsRegistering(true);
        }}
      />
    );
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
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#0f172a",
            }}
          >
            ☰
          </button>

          <span
            style={{
              fontWeight: "700",
              color: "#1e293b",
              fontSize: "16px",
            }}
          >
            Empresa Inteligente
          </span>

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
      </div>
    </div>
  );
}

export default App;