import { useState, type ReactNode } from "react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleSelectPage = (page: string) => {
    setActivePage(page);
    setIsOpen(false);
  };

  const Icon = ({ children }: { children: ReactNode }) => (
    <span className="menu-icon">{children}</span>
  );

  return (
    <>
      {isOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>

        {/* LOGO */}
        <div className="logo">
          <div className="logo-icon">
            EI
          </div>

          <div className="logo-brand">
            <h2>EMPRESA</h2>
            <span>INTELIGENTE</span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="sidebar-nav">

          <div className="sidebar-section-title">
            GENERAL
          </div>

          {/* DASHBOARD */}
          <button
            className={`menu-item ${
              activePage === "Dashboard" ? "active" : ""
            }`}
            onClick={() => handleSelectPage("Dashboard")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </Icon>

            <span className="menu-text">Dashboard</span>
          </button>

          {/* CLIENTES */}
          <button
            className={`menu-item ${
              activePage === "Clientes" ? "active" : ""
            }`}
            onClick={() => handleSelectPage("Clientes")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M16 5.5c2.2.3 4 2.2 4 4.5" />
                <path d="M17 14c2.3.8 4 3 4 6" />
              </svg>
            </Icon>

            <span className="menu-text">Clientes</span>
          </button>

          {/* ATENCIÓN */}
          <div className="sidebar-section-title">
            ATENCIÓN
          </div>

          <button
            className={`menu-item ${
              openMenu === "atencion" ? "expanded" : ""
            }`}
            onClick={() => toggleMenu("atencion")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <path d="M4 5h16v11H8l-4 4V5z" />
                <path d="M8 9h8" />
                <path d="M8 12h5" />
              </svg>
            </Icon>

            <span className="menu-text">Atención</span>

            <span className="menu-arrow">›</span>
          </button>

          {openMenu === "atencion" && (
            <div className="submenu">

              <button
                className={`submenu-item ${
                  activePage === "Solicitudes" ? "active" : ""
                }`}
                onClick={() => handleSelectPage("Solicitudes")}
              >
                Solicitudes
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Comentarios" ? "active" : ""
                }`}
                onClick={() => handleSelectPage("Comentarios")}
              >
                Comentarios
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Tiempos de atención"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Tiempos de atención")
                }
              >
                Tiempos de atención
              </button>

            </div>
          )}

          {/* INTELIGENCIA */}
          <div className="sidebar-section-title">
            INTELIGENCIA
          </div>

          <button
            className={`menu-item ${
              openMenu === "nlp" ? "expanded" : ""
            }`}
            onClick={() => toggleMenu("nlp")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <path d="M12 3a3 3 0 0 0-3 3v1H7a3 3 0 0 0 0 6h1v2H6a3 3 0 0 0 0 6h3" />
                <path d="M12 3a3 3 0 0 1 3 3v1h2a3 3 0 0 1 0 6h-1v2h2a3 3 0 0 1 0 6h-3" />
                <path d="M12 3v18" />
              </svg>
            </Icon>

            <span className="menu-text">Inteligencia NLP</span>

            <span className="menu-arrow">›</span>
          </button>

          {openMenu === "nlp" && (
            <div className="submenu">

              <button
                className={`submenu-item ${
                  activePage === "Analizar comentario"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Analizar comentario")
                }
              >
                Analizar comentario
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Palabras frecuentes"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Palabras frecuentes")
                }
              >
                Palabras frecuentes
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Categorías NLP"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Categorías NLP")
                }
              >
                Categorías
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Clasificación"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Clasificación")
                }
              >
                Clasificación
              </button>

            </div>
          )}

          {/* SCIENTIFIC DATA */}
          <button
            className={`menu-item ${
              openMenu === "scientific" ? "expanded" : ""
            }`}
            onClick={() => toggleMenu("scientific")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <path d="M9 3h6" />
                <path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
                <path d="M8 15h8" />
              </svg>
            </Icon>

            <span className="menu-text">Scientific Data</span>

            <span className="menu-arrow">›</span>
          </button>

          {openMenu === "scientific" && (
            <div className="submenu">

              <button
                className={`submenu-item ${
                  activePage === "Estadísticas" ? "active" : ""
                }`}
                onClick={() =>
                  handleSelectPage("Estadísticas")
                }
              >
                Estadísticas
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Interpolación" ? "active" : ""
                }`}
                onClick={() =>
                  handleSelectPage("Interpolación")
                }
              >
                Interpolación
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Optimización" ? "active" : ""
                }`}
                onClick={() =>
                  handleSelectPage("Optimización")
                }
              >
                Optimización
              </button>

            </div>
          )}

          {/* REPORTES */}
          <div className="sidebar-section-title">
            REPORTES
          </div>

          <button
            className={`menu-item ${
              activePage === "Reportes" ? "active" : ""
            }`}
            onClick={() => handleSelectPage("Reportes")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 16v-5" />
                <path d="M12 16V7" />
                <path d="M17 16v-8" />
              </svg>
            </Icon>

            <span className="menu-text">Reportes</span>
          </button>

          {/* SISTEMA */}
          <div className="sidebar-section-title">
            SISTEMA
          </div>

          <button
            className={`menu-item ${
              openMenu === "config" ? "expanded" : ""
            }`}
            onClick={() => toggleMenu("config")}
          >
            <Icon>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1z" />
              </svg>
            </Icon>

            <span className="menu-text">Configuración</span>

            <span className="menu-arrow">›</span>
          </button>

          {openMenu === "config" && (
            <div className="submenu">

              <button
                className={`submenu-item ${
                  activePage === "Usuarios" ? "active" : ""
                }`}
                onClick={() => handleSelectPage("Usuarios")}
              >
                Usuarios
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Categorías Sistema"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelectPage("Categorías Sistema")
                }
              >
                Categorías
              </button>

              <button
                className={`submenu-item ${
                  activePage === "Auditoria" ? "active" : ""
                }`}
                onClick={() => handleSelectPage("Auditoria")}
              >
                Auditoría
              </button>

            </div>
          )}

        </nav>

        {/* USUARIO */}
        <div className="sidebar-user">

          <div className="avatar">
            M
            <span className="user-status" />
          </div>

          <div className="sidebar-user-info">
            <strong>Moisés Chunga</strong>
            <small>Administrador</small>
          </div>

          <span className="user-more">•••</span>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;