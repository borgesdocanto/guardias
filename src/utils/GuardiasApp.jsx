import React, { useState, useEffect } from "react";
import { getMonthDays, formatDate, monthName } from "./utils/calendario";

const GuardiasApp = () => {
  const [guardias, setGuardias] = useState({});
  const [current, setCurrent] = useState(new Date());

  useEffect(() => {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    fetch(`/guardias/guardias-${year}-${month}.json`)
      .then(r => (r.ok ? r.json() : {}))
      .then(setGuardias)
      .catch(() => setGuardias({}));
  }, [current]);

  const days = getMonthDays(current.getFullYear(), current.getMonth());

  const prevMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  };

  const nextMonth = () => {
    const hoy = new Date();
    const d = new Date(current);
    const isAfter25 = hoy.getDate() >= 25;
    if (isAfter25 || d.getMonth() > hoy.getMonth() || d.getFullYear() > hoy.getFullYear()) {
      d.setMonth(d.getMonth() + 1);
      setCurrent(d);
    }
  };

  const hoy = new Date();
  const mostrarProximo = hoy.getDate() >= 25;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📅 Sistema de Guardias</h1>

      {/* Controles de mes */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ⬅️ Mes Anterior
        </button>

        <h2 className="text-xl font-semibold">
          {monthName(current.getMonth())} {current.getFullYear()}
        </h2>

        {mostrarProximo && (
          <button
            onClick={nextMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Mes Próximo ➡️
          </button>
        )}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
          <div key={d} className="font-bold text-center">
            {d}
          </div>
        ))}

        {days.map(d => {
          const iso = formatDate(d);
          const asignados = guardias[iso] || [];
          const isToday = iso === formatDate(hoy);

          return (
            <div
              key={iso}
              className={`border rounded-lg p-2 min-h-[90px] flex flex-col justify-between ${
                isToday ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
              }`}
            >
              <div className="text-sm font-semibold">
                {d.getDate()}
              </div>
              <div className="text-xs text-gray-700 mt-2 space-y-1">
                {asignados.length > 0 ? (
                  asignados.map((a, i) => <div key={i}>{a}</div>)
                ) : (
                  <span className="italic text-gray-400">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuardiasApp;
