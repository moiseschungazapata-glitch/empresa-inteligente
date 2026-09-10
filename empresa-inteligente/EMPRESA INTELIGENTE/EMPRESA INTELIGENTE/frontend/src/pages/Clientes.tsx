import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import ClientesTable from "../components/clientes/ClientesTable";
import ClienteForm from "../components/clientes/ClientesForm";

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
}

function Clientes() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // 1. Cargar datos iniciales y escuchar cambios en tiempo real
  useEffect(() => {
    fetchClientes();

    const channel = supabase
      .channel('clientes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => {
          fetchClientes(); // Recarga automática cuando hay cambios en Supabase
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar clientes:", error.message);
    } else if (data) {
      setClientes(data);
    }
  };

  const agregarCliente = async (cliente: Omit<Cliente, "id">) => {
    const { error } = await supabase.from("clientes").insert([cliente]);

    if (error) {
      console.error("Error al agregar cliente:", error.message);
      alert("Hubo un error al registrar el cliente.");
    } else {
      setMostrarFormulario(false);
    }
  };

  const eliminarCliente = async (id: number) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmar) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar cliente:", error.message);
      alert("Hubo un error al eliminar el cliente.");
    }
  };

  return (
    <main className="dashboard">
      <div className="topbar">
        <div>
          <h1>Clientes</h1>
          <p>Gestión de clientes de la empresa</p>
        </div>
        <button
          className="new-client-button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo cliente
        </button>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card">
          <h3>Total clientes</h3>
          <div className="number">{clientes.length}</div>
          <div className="description">Clientes registrados</div>
        </div>

        <div className="kpi-card">
          <h3>Clientes activos</h3>
          <div className="number">{clientes.length}</div>
          <div className="description">Clientes actualmente activos</div>
        </div>
      </section>

      {mostrarFormulario && (
        <ClienteForm
          onGuardar={agregarCliente}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Lista de clientes</h3>
            <span>Clientes registrados en el sistema</span>
          </div>
        </div>

        <ClientesTable
          clientes={clientes}
          onEliminar={eliminarCliente}
        />
      </section>
    </main>
  );
}

export default Clientes;