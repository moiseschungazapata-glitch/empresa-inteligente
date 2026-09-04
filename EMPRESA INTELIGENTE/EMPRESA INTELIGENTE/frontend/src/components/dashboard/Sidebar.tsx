import { useState } from "react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

function Sidebar({ activePage, setActivePage }: SidebarProps) {

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="sidebar">

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
          onClick={() => setActivePage("Dashboard")}
        >
          <span>🏠</span>
          Dashboard
        </button>


        <button
          className={`menu-item ${activePage === "Clientes" ? "active" : ""}`}
          onClick={() => setActivePage("Clientes")}
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
            <button onClick={() => setActivePage("Solicitudes")}>
              Solicitudes
            </button>

            <button onClick={() => setActivePage("Comentarios")}>
              Comentarios
            </button>

            <button onClick={() => setActivePage("Tiempos de atención")}>
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
            <button onClick={() => setActivePage("Analizar comentario")}>
              Analizar comentario
            </button>

            <button onClick={() => setActivePage("Palabras frecuentes")}>
              Palabras frecuentes
            </button>

            <button onClick={() => setActivePage("Categorías")}>
              Categorías
            </button>

            <button onClick={() => setActivePage("Clasificación")}>
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
            <button onClick={() => setActivePage("Estadísticas")}>
              Estadísticas
            </button>

            <button onClick={() => setActivePage("Interpolación")}>
              Interpolación
            </button>

            <button onClick={() => setActivePage("Optimización")}>
              Optimización
            </button>
          </div>
        )}


        <button
          className="menu-item"
          onClick={() => setActivePage("Reportes")}
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
            <button onClick={() => setActivePage("Usuarios")}>
              Usuarios
            </button>

            <button onClick={() => setActivePage("Categorías")}>
              Categorías
            </button>

            <button onClick={() => setActivePage("Auditoría")}>
              Auditoría
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
  );
}

export default Sidebar;