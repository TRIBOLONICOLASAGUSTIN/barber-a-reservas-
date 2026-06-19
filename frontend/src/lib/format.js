// Utilidades de fecha y formato.

export function todayISO() {
  const d = new Date();
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// "2026-06-18" -> Date local (sin desfase de zona horaria)
export function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "Miércoles 18 de junio"
export function formatFechaLarga(iso) {
  if (!iso) return '';
  const f = isoToDate(iso);
  const dia = f.toLocaleString('es-ES', { weekday: 'long' });
  const mes = f.toLocaleString('es-ES', { month: 'long' });
  return `${cap(dia)} ${f.getDate()} de ${mes}`;
}

// "18/06"
export function formatFechaCorta(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// 15000 -> "$15.000"
export function money(n) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`;
}

// "$15.000" o "15.000" -> 15000
export function parseMoney(str) {
  const digits = String(str).replace(/[^\d]/g, '');
  return Number(digits) || 0;
}

// ¿La fecha+hora ya pasó? (turno terminado)
export function esPasado(iso, hora) {
  const [y, m, d] = iso.split('-').map(Number);
  const [hh, mm] = (hora || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm) < new Date();
}
