/**
 * Devuelve todos los días de un mes como objetos Date.
 * @param {number} year - Año (ej: 2025)
 * @param {number} month - Mes (0=enero, 11=diciembre)
 */
export function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

/**
 * Convierte un objeto Date a formato YYYY-MM-DD (ISO corto).
 */
export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Devuelve el nombre del mes en español.
 */
export function monthName(month) {
  const nombres = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  return nombres[month];
}
