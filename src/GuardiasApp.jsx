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
    const month = mesActual.getMonth(); // 0-11
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    const primerDiaSemana = new Date(year, month, 1).getDay(); // 0=Dom
    const offset = (primerDiaSemana + 6) % 7; // Normaliza Lun=0, Dom=6

    const claveMes = `${year}-${String(month + 1).padStart(2, "0")}`;
    const guardiasMes = guardias[claveMes] || {};

    const celdas = [];
    for (let i = 0; i < offset; i++) {
      celdas.push(null); // espacios vacíos
    }
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const claveDia = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;
      celdas.push({
        dia,
        nombres: guardiasMes[claveDia] || [],
      });
    }

    // dividir en semanas
    const semanas = [];
    for (let i = 0; i < celdas.length; i += 7) {
      semanas.push(celdas.slice(i, i + 7));
    }

    return (
      <div className="grid grid-cols-7 gap-1 bg-gray-300 p-2 rounded-lg shadow-md">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="text-center font-semibold text-gray-700 bg-gray-100 py-2 rounded"
          >
            {d}
          </div>
        ))}
        {semanas.map((semana, idx) =>
          semana.map((celda, i) => {
            const esFinde = i === 5 || i === 6;
            return (
              <div
                key={`${idx}-${i}`}
                className={`h-28 p-1 border rounded bg-white flex flex-col ${
                  esFinde ? "bg-gray-50" : "bg-white"
                }`}
              >
                {celda ? (
                  <>
                    <div className="text-xs text-right text-gray-500">
                      {celda.dia}
                    </div>
                    <div className="flex-1 text-xs mt-1 space-y-1 overflow-hidden">
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
          })
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Sistema de Guardias
      </h1>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => cambiarMes(-1)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          ◀️ Mes Anterior
        </button>
        <h2 className="font-semibold text-lg capitalize">
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
