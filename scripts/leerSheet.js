import fetch from "node-fetch";
import Papa from "papaparse";

/**
 * Lee los agentes desde el Google Sheet en formato CSV
 * - Columna A = checkbox (TRUE o vacío)
 * - Columna B = nombre del agente
 */
export async function getAgentes(sheetUrl) {
  const res = await fetch(sheetUrl);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: false });
  const rows = parsed.data;

  const agentes = [];
  for (let i = 1; i < rows.length; i++) {   // fila 0 es cabecera
    const row = rows[i];
    const activo = (row[0] || "").toString().toLowerCase();
    const nombre = row[1]?.trim();

    if ((activo === "true" || activo === "✅") && nombre) {
      agentes.push(nombre);
    }
  }
  return agentes;
}
