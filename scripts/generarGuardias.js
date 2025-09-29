import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const __dirname = path.resolve();

// ✅ URL de tu Google Sheet en CSV (usando el Secret en GitHub Actions)
const SHEET_URL = process.env.SHEET_URL;

// ✅ Archivo donde vamos a guardar las guardias
const OUTPUT_FILE = path.join(__dirname, "public", "guardias.json");

// 📅 Obtener feriados de Argentina desde API
async function getFeriados(year) {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
    if (!res.ok) throw new Error("No se pudo acceder a la API de feriados");
    const data = await res.json();
    return data.map(f => f.date); // lista de fechas en formato YYYY-MM-DD
  } catch (e) {
    console.warn("⚠️ No se pudieron cargar feriados, seguimos sin ellos.");
    return [];
  }
}

// 📋 Leer agentes desde Google Sheets
async function getAgentes() {
  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const rows = csv.split("\n").map(r => r.split(",").map(c => c.trim()));

  rows.shift(); // quitar encabezado

  const agentes = rows
    .filter(r => {
      const check = (r[0] || "").toUpperCase();
      return check === "TRUE" || check === "SI" || check === "1"; // aceptar varias formas
    })
    .map(r => r[1]) // Col B = nombre
    .filter(Boolean);

  return agentes;
}

// 📅 Generar calendario del próximo mes
function getProximoMes() {
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  let targetMes = mes + 1;
  let targetAnio = anio;

  if (targetMes > 11) {
    targetMes = 0;
    targetAnio++;
  }

  return { mes: targetMes, anio: targetAnio };
}

// 🎲 Asignar guardias equitativas
function generarGuardias(agentes, feriados, mes, anio) {
  const inicio = new Date(anio, mes, 1);
  const fin = new Date(anio, mes + 1, 0);

  const diasMes = [];
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    const esFeriado = feriados.includes(iso);
    const diaSemana = d.getDay(); // 0=Dom, 6=Sab
    if (diaSemana === 0) continue; // excluir domingos
    if (esFeriado) continue; // excluir feriados

    diasMes.push(new Date(d));
  }

  // repartir agentes equitativamente
  let indice = 0;
  const guardias = {};

  diasMes.forEach(dia => {
    const fechaStr = dia.toISOString().split("T")[0];
    guardias[fechaStr] = [
      agentes[indice % agentes.length],
      agentes[(indice + 1) % agentes.length],
    ];
    indice += 2;
  });

  return guardias;
}

// 🚀 Main
async function main() {
  console.log("⏳ Generando guardias...");

  const { mes, anio } = getProximoMes();
  const agentes = await getAgentes();
  const feriados = await getFeriados(anio);

  if (agentes.length === 0) {
    console.error("❌ No hay agentes disponibles en el sheet");
    process.exit(1);
  }

  console.log("✅ Agentes detectados:", agentes);

  const guardias = generarGuardias(agentes, feriados, mes, anio);

  // leer guardias existentes
  let data = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    data = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
  }

  // guardar sin borrar meses anteriores
  data[`${anio}-${String(mes + 1).padStart(2, "0")}`] = guardias;

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`✅ Guardias generadas para ${mes + 1}/${anio}`);
}

main();
