import { supabase } from "../services/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const tiempos = [
  { dia: "Lun", minutos: 14 },
  { dia: "Mar", minutos: 18 },
  { dia: "Mié", minutos: 16 },
  { dia: "Jue", minutos: 13 },
  { dia: "Vie", minutos: 19 },
  { dia: "Sáb", minutos: 11 }
];

const categorias = [
  { name: "Soporte", value: 42 },
  { name: "Ventas", value: 27 },
  { name: "Reclamos", value: 18 },
  { name: "Consulta", value: 13 }
];

const palabras = [
  { palabra: "servicio", cantidad: 184 },
  { palabra: "problema", cantidad: 156 },
  { palabra: "atención", cantidad: 142 },
  { palabra: "cliente", cantidad: 128 },
  { palabra: "solución", cantidad: 116 },
  { palabra: "rápido", cantidad: 94 }
];

const colores = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444"
];

function Dashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="dashboard">

      {/* ENCABEZADO */}
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Centro de inteligencia empresarial</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              backgroundColor: "#2563eb", 
              color: "white", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              fontWeight: "bold", 
              fontSize: "16px" 
            }}>
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: "14px", lineHeight: "1.3" }}>
              <span style={{ fontWeight: "700", color: "#0f172a" }}>Moisés Chunga</span>
              <span style={{ color: "#64748b", fontSize: "12px" }}>Administrador</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{ 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "6px", 
              cursor: "pointer", 
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* BIENVENIDA */}
      <section className="welcome">
        <h2>Bienvenido a Empresa Inteligente 👋</h2>
        <p>Analiza clientes, comentarios y datos empresariales utilizando inteligencia artificial.</p>
      </section>

      {/* KPIs */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <h3>Clientes</h3>
          <div className="number">245</div>
          <div className="description">Clientes registrados</div>
        </div>
        <div className="kpi-card">
          <h3>Comentarios</h3>
          <div className="number">1,248</div>
          <div className="description">Comentarios analizados</div>
        </div>
        <div className="kpi-card">
          <h3>Tiempo promedio</h3>
          <div className="number">16.4 min</div>
          <div className="description">Tiempo de atención</div>
        </div>
        <div className="kpi-card">
          <h3>Precisión NLP</h3>
          <div className="number">94%</div>
          <div className="description">Clasificación automática</div>
        </div>
      </section>

      {/* GRÁFICOS SUPERIORES */}
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Tiempo de atención</h3>
              <span>Promedio por día</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tiempos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutos" name="Minutos" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Categorías NLP</h3>
              <span>Distribución de comentarios</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorias} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {categorias.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colores[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SECCIÓN INFERIOR EN DOS COLUMNAS */}
      <section className="dashboard-grid">
        {/* PALABRAS FRECUENTES (BARRAS HORIZONTALES ESTILIZADAS) */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Palabras frecuentes</h3>
              <span>Palabras detectadas por NLTK</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280, marginTop: "5px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={palabras} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="palabra" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Apariciones" fill="#3b82f6" barSize={18} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESTADO DEL SISTEMA */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Estado del sistema</h3>
              <span>Servicios principales</span>
            </div>
          </div>

          <div className="system-status" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "15px" }}>
            <div className="status" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="status-dot" style={{ width: "10px", height: "10px", backgroundColor: "#22c55e", borderRadius: "50%" }}></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong>Base de datos</strong>
                <small style={{ color: "#64748b" }}>Conectada (Supabase)</small>
              </div>
            </div>

            <div className="status" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="status-dot" style={{ width: "10px", height: "10px", backgroundColor: "#22c55e", borderRadius: "50%" }}></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong>NLP</strong>
                <small style={{ color: "#64748b" }}>Activo y respondiendo</small>
              </div>
            </div>

            <div className="status" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="status-dot" style={{ width: "10px", height: "10px", backgroundColor: "#22c55e", borderRadius: "50%" }}></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong>SciPy</strong>
                <small style={{ color: "#64748b" }}>Procesamiento numérico activo</small>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Dashboard;