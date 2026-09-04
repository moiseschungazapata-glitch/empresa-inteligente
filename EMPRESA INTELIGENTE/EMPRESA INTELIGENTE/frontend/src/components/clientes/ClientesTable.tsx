import type { Cliente } from "../../pages/Clientes";

interface ClientesTableProps {
  clientes: Cliente[];
  onEliminar: (id: number) => void;
}

function ClientesTable({
  clientes,
  onEliminar
}: ClientesTableProps) {

  return (

    <div className="clientes-table">

      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Empresa</th>
            <th>Acciones</th>

          </tr>

        </thead>


        <tbody>

          {clientes.map((cliente) => (

            <tr key={cliente.id}>

              <td>
                #{cliente.id}
              </td>

              <td>
                <strong>
                  {cliente.nombre}
                </strong>
              </td>

              <td>
                {cliente.email}
              </td>

              <td>
                {cliente.telefono}
              </td>

              <td>
                {cliente.empresa}
              </td>

              <td>

                <button
                  className="action-delete"
                  onClick={() =>
                    onEliminar(cliente.id)
                  }
                >
                  Eliminar
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

export default ClientesTable;