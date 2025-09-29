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

  // la clave ahora es YYYY-MM
  const clave = `${anioActual}-${mesActual.toString().padStart(2, "0")}`;
  const mesData = guardias[clave] || {};

  const dias = Object.keys(mesData).sort();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📅 Guardias {clave}</h1>
      {dias.length === 0 ? (
        <p>No hay guardias cargadas para este mes.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dias.map((dia) => (
            <div
              key={dia}
              className="border rounded p-2 bg-white shadow-sm hover:shadow-md"
            >
              <h2 className="font-semibold">
                {new Date(dia).toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <ul className="list-disc list-inside text-gray-700">
                {mesData[dia].map((agente, idx) => (
                  <li key={idx}>{agente}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GuardiasApp;
