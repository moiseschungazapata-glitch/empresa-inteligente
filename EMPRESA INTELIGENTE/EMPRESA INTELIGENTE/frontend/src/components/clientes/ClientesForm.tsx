import { useState } from "react";

interface ClienteFormProps {

  onGuardar: (cliente: {
    nombre: string;
    email: string;
    telefono: string;
    empresa: string;
  }) => void;

  onCancelar: () => void;
}

function ClienteForm({
  onGuardar,
  onCancelar
}: ClienteFormProps) {

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [empresa, setEmpresa] = useState("");


  const guardar = (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    if (!nombre || !email) {

      alert(
        "Nombre y correo son obligatorios"
      );

      return;
    }


    onGuardar({

      nombre,
      email,
      telefono,
      empresa

    });

  };


  return (

    <div className="panel">

      <div className="panel-header">

        <div>

          <h3>
            Nuevo cliente
          </h3>

          <span>
            Registrar un nuevo cliente
          </span>

        </div>

      </div>


      <form onSubmit={guardar}>


        <div className="form-group">

          <label>
            Nombre completo
          </label>

          <input
            type="text"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            placeholder="Nombre del cliente"
          />

        </div>


        <div className="form-group">

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="cliente@email.com"
          />

        </div>


        <div className="form-group">

          <label>
            Teléfono
          </label>

          <input
            type="text"
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value)
            }
            placeholder="999 999 999"
          />

        </div>


        <div className="form-group">

          <label>
            Empresa
          </label>

          <input
            type="text"
            value={empresa}
            onChange={(e) =>
              setEmpresa(e.target.value)
            }
            placeholder="Empresa"
          />

        </div>


        <div className="form-actions">

          <button
            type="button"
            onClick={onCancelar}
          >
            Cancelar
          </button>


          <button type="submit">
            Guardar cliente
          </button>

        </div>


      </form>

    </div>

  );
}

export default ClienteForm;