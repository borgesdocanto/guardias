// src/GuardiasApp.jsx
import React, { useState, useEffect } from "react";

function GuardiasApp() {
  const [guardias, setGuardias] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch("/guardias.json")
      .then((res) => res.json())
      .then((data) => setGuardias(data));
  }, []);

  const formatMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const renderCalendar = () => {
    const monthKey = formatMonthKey(currentMonth);
    const monthData = guardias[monthKey] || {};
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    // ¿En qué día empieza el mes? (0=Domingo, 1=Lunes...)
    const startDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    // Ajustamos para que arranque en Lunes (ISO)
    const offset = startDay === 0 ? 6 : startDay - 1;

    const weeks = [];
    let week = [];

    // huecos antes del día 1
    for (let i = 0; i < offset; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
      week.push({ day, guardias: monthData[dateKey] || [] });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // completar con huecos al final
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center mb-4">
          {currentMonth.toLocaleString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="grid grid-cols-7 text-center font-semibold">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
          <div>Dom</div>
        </div>
        {weeks.map((w, i) => (
          <div key={i} className="grid grid-cols-7 border-t">
            {w.map((d, j) => (
              <div
                key={j}
                className="h-24 border p-1 text-sm flex flex-col items-start"
              >
                {d ? (
                  <>
                    <span className="font-bold text-gray-700">{d.day}</span>
                    <div className="text-xs mt-1 space-y-0.5">
                      {d.guardias.length > 0
                        ? d.guardias.map((g, idx) => (
                            <div key={idx} className="truncate">
                              {g}
                            </div>
                          ))
                        : "-"}
                    </div>
                  </>
                ) : (
                  <span className="text-gray-300">.</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Sistema de Guardias</h1>
      <div className="flex justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          ◀ Mes Anterior
        </button>
        <button
          onClick={handleNextMonth}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Mes Siguiente ▶
        </button>
      </div>
      {renderCalendar()}
    </div>
  );
}

export default GuardiasApp;
