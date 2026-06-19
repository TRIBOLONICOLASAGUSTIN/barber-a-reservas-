import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { MASTER_SLOTS } from '../../config/schedule';
import { clasificarSlot } from '../../lib/turnos';
import { todayISO, toISO, isoToDate, formatFechaLarga } from '../../lib/format';

export default function AgendaTab({ map, work }) {
  const [fecha, setFecha] = useState(todayISO());

  const shift = (delta) => {
    const d = isoToDate(fecha);
    d.setDate(d.getDate() + delta);
    setFecha(toISO(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const slots = MASTER_SLOTS
    .map((hora) => ({ hora, estado: clasificarSlot(map, work, fecha, hora), row: map[fecha]?.[hora] }))
    .filter((s) => s.estado === 'ocupado' || s.estado === 'reservable');

  return (
    <>
      <div className="day-head">
        <b>{formatFechaLarga(fecha)}</b>
        <div className="nav">
          <button onClick={() => shift(-1)}><Icon name="chev-l" size={14} /></button>
          <button onClick={() => shift(1)}><Icon name="chev-r" size={14} /></button>
        </div>
      </div>
      {slots.length === 0 ? (
        <div className="empty">Sin horarios habilitados este día.</div>
      ) : (
        <div className="tl">
          {slots.map(({ hora, estado, row }) => (
            <div key={hora} className="tl-row">
              <div className="tl-time">{hora}</div>
              <div className="tl-body">
                {estado === 'ocupado' ? (
                  <div className="tl-card busy">
                    <b>{row.cliente || 'Reservado'}</b>
                    <div className="c-svc">{row.servicio || '—'}</div>
                    {row.telefono && <div className="c-ph"><Icon name="phone" size={12} /> {row.telefono}</div>}
                  </div>
                ) : (
                  <div className="tl-card free"><span className="tl-free-lbl">Libre</span></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
