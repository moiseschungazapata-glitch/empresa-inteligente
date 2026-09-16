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

const colores = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function Dashboard() {

  return (
    <main className="dashboard">

      <header className="topbar"><div><span className="eyebrow">RESUMEN GENERAL</span><h1>Dashboard</h1><p>Una visión general de la actividad de tu organización.</p></div><span className="demo-badge">Datos de demostración</span></header>
      <section className="welcome"><h2>Tu centro de inteligencia empresarial</h2><p>Consulta la actividad, identifica tendencias y explora los resultados del equipo.</p></section>

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
                <CartesianGrid strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutos" name="Minutos" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
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
                <Pie data={categorias} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="var(--surface)">
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
                <CartesianGrid strokeDasharray="3 5" vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="palabra" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Apariciones" fill="var(--chart-1)" barSize={18} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESTADO DEL SISTEMA */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Herramientas de la plataforma</h3>
              <span>Módulos de tu espacio de trabajo</span>
            </div>
          </div>

          <div className="system-status">
            {[{ name: "Base de datos", detail: "Supabase · Gestión de información" }, { name: "Análisis de comentarios", detail: "Clasificación y detección de palabras" }, { name: "Scientific Data", detail: "Estadísticas y análisis numérico" }].map(service => <div className="status" key={service.name}><span className="status-dot" /><div><strong>{service.name}</strong><small>{service.detail}</small></div></div>)}
          </div>
        </div>
      </section>

    </main>
  );
}

export default Dashboard;