import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const __dirname = path.resolve();

// ✅ URL de tu Google Sheet en CSV (usando el Secret en GitHub Actions)
const SHEET_URL = process.env.SHEET_URL;

// ✅ Archivo donde vamos a guardar las guardias
const OUTPUT_FILE = path.join(__dirname, "public", "guardias.json");
const HISTORIAL_FILE = path.join(__dirname, "public", "historial.json");

// 📅 Obtener feriados de Argentina desde API
async function getFeriados(year) {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
    if (!res.ok) throw new Error("No se pudo acceder a la API de feriados");
    const data = await res.json();
    return data.map(f => f.date);
  } catch (e) {
    console.warn("⚠️ No se pudieron cargar feriados, seguimos sin ellos.");
    return [];
  }
}

// 📋 Leer agentes desde Google Sheets
async function getAgentes() {
  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const rows = csv.split(/\r?\n/).map(r => r.split(",").map(c => c.trim()));
  rows.shift();
  
  const agentes = rows
    .filter(r => {
      const check = (r[0] || "").replace(/"/g, "").toUpperCase();
      return check && check !== "FALSE";
    })
    .map(r => r[1]?.replace(/"/g, "").trim())
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

// 📊 Cargar historial de parejas y días
function cargarHistorial() {
  if (fs.existsSync(HISTORIAL_FILE)) {
    return JSON.parse(fs.readFileSync(HISTORIAL_FILE, "utf8"));
  }
  return { parejas: {}, diasPorAgente: {} };
}

// 💾 Guardar historial
function guardarHistorial(historial) {
  fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(historial, null, 2));
}

// 🔑 Generar clave única para pareja (ordenada alfabéticamente)
function getParejaKey(agente1, agente2) {
  return [agente1, agente2].sort().join("|");
}

// 📈 Calcular score de una pareja (menor = mejor, más distribuido)
function getScorePareja(agente1, agente2, historial) {
  const key = getParejaKey(agente1, agente2);
  return historial.parejas[key] || 0;
}

// 📈 Calcular score de día para un agente (menor = mejor)
function getScoreDia(agente, diaSemana, historial) {
  if (!historial.diasPorAgente[agente]) {
    historial.diasPorAgente[agente] = {};
  }
  return historial.diasPorAgente[agente][diaSemana] || 0;
}

// 🎲 Asignar guardias con rotación inteligente
function generarGuardias(agentes, feriados, mes, anio) {
  const inicio = new Date(anio, mes, 1);
  const fin = new Date(anio, mes + 1, 0);
  const diasMes = [];
  
  // Recopilar todos los días hábiles del mes
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    const esFeriado = feriados.includes(iso);
    const diaSemana = d.getDay();
    
    if (diaSemana === 0) continue; // excluir domingos
    if (esFeriado) continue;
    
    diasMes.push(new Date(d));
  }
  
  // Cargar historial
  const historial = cargarHistorial();
  
  // Inicializar contadores del mes actual
  const guardiasDelMes = {};
  agentes.forEach(a => guardiasDelMes[a] = 0);
  
  const guardias = {};
  const agentesUsados = new Set();
  
  // Asignar guardias día por día
  diasMes.forEach(dia => {
    const fechaStr = dia.toISOString().split("T")[0];
    const diaSemana = dia.getDay();
    
    // Encontrar la mejor pareja para este día
    let mejorPareja = null;
    let mejorScore = Infinity;
    
    // Crear pool de agentes disponibles (que no trabajaron ayer)
    const disponibles = agentes.filter(a => !agentesUsados.has(a));
    
    // Si quedan menos de 2 disponibles, resetear pool
    if (disponibles.length < 2) {
      agentesUsados.clear();
      disponibles.length = 0;
      disponibles.push(...agentes);
    }
    
    // Probar todas las combinaciones posibles
    for (let i = 0; i < disponibles.length; i++) {
      for (let j = i + 1; j < disponibles.length; j++) {
        const a1 = disponibles[i];
        const a2 = disponibles[j];
        
        // Calcular score combinado:
        // 1. Cuántas veces trabajaron juntos
        const scoreParejas = getScorePareja(a1, a2, historial);
        
        // 2. Cuántas guardias llevan este mes
        const scoreEquidad = (guardiasDelMes[a1] + guardiasDelMes[a2]) * 10;
        
        // 3. Cuántas veces trabajaron este día de la semana
        const scoreDias = getScoreDia(a1, diaSemana, historial) + 
                          getScoreDia(a2, diaSemana, historial);
        
        const scoreTotal = scoreParejas + scoreEquidad + (scoreDias * 5);
        
        if (scoreTotal < mejorScore) {
          mejorScore = scoreTotal;
          mejorPareja = [a1, a2];
        }
      }
    }
    
    // Asignar la mejor pareja encontrada
    if (mejorPareja) {
      guardias[fechaStr] = mejorPareja;
      
      // Actualizar contadores
      mejorPareja.forEach(a => {
        guardiasDelMes[a]++;
        agentesUsados.add(a);
      });
      
      // Actualizar historial
      const key = getParejaKey(mejorPareja[0], mejorPareja[1]);
      historial.parejas[key] = (historial.parejas[key] || 0) + 1;
      
      mejorPareja.forEach(a => {
        if (!historial.diasPorAgente[a]) {
          historial.diasPorAgente[a] = {};
        }
        historial.diasPorAgente[a][diaSemana] = 
          (historial.diasPorAgente[a][diaSemana] || 0) + 1;
      });
    }
  });
  
  // Guardar historial actualizado
  guardarHistorial(historial);
  
  // Mostrar estadísticas
  console.log("\n📊 Estadísticas del mes:");
  agentes.forEach(a => {
    console.log(`  ${a}: ${guardiasDelMes[a]} guardias`);
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
  
  // Leer guardias existentes
  let data = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    data = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
  }
  
  // Guardar sin borrar meses anteriores
  data[`${anio}-${String(mes + 1).padStart(2, "0")}`] = guardias;
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  
  console.log(`✅ Guardias generadas para ${mes + 1}/${anio}`);
}

main();
