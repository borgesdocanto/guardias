import React, { useEffect, useState } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState({});
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => setGuardias(data))
      .catch((err) => console.error("Error cargando guardias:", err));
  }, []);

  const mesClave = `${fecha.getFullYear()}-${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}`;
  const guardiasMes = guardias[mesClave] || {};

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  const primerDiaSemana = (inicioMes.getDay() + 6) % 7;
  const diasMes = finMes.getDate();

  const handlePrevMonth = () => {
    setFecha(new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setFecha(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1));
  };

  // Función para detectar si es feriado
  const esFeriado = (guardiasDia) => {
    return guardiasDia.length > 0 && guardiasDia[0].startsWith("Feriado:");
  };

  const renderCeldas = () => {
    const celdas = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      celdas.push(
        <div
          key={`empty-${i}`}
          className="border rounded-xl min-h-[120px] bg-gray-100"
        />
      );
    }

    for (let d = 1; d <= diasMes; d++) {
      const claveDia = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const guardiasDia = guardiasMes[claveDia] || [];
      const isFeriado = esFeriado(guardiasDia);

      celdas.push(
        <div
          key={d}
          className={`border rounded-xl p-3 min-h-[120px] transition flex flex-col ${
            isFeriado
              ? "bg-black text-white hover:bg-gray-900"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div
            className={`font-bold mb-2 ${
              isFeriado ? "text-white" : "text-gray-800"
            }`}
          >
            {d}
          </div>
          <div className="flex flex-col gap-1">
            {guardiasDia.length > 0 ? (
              guardiasDia.map((g, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 rounded-md text-sm font-medium ${
                    isFeriado
                      ? "bg-white/20 text-white"
                      : "bg-marca/10 text-marca"
                  }`}
                >
                  {isFeriado ? g.replace("Feriado: ", "") : g}
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        </div>
      );
    }

    return celdas;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <h1 className="text-4xl font-extrabold text-marca mb-6 drop-shadow-md">
        Sistema de Guardias
      </h1>

      <div className="flex items-center justify-between w-full max-w-6xl mb-6">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-2 bg-marca text-white px-6 py-3 rounded-lg shadow hover:bg-red-800 transition text-lg"
        >
          ◀ Mes Anterior
        </button>

        <h2 className="text-3xl font-bold capitalize">
          {fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
          })}
        </h2>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-2 bg-marca text-white px-6 py-3 rounded-lg shadow hover:bg-red-800 transition text-lg"
        >
          Mes Siguiente ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3 bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xl text-lg">
        {diasSemana.map((dia, i) => (
          <div
            key={i}
            className="font-semibold text-center text-marca border-b pb-2"
          >
            {dia}
          </div>
        ))}
        {renderCeldas()}
      </div>
    </div>
  );
}

export default GuardiasApp;
