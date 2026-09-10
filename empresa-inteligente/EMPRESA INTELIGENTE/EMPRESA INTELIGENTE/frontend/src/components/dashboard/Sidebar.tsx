import { useState } from "react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleSelectPage = (page: string) => {
    setActivePage(page);
    setIsOpen(false); // Cierra automáticamente el menú en celulares al navegar
  };

  return (
    <>
      {/* Fondo oscuro translúcido cuando el menú está abierto en celulares */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="mobile-backdrop"
        />
      )}

      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="logo">
          <div className="logo-icon">🧠</div>
          <div>
            <h2>Empresa</h2>
            <span>Inteligente</span>
          </div>
        </div>

        <nav>
          <button
            className={`menu-item ${activePage === "Dashboard" ? "active" : ""}`}
            onClick={() => handleSelectPage("Dashboard")}
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            className={`menu-item ${activePage === "Clientes" ? "active" : ""}`}
            onClick={() => handleSelectPage("Clientes")}
          >
            <span>👥</span>
            Clientes
          </button>

          <button
            className="menu-item"
            onClick={() => toggleMenu("atencion")}
          >
            <span>💬</span>
            Atención
            <span className="arrow">›</span>
          </button>

          {openMenu === "atencion" && (
            <div className="submenu">
              <button onClick={() => handleSelectPage("Solicitudes")}>
                Solicitudes
              </button>
              <button onClick={() => handleSelectPage("Comentarios")}>
                Comentarios
              </button>
              <button onClick={() => handleSelectPage("Tiempos de atención")}>
                Tiempos de atención
              </button>
            </div>
          )}

          <button
            className="menu-item"
            onClick={() => toggleMenu("nlp")}
          >
            <span>🧠</span>
            Inteligencia NLP
            <span className="arrow">›</span>
          </button>

          {openMenu === "nlp" && (
            <div className="submenu">
              <button onClick={() => handleSelectPage("Analizar comentario")}>
                Analizar comentario
              </button>
              <button onClick={() => handleSelectPage("Palabras frecuentes")}>
                Palabras frecuentes
              </button>
              <button onClick={() => handleSelectPage("Categorías")}>
                Categorías
              </button>
              <button onClick={() => handleSelectPage("Clasificación")}>
                Clasificación
              </button>
            </div>
          )}

          <button
            className="menu-item"
            onClick={() => toggleMenu("scientific")}
          >
            <span>🧪</span>
            Scientific Data
            <span className="arrow">›</span>
          </button>

          {openMenu === "scientific" && (
            <div className="submenu">
              <button onClick={() => handleSelectPage("Estadísticas")}>
                Estadísticas
              </button>
              <button onClick={() => handleSelectPage("Interpolación")}>
                Interpolación
              </button>
              <button onClick={() => handleSelectPage("Optimización")}>
                Optimización
              </button>
            </div>
          )}

          <button
            className="menu-item"
            onClick={() => handleSelectPage("Reportes")}
          >
            <span>📊</span>
            Reportes
          </button>

          <button
            className="menu-item"
            onClick={() => toggleMenu("config")}
          >
            <span>⚙️</span>
            Configuración
            <span className="arrow">›</span>
          </button>

          {openMenu === "config" && (
            <div className="submenu">
              <button onClick={() => handleSelectPage("Usuarios")}>
                Usuarios
              </button>
              <button onClick={() => handleSelectPage("Categorías")}>
                Categorías
              </button>
              <button onClick={() => handleSelectPage("Auditoria")}>
                Auditoria
              </button>
            </div>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" style={{ backgroundColor: "#2563eb", color: "white", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }}>
            M
          </div>
          <div>
            <strong>Moisés Chunga</strong>
            <small>Administrador</small>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;