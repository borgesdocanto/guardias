import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { getAgentes } from "./leerSheet.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public/guardias");

// === Helpers ===
function diasEnMes(mes, año) {
  return new Date(año, mes, 0).getDate();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function obtenerFeriados(año) {
  try {
    const resp = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${año}/AR`);
    if (!resp.ok) throw new Error("API no disponible");
    const data = await resp.json();
    return data.map(f => f.date); // fechas "YYYY-MM-DD"
  } catch (err) {
    console.warn("⚠️ API de feriados no disponible, seguimos sin feriados.");
    return [];
  }
}

// === Generador ===
async function generar() {
  const sheetUrl = process.env.SHEET_URL;
  if (!sheetUrl) {
    console.error("❌ Falta SHEET_URL en secrets/env");
    process.exit(1);
  }

  const hoy = new Date();
  let mesProx = hoy.getMonth() + 2; // mes próximo (1-based)
  let añoProx = hoy.getFullYear();
  if (mesProx > 12) {
    mesProx = 1;
    añoProx++;
  }

  const agentes = await getAgentes(sheetUrl);
  if (agentes.length < 2) {
    console.error("❌ No hay agentes suficientes.");
    process.exit(1);
  }

  const feriados = await obtenerFeriados(añoProx);
  const totalDias = diasEnMes(mesProx, añoProx);

  const guardias = {};
  const diasValidos = [];

  for (let d = 1; d <= totalDias; d++) {
    const fecha = new Date(añoProx, mesProx - 1, d);
    const iso = fecha.toISOString().split("T")[0];
    const dow = fecha.getDay(); // 0=Dom,6=Sab

    if (dow === 0) continue;        // no domingos
    if (feriados.includes(iso)) continue; // no feriados

    diasValidos.push(iso);
  }

  // total guardias
  const totalGuardias = diasValidos.length * 2;
  const porAgente = Math.floor(totalGuardias / agentes.length);

  let pool = [];
  agentes.forEach(a => {
    for (let i = 0; i < porAgente; i++) pool.push(a);
  });
  // si sobran guardias, repartir extras
  while (pool.length < totalGuardias) {
    pool.push(agentes[Math.floor(Math.random() * agentes.length)]);
  }

  shuffle(pool);

  diasValidos.forEach(dia => {
    guardias[dia] = [pool.pop(), pool.pop()];
  });

  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const filePath = path.join(PUBLIC_DIR, `guardias-${añoProx}-${String(mesProx).padStart(2,"0")}.json`);
  fs.writeFileSync(filePath, JSON.stringify(guardias, null, 2));
  console.log("✅ Guardias generadas:", filePath);
}

generar();
