import { esPasado, isoToDate } from './format';

// Turnos realmente reservados por clientes.
export function turnosOcupados(rows) {
  return (rows || []).filter((t) => t.estado === 'ocupado');
}

// Divide un turno en pendiente / terminado por fecha.
export function esTerminado(t) {
  return esPasado(t.fecha, t.hora);
}

// Agrupa turnos por cliente (clave: teléfono, o email si no hay teléfono).
export function agruparPorCliente(rows) {
  const ocupados = turnosOcupados(rows);
  const map = new Map();
  for (const t of ocupados) {
    const key = (t.telefono || t.email || t.cliente || 'sin-dato').trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, { nombre: t.cliente || 'Sin nombre', telefono: t.telefono || '', email: t.email || '', turnos: [] });
    }
    map.get(key).turnos.push(t);
  }
  // Orden de turnos por día y separación pendientes/terminados.
  const lista = [...map.values()].map((u) => {
    const orden = (a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora);
    const pendientes = u.turnos.filter((t) => !esTerminado(t)).sort(orden);
    const terminados = u.turnos.filter((t) => esTerminado(t)).sort(orden);
    return { ...u, pendientes, terminados, total: u.turnos.length };
  });
  return lista.sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
}

const fmtMes = (iso) => isoToDate(iso).toLocaleString('es-ES', { month: 'short' });

// Resumen financiero de turnos COMPLETADOS (fecha pasada).
// period: 'dia' | 'semana' | 'mes'. Devuelve cards + serie para el gráfico + reparto por servicio.
export function resumenFinanzas(rows, precios, period = 'mes') {
  const completados = turnosOcupados(rows).filter(esTerminado);
  const precioDe = (servicio) => precios[servicio] ?? 0;
  const total = completados.reduce((acc, t) => acc + precioDe(t.servicio), 0);
  const ticket = completados.length ? Math.round(total / completados.length) : 0;

  // Reparto por servicio.
  const porServicio = {};
  for (const t of completados) {
    const k = t.servicio || 'Otro';
    porServicio[k] = (porServicio[k] || 0) + precioDe(t.servicio);
  }
  const repartoServicio = Object.entries(porServicio)
    .map(([name, val]) => ({ name, val, pct: total ? Math.round((val / total) * 100) : 0 }))
    .sort((a, b) => b.val - a.val);
  const servicioTop = repartoServicio[0]?.name || '—';

  // Serie temporal según período.
  const buckets = new Map();
  for (const t of completados) {
    const key = bucketKey(t.fecha, period);
    buckets.set(key.k, { label: key.label, val: (buckets.get(key.k)?.val || 0) + precioDe(t.servicio) });
  }
  const serie = [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([, v]) => v);

  return { total, ticket, completados: completados.length, servicioTop, repartoServicio, serie };
}

function bucketKey(iso, period) {
  const d = isoToDate(iso);
  if (period === 'dia') return { k: iso, label: iso.slice(8) };
  if (period === 'semana') {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return { k: `${d.getFullYear()}-W${String(week).padStart(2, '0')}`, label: `S${week}` };
  }
  return { k: iso.slice(0, 7), label: fmtMes(iso) };
}
