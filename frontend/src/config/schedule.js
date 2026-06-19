// Configuración de la grilla de horarios.

// Genera slots cada `stepMin` minutos entre dos horas "HH:MM".
function generarSlots(desde, hasta, stepMin = 30) {
  const [h0, m0] = desde.split(':').map(Number);
  const [h1, m1] = hasta.split(':').map(Number);
  const out = [];
  let t = h0 * 60 + m0;
  const fin = h1 * 60 + m1;
  while (t <= fin) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
    t += stepMin;
  }
  return out;
}

// Grilla maestra: todos los slots posibles del día.
export const MASTER_SLOTS = generarSlots('08:00', '20:30', 30);

// Horario de trabajo por defecto (si no hay config en la base).
export const DEFAULT_WORK = { inicio: '09:00', fin: '20:00' };

// Días cerrados (0 = domingo, según Date.getDay()).
export const CLOSED_WEEKDAYS = [0];

// Ventana de reservas hacia adelante (días).
export const BOOKING_WINDOW_DAYS = 90;

// ¿La hora HH:MM está dentro del rango de trabajo [inicio, fin)?
export function dentroDeRango(hora, work) {
  if (!work) return false;
  return hora >= work.inicio && hora < work.fin;
}
