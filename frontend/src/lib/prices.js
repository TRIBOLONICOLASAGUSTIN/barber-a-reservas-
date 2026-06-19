import { supabase } from './supabase';
import { DEFAULT_SERVICES } from '../config/services';

// Devuelve la lista de servicios con el precio vigente desde la tabla `precios`.
// Si la tabla no existe o falla, usa los precios por defecto (la app sigue funcionando).
export async function fetchServiciosConPrecio() {
  const { data, error } = await supabase.from('precios').select('servicio, precio');
  if (error || !data) return DEFAULT_SERVICES;

  const mapa = Object.fromEntries(data.map((r) => [r.servicio, r.precio]));
  return DEFAULT_SERVICES.map((s) => ({
    ...s,
    price: mapa[s.name] ?? s.price,
  }));
}

// Mapa { nombreServicio: precio } para cálculos rápidos (finanzas, caja).
export async function fetchMapaPrecios() {
  const servicios = await fetchServiciosConPrecio();
  return Object.fromEntries(servicios.map((s) => [s.name, s.price]));
}

// Guarda/actualiza los precios. `items` = [{ servicio, precio }]
export async function guardarPrecios(items) {
  const rows = items.map((i) => ({ servicio: i.servicio, precio: i.precio }));
  const { error } = await supabase.from('precios').upsert(rows, { onConflict: 'servicio' });
  if (error) throw error;
}
