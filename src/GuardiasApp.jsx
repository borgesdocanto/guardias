import React, { useEffect, useState } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState({});
  const [fecha, setFecha] = useState(new Date());
  const hoy = new Date();

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

  // Detectar si es hoy
  const esHoy = (d) => {
    return (
      d === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  };

  // Detectar si es feriado
  const esFeriado = (guardiasDia) => {
    return guardiasDia.length > 0 && guardiasDia[0].startsWith("Feriado:");
  };

  const renderCeldas = () => {
    const celdas = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      celdas.push(
        <div
          key={`empty-${i}`}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"
        />
      );
    }

    for (let d = 1; d <= diasMes; d++) {
      const claveDia = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const guardiasDia = guardiasMes[claveDia] || [];
      const isFeriado = esFeriado(guardiasDia);
      const isToday = esHoy(d);

      celdas.push(
        <div
          key={d}
          className={`relative min-h-[140px] p-4 rounded-xl transition-all duration-300 flex flex-col group ${
            isToday
              ? "bg-gradient-to-br from-marca/20 to-marca/10 border-2 border-marca shadow-lg ring-2 ring-marca/30"
              : isFeriado
              ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md hover:shadow-xl"
              : "bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-marca/30"
          }`}
        >
          {/* Indicador de hoy */}
          {isToday && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-marca rounded-full animate-pulse"></div>
          )}

          {/* Número del día */}
          <div
            className={`font-bold text-lg mb-3 flex items-center gap-2 ${
              isToday
                ? "text-marca"
                : isFeriado
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {d}
            {isToday && (
              <span className="text-xs px-2 py-0.5 bg-marca text-white rounded-full font-semibold">
                HOY
              </span>
            )}
          </div>

          {/* Guardias */}
          <div className="flex flex-col gap-2 flex-1">
            {guardiasDia.length > 0 ? (
              guardiasDia.map((g, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isFeriado
                      ? "bg-white/15 text-white backdrop-blur-sm"
                      : isToday
                      ? "bg-marca/25 text-marca font-semibold border border-marca/50"
                      : "bg-gray-50 text-gray-700 border border-gray-200 group-hover:bg-marca/10 group-hover:text-marca"
                  }`}
                >
                  {isFeriado ? g.replace("Feriado: ", "") : g}
                </div>
              ))
            ) : (
              <span
                className={`text-xs ${
                  isFeriado ? "text-white/40" : "text-gray-300"
                }`}
              >
                —
              </span>
            )}
          </div>
        </div>
      );
    }

    return celdas;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col items-center p-6 md:p-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
          Sistema de <span className="text-marca">Guardias</span>
        </h1>
        <p className="text-gray-500 text-base md:text-lg">Calendario de turnos y rotaciones</p>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between gap-4 w-full max-w-6xl mb-8 flex-wrap">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-2 bg-marca/10 text-marca px-5 py-3 rounded-lg border border-marca/30 hover:bg-marca/20 hover:border-marca/50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
        >
          <span className="text-xl">←</span> Anterior
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize whitespace-nowrap">
          {fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
          })}
        </h2>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-2 bg-marca/10 text-marca px-5 py-3 rounded-lg border border-marca/30 hover:bg-marca/20 hover:border-marca/50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
        >
          Siguiente <span className="text-xl">→</span>
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 mb-8 text-sm text-gray-600 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-marca rounded-full animate-pulse"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-900 rounded"></div>
          <span>Feriado</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
          {diasSemana.map((dia, i) => (
            <div
              key={i}
              className="p-4 font-bold text-center text-marca bg-gray-50 border-r border-gray-200 last:border-r-0 text-sm md:text-base"
            >
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3 p-4 md:p-6 bg-gradient-to-b from-white to-gray-50">
          {renderCeldas()}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
      </div>
    </div>
  );
}

export default GuardiasApp;
