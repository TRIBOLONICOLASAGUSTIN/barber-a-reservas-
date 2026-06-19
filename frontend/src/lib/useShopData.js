import { useState, useEffect, useCallback } from 'react';
import { fetchTurnos, indexarTurnos } from './turnos';
import { fetchWorkConfig } from './scheduleConfig';
import { fetchServiciosConPrecio } from './prices';
import { DEFAULT_SERVICES } from '../config/services';

// Estado compartido: turnos, horario de trabajo y servicios con precio.
export function useShopData() {
  const [turnos, setTurnos] = useState([]);
  const [work, setWork] = useState(null);
  const [servicios, setServicios] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [t, w, s] = await Promise.all([
        fetchTurnos(),
        fetchWorkConfig(),
        fetchServiciosConPrecio(),
      ]);
      setTurnos(t);
      setWork(w);
      setServicios(s);
    } catch (err) {
      console.error('No se pudieron cargar los datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Tope de seguridad: si el backend no responde, no dejamos al usuario
    // atrapado en el spinner — mostramos la app con los datos por defecto.
    const t = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(t);
  }, [refresh]);

  return { turnos, map: indexarTurnos(turnos), work, servicios, loading, refresh };
}
