import React, { useEffect, useState } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState(null);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => setGuardias(data))
      .catch((err) => console.error("Error cargando guardias:", err));
  }, []);

  if (!guardias) {
    return <div className="p-4">⏳ Cargando guardias...</div>;
  }

  // clave tipo "2025-10"
  const clave = `${anioActual}-${mesActual.toString().padStart(2, "0")}`;
  const mesData = guardias[clave] || {};

  // calcular primer y último día del mes
  const firstDay = new Date(anioActual, mesActual - 1, 1);
  const lastDay = new Date(anioActual, mesActual, 0);

  // armar array de días del mes con padding al inicio
  const days = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null); // huecos antes del día 1
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${anioActual}-${mesActual
      .toString()
      .padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    days.push({
      date: dateStr,
      agentes: mesData[dateStr] || [],
    });
  }

  const semanas = [];
  for (let i = 0; i < days.length; i += 7) {
    semanas.push(days.slice(i, i + 7));
  }

  const nombreMes = firstDay.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        📅 Guardias – {nombreMes}
      </h1>
      <div className="grid grid-cols-7 gap-2 text-center font-semibold">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
        <div>Dom</div>
      </div>
      {semanas.map((semana, i) => (
        <div key={i} className="grid grid-cols-7 gap-2 text-sm mb-2">
          {semana.map((dia, j) =>
            dia ? (
              <div
                key={j}
                className="border rounded p-1 bg-white shadow-sm h-24 flex flex-col"
              >
                <div className="font-bold">{new Date(dia.date).getDate()}</div>
                <div className="text-xs flex-1">
                  {dia.agentes.map((a, idx) => (
                    <div key={idx}>{a}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={j}></div>
            )
          )}
        </div>
      ))}
    </div>
  );
}

export default GuardiasApp;
