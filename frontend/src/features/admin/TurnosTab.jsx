import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { iconForService } from '../../config/services';
import { formatFechaCorta } from '../../lib/format';
import { turnosOcupados, esTerminado } from '../../lib/adminData';

export default function TurnosTab({ turnos }) {
  const [q, setQ] = useState('');

  const lista = turnosOcupados(turnos)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))
    .filter((t) => {
      if (!q.trim()) return true;
      const s = `${t.cliente} ${t.telefono} ${t.servicio}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });

  return (
    <>
      <div className="search">
        <Icon name="search" size={17} />
        <input placeholder="Buscar nombre, teléfono o servicio…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {lista.length === 0 ? (
        <div className="empty">No hay turnos reservados.</div>
      ) : lista.map((t) => {
        const done = esTerminado(t);
        return (
          <div key={t.id} className="res">
            <div className="res-ic"><Icon name={iconForService(t.servicio)} size={21} /></div>
            <div className="res-main">
              <b>{t.cliente || 'Sin nombre'}</b>
              <span>{formatFechaCorta(t.fecha)} · {t.hora} · {t.servicio || '—'}</span>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Icon name="phone" size={11} /> {t.telefono || '—'}
              </div>
            </div>
            <span className={`res-tag ${done ? 'res-done' : 'res-pend'}`}>{done ? 'Terminado' : 'Pendiente'}</span>
          </div>
        );
      })}
    </>
  );
}
