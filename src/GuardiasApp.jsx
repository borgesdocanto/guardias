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

    // Normalizamos: queremos Lun=0, Dom=6
    const offset = (primerDiaSemana + 6) % 7;

    const clavesMes = `${year}-${String(month + 1).padStart(2, "0")}`;
    const guardiasMes = guardias[clavesMes] || {};

    const celdas = [];
    for (let i = 0; i < offset; i++) {
      celdas.push(null); // días vacíos antes del 1
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
      <table className="border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr className="bg-gray-200">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <th key={d} className="border border-gray-400 p-2">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana, idx) => (
            <tr key={idx}>
              {semana.map((celda, i) => (
                <td
                  key={i}
                  className="border border-gray-300 align-top h-24 w-32 p-1"
                >
                  {celda ? (
                    <>
                      <div className="font-bold text-sm text-gray-700">
                        {celda.dia}
                      </div>
                      <ul className="text-xs text-left">
                        {celda.nombres.length > 0 ? (
                          celda.nombres.map((n, j) => <li key={j}>{n}</li>)
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sistema de Guardias</h1>
      <div className="flex justify-between mb-2">
        <button
          onClick={() => cambiarMes(-1)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          ◀️ Mes Anterior
        </button>
        <h2 className="font-semibold">
          {mesActual.toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => cambiarMes(1)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Mes Siguiente ▶️
        </button>
      </div>
      {renderCalendario()}
    </div>
  );
}

export default GuardiasApp;
