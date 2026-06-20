import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { agruparPorCliente } from '../../lib/adminData';
import { formatFechaCorta } from '../../lib/format';

export default function ClientesTab({ turnos }) {
  const [q, setQ] = useState('');

  const clientes = agruparPorCliente(turnos).filter((u) => {
    if (!q.trim()) return true;
    return `${u.nombre} ${u.telefono} ${u.email}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <>
      <div className="search">
        <Icon name="search" size={17} />
        <input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {clientes.length === 0 ? (
        <div className="empty">Todavía no hay clientes con turnos.</div>
      ) : clientes.map((u, i) => (
        <div key={i} className="usr">
          <div className="usr-head">
            <div className="usr-av">{((u.nombre || '?')[0] || '?').toUpperCase()}</div>
            <div className="usr-main">
              <b>{u.nombre}</b>
              <div className="u-ph"><Icon name="phone" size={12} /> {u.telefono || '—'}</div>
            </div>
            <div className="usr-count"><div className="n">{u.total}</div><div className="l">turno{u.total !== 1 ? 's' : ''}</div></div>
          </div>
          <div className="usr-turns">
            {u.pendientes.length > 0 && <>
              <div className="ut-group">Pendientes</div>
              {u.pendientes.map((t) => (
                <div key={t.id} className="ut p"><span className="ut-dot" /><div className="ut-txt"><b>{formatFechaCorta(t.fecha)}</b> <span>· {t.hora}</span></div><div className="ut-svc">{t.servicio}</div></div>
              ))}
            </>}
            {u.terminados.length > 0 && <>
              <div className="ut-group">Terminados</div>
              {u.terminados.map((t) => (
                <div key={t.id} className="ut d"><span className="ut-dot" /><div className="ut-txt"><b>{formatFechaCorta(t.fecha)}</b> <span>· {t.hora}</span></div><div className="ut-svc">{t.servicio}</div></div>
              ))}
            </>}
          </div>
        </div>
      ))}
    </>
  );
}
