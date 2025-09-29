// src/GuardiasApp.jsx
import React, { useEffect, useState } from "react";

const GuardiasApp = () => {
  const [guardias, setGuardias] = useState({});
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });

  // Cargar el JSON de guardias
  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => setGuardias(data))
      .catch((err) => console.error("Error cargando guardias.json", err));
  }, []);

  // Helpers
  const obtenerDiasDelMes = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const mostrarMes = (offset = 0) => {
    const [y, m] = mesActual.split("-").map(Number);
    const fecha = new Date(y, m - 1 + offset, 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
  };

  const cambiarMes = (offset) => {
    setMesActual(mostrarMes(offset));
  };

  // Render calendario
  const renderCalendario = (mes) => {
    const [year, month] = mes.split("-").map(Number);
    const dias = obtenerDiasDelMes(year, month - 1);

    // Primer día de la semana (lunes=1, domingo=0)
    const inicioSemana = (dias[0].getDay() + 6) % 7;
    const celdasVaciasInicio = Array(inicioSemana).fill(null);

    const totalCeldas = celdasVaciasInicio.length + dias.length;
    const celdasExtra = (7 - (totalCeldas % 7)) % 7;

    const celdas = [...celdasVaciasInicio, ...dias, ...Array(celdasExtra).fill(null)];

    return (
      <div className="grid grid-cols-7 gap-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="font-bold text-center text-gray-700">
            {d}
          </div>
        ))}

        {celdas.map((dia, idx) => {
          if (!dia) return <div key={idx} className="border rounded-lg h-24 bg-gray-50"></div>;

          const fechaKey = `${year}-${String(month).padStart(2, "0")}-${String(
            dia.getDate()
          ).padStart(2, "0")}`;

          const guardiasDia = guardias[mes]?.[fechaKey] || [];

          return (
            <div
              key={idx}
              className="border rounded-lg h-24 p-1 bg-white flex flex-col text-xs"
            >
              <div className="font-semibold text-gray-800 text-right">{dia.getDate()}</div>
              <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                {guardiasDia.length > 0 ? (
                  guardiasDia.map((g, i) => (
                    <div key={i} className="truncate text-gray-600">
                      {g}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-300 italic">-</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#AA0000]">
          Sistema de Guardias
        </h1>

        <div className="flex justify-between mb-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ◀ Mes Anterior
          </button>
          <h2 className="text-xl font-semibold">
            {new Date(mesActual + "-01").toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={() => cambiarMes(1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Mes Siguiente ▶
          </button>
        </div>

        {renderCalendario(mesActual)}
      </div>
    </div>
  );
};

export default GuardiasApp;
