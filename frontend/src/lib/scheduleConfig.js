import { supabase } from './supabase';

// Config global del horario de trabajo. Tabla `config_horario` con una sola fila (id=1).
// Si no hay fila configurada, devuelve null => por defecto TODO bloqueado
// hasta que el admin defina un rango de trabajo.
export async function fetchWorkConfig() {
  const { data, error } = await supabase
    .from('config_horario')
    .select('inicio, fin')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return null;
  return { inicio: data.inicio, fin: data.fin };
}

export async function guardarWorkConfig({ inicio, fin }) {
  const { error } = await supabase
    .from('config_horario')
    .upsert({ id: 1, inicio, fin }, { onConflict: 'id' });
  if (error) throw error;
}
