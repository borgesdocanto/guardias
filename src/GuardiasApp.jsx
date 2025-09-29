import React, { useEffect, useState } from "react";

// URL pública de Google Sheets en CSV (ya configurada con tu secret si corresponde)
const SHEET_URL = import.meta.env.VITE_SHEET_URL;

export default function GuardiasApp() {
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgentes() {
      try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        const rows = text.split("\n").slice(1); // salteamos encabezado
        const activos = rows
          .map((row) => {
            const cols = row.split(",");
            const haceGuardia = cols[0]?.trim().toLowerCase() === "true";
            const nombre = cols[1]?.trim();
            return haceGuardia && nombre ? nombre : null;
          })
          .filter(Boolean);
        setAgentes(activos);
      } catch (err) {
        console.error("Error cargando agentes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgentes();
  }, []);

  if (loading) return <p className="text-gray-600">Cargando agentes...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-600">
        Sistema de Guardias
      </h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {agentes.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No hay agentes activos
          </p>
        ) : (
          agentes.map((a, i) => (
            <li
              key={i}
              className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center text-indigo-800 font-medium"
            >
              {a}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
