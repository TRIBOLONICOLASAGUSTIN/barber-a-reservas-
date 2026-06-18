import { useState } from 'react';

const PRECIO_POR_SERVICIO = {
  'Corte de pelo': 15000,
  'Perfilado de barba': 20000,
  'Barba completa': 22000,
  'Tratamiento capilar': 30000,
};

const PRECIO_DEFECTO = 15000;

const horariosTemplate = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"
];

export function ViewAdmin({ turnosPorFecha = {}, setTurnosPorFecha }) {
  const [filtro, setFiltro] = useState('todos');
  const [fechaGestion, setFechaGestion] = useState('');

  const turnosPlanos = Object.keys(turnosPorFecha).flatMap(fecha =>
    turnosPorFecha[fecha].map(t => ({ fecha, ...t }))
  ).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  const turnosOcupadosReales = turnosPlanos.filter(t => t.estado === 'ocupado' && t.cliente !== '🚫 HORARIO BLOQUEADO');
  const bloqueosTotales = turnosPlanos.filter(t => t.cliente === '🚫 HORARIO BLOQUEADO');

  const totalCaja = turnosOcupadosReales.reduce((acc, t) => {
    return acc + (PRECIO_POR_SERVICIO[t.servicio] ?? PRECIO_DEFECTO);
  }, 0);

  const turnosFiltrados = turnosPlanos.filter(t => {
    if (filtro === 'ocupados') return t.estado === 'ocupado';
    if (filtro === 'libres') return t.estado !== 'ocupado';
    return true;
  });

  const alternarEstadoHorario = (fecha, hora, accion) => {
    if (!fecha) return alert('Seleccioná una fecha primero.');
    const turnosDelDia = [...(turnosPorFecha[fecha] || [])];
    const idx = turnosDelDia.findIndex(t => t.hora === hora);

    if (accion === 'bloquear') {
      const bloqueado = { hora, estado: 'ocupado', cliente: '🚫 HORARIO BLOQUEADO', telefono: '—', email: '', codigo: `BLK-${Math.floor(1000 + Math.random() * 9000)}`, servicio: '' };
      idx !== -1 ? (turnosDelDia[idx] = bloqueado) : turnosDelDia.push(bloqueado);
    } else if (accion === 'liberar') {
      if (idx !== -1) turnosDelDia[idx] = { hora, estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '' };
    }

    setTurnosPorFecha({ ...turnosPorFecha, [fecha]: turnosDelDia });
  };

  const metrics = [
    { label: 'Turnos Reservados', value: turnosOcupadosReales.length, color: 'var(--accent)' },
    { label: 'Horarios Bloqueados', value: bloqueosTotales.length, color: 'var(--text-secondary)' },
    { label: 'Caja Estimada', value: `$${totalCaja.toLocaleString('es-AR')}`, color: 'var(--success)' },
  ];

  return (
    <div className="admin-dashboard animate-input">

      <header style={{ marginBottom: '28px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Internal Management
        </span>
        <h1 style={{ margin: '4px 0 0', color: 'var(--text-primary)', fontSize: '1.9rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Panel de Control
        </h1>
      </header>

      {/* Métricas */}
      <div className="metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className="metric-card">
            <span className="metric-label">{m.label}</span>
            <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Bloqueo rápido */}
      <section className="quickblock-section">
        <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '700' }}>
          ⚡ Bloqueo Rápido de Horarios
        </h3>
        <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          Bloqueá francos, feriados o turnos espontáneos.
        </p>
        <input
          type="date"
          value={fechaGestion}
          onChange={(e) => setFechaGestion(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}
        />
        {fechaGestion && (
          <div className="quickblock-grid">
            {horariosTemplate.map(hora => {
              const turnoExistente = turnosPorFecha[fechaGestion]?.find(t => t.hora === hora);
              const esBloqueo = turnoExistente?.cliente === '🚫 HORARIO BLOQUEADO';
              const esOcupado = turnoExistente?.estado === 'ocupado';
              return (
                <div key={hora} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{hora}</span>
                  {esBloqueo ? (
                    <button type="button" onClick={() => alternarEstadoHorario(fechaGestion, hora, 'liberar')}
                      style={{ width: '100%', background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', fontFamily: 'var(--font)' }}>
                      🔓 Desbloquear
                    </button>
                  ) : esOcupado ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>👤 Reservado</span>
                  ) : (
                    <button type="button" onClick={() => alternarEstadoHorario(fechaGestion, hora, 'bloquear')}
                      style={{ width: '100%', background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', fontFamily: 'var(--font)' }}>
                      🚫 Bloquear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filtros */}
      <div className="filter-bar">
        {['todos', 'ocupados', 'libres'].map(f => (
          <button key={f} type="button" onClick={() => setFiltro(f)} style={{
            padding: '7px 16px', borderRadius: '50px', border: '1px solid var(--border)',
            background: filtro === f ? 'var(--accent)' : 'var(--bg-card)',
            color: filtro === f ? '#000' : 'var(--text-secondary)',
            fontWeight: filtro === f ? '700' : '500',
            cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.83rem',
            transition: 'all 0.2s', fontFamily: 'var(--font)'
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {['Fecha', 'Hora', 'Estado', 'Cliente', 'Servicio', 'Código', 'Acción'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay registros disponibles.
                </td>
              </tr>
            ) : turnosFiltrados.map((t, i) => {
              const esOcupado = t.estado === 'ocupado';
              const esBloqueo = t.cliente === '🚫 HORARIO BLOQUEADO';
              return (
                <tr key={`${t.fecha}-${t.hora}-${i}`}>
                  <td style={{ fontWeight: '600' }}>{t.fecha}</td>
                  <td>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.83rem' }}>{t.hora}</span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                      background: esBloqueo ? 'var(--danger-soft)' : esOcupado ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                      color: esBloqueo ? 'var(--danger)' : esOcupado ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {esBloqueo ? 'Bloqueado' : esOcupado ? 'Ocupado' : 'Disponible'}
                    </span>
                  </td>
                  <td>
                    {esOcupado ? (
                      <div>
                        <strong style={{ color: esBloqueo ? 'var(--danger)' : 'var(--text-primary)', display: 'block' }}>{t.cliente}</strong>
                        {!esBloqueo && <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>📞 {t.telefono || '—'}</span>}
                      </div>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{t.servicio || '—'}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.8rem' }}>{t.codigo || '—'}</td>
                  <td>
                    {esOcupado ? (
                      <button type="button" onClick={() => alternarEstadoHorario(t.fecha, t.hora, 'liberar')}
                        style={{ background: 'var(--danger-soft)', border: '1px solid rgba(255,69,58,0.25)', color: 'var(--danger)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: '700', transition: 'all 0.2s', fontFamily: 'var(--font)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-soft)'; e.currentTarget.style.color = 'var(--danger)'; }}>
                        Liberar
                      </button>
                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
