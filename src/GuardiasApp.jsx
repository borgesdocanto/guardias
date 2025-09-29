// src/GuardiasApp.jsx
import React, { useEffect, useState } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState({});
  const [mesActual, setMesActual] = useState(new Date());

  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => setGuardias(data))
      .catch((err) => console.error("Error cargando guardias:", err));
  }, []);

  const cambiarMes = (delta) => {
    setMesActual((prev) => {
      const nuevo = new Date(prev);
      nuevo.setMonth(nuevo.getMonth() + delta);
      return nuevo;
    });
  };

  const renderCalendario = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    const primerDiaSemana = new Date(year, month, 1).getDay();
    const offset = (primerDiaSemana + 6) % 7; // Lunes=0, Domingo=6

    const claveMes = `${year}-${String(month + 1).padStart(2, "0")}`;
    const guardiasMes = guardias[claveMes] || {};

    const celdas = [];
    for (let i = 0; i < offset; i++) celdas.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const claveDia = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;
      celdas.push({
        dia,
        nombres: guardiasMes[claveDia] || [],
      });
    }
    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-300 rounded-lg overflow-hidden shadow-lg">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="bg-gray-200 text-center font-semibold py-2 text-sm"
          >
            {d}
          </div>
        ))}
        {celdas.map((celda, i) => {
          const esFinde = i % 7 === 5 || i % 7 === 6;
          return (
            <div
              key={i}
              className={`h-28 bg-white p-2 flex flex-col border border-gray-200 ${
                esFinde ? "bg-gray-50" : ""
              }`}
            >
              {celda ? (
                <>
                  <div className="text-xs font-bold text-gray-600 text-right">
                    {celda.dia}
                  </div>
                  <div className="mt-1 space-y-1 text-xs overflow-hidden">
                    {celda.nombres.length > 0 ? (
                      celda.nombres.map((n, j) => (
                        <div
                          key={j}
                          className="truncate bg-blue-100 text-blue-700 px-1 rounded"
                        >
                          {n}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-300">-</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Sistema de Guardias
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => cambiarMes(-1)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          ◀️ Mes Anterior
        </button>
        <h2 className="font-semibold text-xl capitalize">
          {mesActual.toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => cambiarMes(1)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Mes Siguiente ▶️
        </button>
      </div>
      {renderCalendario()}
    </div>
  );
}

export default GuardiasApp;
