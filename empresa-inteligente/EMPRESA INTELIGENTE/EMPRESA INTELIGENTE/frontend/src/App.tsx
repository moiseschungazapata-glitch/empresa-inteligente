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
import Estadisticas from "./pages/Estadisticas";
import Interpolacion from "./pages/Interpolacion";
import Optimizacion from "./pages/Optimizacion";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Auditoria from "./pages/Auditoria";

import "./index.css";
import "./workspace.css";
import "./theme.css";
import ThemeToggle from "./components/ThemeToggle";
import { useWorkspaceTheme } from "./hooks/useWorkspaceTheme";

const BIOMETRIC_SESSION_KEY =
  "empresa-inteligente-biometric-verified";

function App() {
  const { theme, toggleTheme } = useWorkspaceTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Indica si el usuario ya superó la verificación facial
  // durante esta sesión del navegador.
  const [biometricVerified, setBiometricVerified] =
    useState(
      () =>
        sessionStorage.getItem(
          BIOMETRIC_SESSION_KEY
        ) === "true"
    );

  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activePage]);

  // Controla Login / Registro
  const [showRegister, setShowRegister] = useState(false);

  // Indica si estamos dentro del proceso de registro
  const [isRegistering, setIsRegistering] = useState(false);

  // Ruta pública
  const isLandingPath =
    window.location.pathname === "/landing" ||
    window.location.pathname === "/landing/";

  useEffect(() => {
    // ----------------------------------------------------------
    // SESIÓN INICIAL
    // ----------------------------------------------------------
    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        setSession(session);

        // Si no existe sesión, tampoco puede existir
        // una verificación biométrica válida.
        if (!session) {
          sessionStorage.removeItem(
            BIOMETRIC_SESSION_KEY
          );
          setBiometricVerified(false);
        }

        setLoading(false);
      }
    );

    // ----------------------------------------------------------
    // CAMBIOS DE AUTENTICACIÓN
    // ----------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (!session) {
          sessionStorage.removeItem(
            BIOMETRIC_SESSION_KEY
          );

          setBiometricVerified(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // RUTA PÚBLICA
  // ----------------------------------------------------------
  if (isLandingPath) {
    return <LandingPage />;
  }

  // ----------------------------------------------------------
  // CARGANDO
  // ----------------------------------------------------------
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
        <h2>
          Cargando Empresa Inteligente...
        </h2>
      </div>
    );
  }

  // ----------------------------------------------------------
  // REGISTRO
  // ----------------------------------------------------------
  if (showRegister || isRegistering) {
    return (
      <Register
        onBackToLogin={async () => {
          setIsRegistering(false);
          setShowRegister(false);

          sessionStorage.removeItem(
            BIOMETRIC_SESSION_KEY
          );

          setBiometricVerified(false);

          await supabase.auth.signOut();
          setSession(null);
        }}
      />
    );
  }

  // ----------------------------------------------------------
  // LOGIN
  //
  // IMPORTANTE:
  // Una sesión de Supabase NO es suficiente.
  //
  // Necesitamos también:
  //
  // biometricVerified === true
  // ----------------------------------------------------------
  if (!session || !biometricVerified) {
    return (
      <Login
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={() => {
          sessionStorage.setItem(
            BIOMETRIC_SESSION_KEY,
            "true"
          );

          setBiometricVerified(true);
        }}
        onRegister={() => {
          setShowRegister(true);
          setIsRegistering(true);
        }}
      />
    );
  }

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------
  return (
    <div className={"app " + (collapsed ? "sidebar-collapsed" : "")} data-theme={theme}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
      />

      <div className="content">
        <header className="workspace-topbar">
          <button className="icon-button mobile-menu-toggle" aria-label="Abrir menú" onClick={() => setIsMobileOpen(true)}>☰</button>
          <span>Empresa Inteligente <span className="breadcrumb-divider">/</span> <strong>{activePage}</strong></span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {activePage === "Dashboard" && (
          <Dashboard />
        )}

        {activePage === "Clientes" && (
          <Clientes />
        )}

        {activePage === "Comentarios" && (
          <Comentarios />
        )}

        {activePage === "Solicitudes" && (
          <Solicitudes />
        )}

        {activePage === "Tiempos de atención" && (
          <TiemposAtencion />
        )}

        {activePage === "Analizar comentario" && (
          <AnalizarComentario />
        )}

        {activePage === "Palabras frecuentes" && (
          <PalabrasFrecuentes />
        )}

        {(activePage === "Categorías" || activePage === "Categorías Sistema" || activePage === "Categorías NLP") && (
          <Categorias />
        )}

        {activePage === "Estadísticas" && (
          <Estadisticas />
        )}

        {activePage === "Interpolación" && (
          <Interpolacion />
        )}

        {activePage === "Optimización" && (
          <Optimizacion />
        )}

        {activePage === "Reportes" && (
          <Reportes />
        )}

        {activePage === "Usuarios" && (
          <Usuarios />
        )}

        {activePage === "Auditoria" && (
          <Auditoria />
        )}
      </div>
    </div>
  );
}

export default App;
