import { supabase } from './supabase';
import { MASTER_SLOTS, CLOSED_WEEKDAYS, dentroDeRango } from '../config/schedule';
import { isoToDate } from './format';

/* ───────────────────────── Lectura ───────────────────────── */

export async function fetchTurnos() {
  const { data, error } = await supabase.from('turnos').select('*');
  if (error) {
    console.error('Error al traer turnos:', error);
    return [];
  }
  return data || [];
}

// { fecha: { hora: row } } para lookups O(1).
export function indexarTurnos(rows) {
  const map = {};
  for (const r of rows) {
    if (!map[r.fecha]) map[r.fecha] = {};
    map[r.fecha][r.hora] = r;
  }
  return map;
}

function esDiaCerrado(iso) {
  return CLOSED_WEEKDAYS.includes(isoToDate(iso).getDay());
}

/**
 * Estado de un slot combinando override en base + horario de trabajo.
 * Devuelve: 'ocupado' | 'bloqueado' | 'reservable'
 *   - 'ocupado'    → ya reservado por un cliente
 *   - 'bloqueado'  → no disponible (default fuera de rango, o bloqueado por el admin)
 *   - 'reservable' → libre para reservar
 */
export function clasificarSlot(map, work, fecha, hora) {
  const row = map[fecha]?.[hora];
  if (row) {
    if (row.estado === 'ocupado') return 'ocupado';
    if (row.estado === 'bloqueado') return 'bloqueado';
    if (row.estado === 'libre') return 'reservable'; // el admin lo abrió explícitamente
  }
  // Sin override: disponible solo dentro del horario de trabajo y en día abierto.
  if (work && !esDiaCerrado(fecha) && dentroDeRango(hora, work)) return 'reservable';
  return 'bloqueado';
}

// Slots reservables (libres) de un día, en orden.
export function horariosReservables(map, work, fecha) {
  return MASTER_SLOTS.filter((h) => clasificarSlot(map, work, fecha, h) === 'reservable');
}

// ¿El día tiene al menos un slot reservable? (para el puntito del calendario)
export function diaTieneCupo(map, work, fecha) {
  if (esDiaCerrado(fecha)) return false;
  return MASTER_SLOTS.some((h) => clasificarSlot(map, work, fecha, h) === 'reservable');
}

/* ───────────────────────── Escritura cliente ───────────────────────── */

export async function reservarTurno({ fecha, hora, cliente, telefono, email, servicio }) {
  const codigo = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;
  const { error } = await supabase.from('turnos').upsert(
    {
      fecha, hora, estado: 'ocupado',
      cliente: cliente || '', telefono: telefono || '',
      email: email || '', codigo, servicio: servicio || '',
    },
    { onConflict: 'fecha,hora' }
  );
  if (error) throw error;
  return codigo;
}

// Turnos reservados de un email (para "Gestionar / Cancelar" y "Mis reservas").
export async function turnosDeEmail(email) {
  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .ilike('email', email.trim())
    .eq('estado', 'ocupado');
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)
  );
}

// Libera un turno (vuelve a estado reservable).
export async function cancelarTurno(id) {
  const { error } = await supabase
    .from('turnos')
    .update({ estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '' })
    .eq('id', id);
  if (error) throw error;
}

/* ───────────────────────── Escritura admin ───────────────────────── */

// Libera (admin) un turno ocupado o bloqueado → estado 'libre'.
export async function adminLiberar(fecha, hora) {
  const { error } = await supabase.from('turnos').upsert(
    { fecha, hora, estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '' },
    { onConflict: 'fecha,hora' }
  );
  if (error) throw error;
}

// Bloquea un slot (no disponible para reservar).
export async function adminBloquear(fecha, hora) {
  const { error } = await supabase.from('turnos').upsert(
    { fecha, hora, estado: 'bloqueado', cliente: '', telefono: '', email: '', codigo: '', servicio: '' },
    { onConflict: 'fecha,hora' }
  );
  if (error) throw error;
}

// Aplica el horario de trabajo a un día: deja 'libre' los slots dentro del rango
// que no estén reservados, y 'bloqueado' los de afuera.
export async function aplicarHorarioTrabajo(fecha, work, map) {
  const updates = [];
  for (const hora of MASTER_SLOTS) {
    const row = map[fecha]?.[hora];
    if (row?.estado === 'ocupado') continue; // no tocar reservas
    const dentro = work && dentroDeRango(hora, work) && !esDiaCerrado(fecha);
    updates.push({
      fecha, hora, estado: dentro ? 'libre' : 'bloqueado',
      cliente: '', telefono: '', email: '', codigo: '', servicio: '',
    });
  }
  if (!updates.length) return;
  const { error } = await supabase.from('turnos').upsert(updates, { onConflict: 'fecha,hora' });
  if (error) throw error;
}
