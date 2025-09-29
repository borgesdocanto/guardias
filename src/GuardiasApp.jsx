import React, { useEffect, useState } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState(null);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => {
        setGuardias(data);
      })
      .catch((err) => console.error("Error cargando guardias:", err));
  }, []);

  if (!guardias) {
    return <div className="p-4">⏳ Cargando guardias...</div>;
  }

  // buscar guardias del mes actual
  const clave = `${mesActual.toString().padStart(2, "0")}/${anioActual}`;
  const mesData = guardias[clave] || {};

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📅 Guardias {clave}</h1>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(mesData).map(([dia, agentes]) => (
          <div
            key={dia}
            className="border rounded p-2 bg-white shadow-sm hover:shadow-md"
          >
            <h2 className="font-semibold">Día {dia}</h2>
            <ul className="list-disc list-inside text-gray-700">
              {agentes.map((agente, idx) => (
                <li key={idx}>{agente}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuardiasApp;
