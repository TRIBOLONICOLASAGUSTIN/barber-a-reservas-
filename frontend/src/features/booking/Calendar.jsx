import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { toISO, todayISO, isoToDate, formatFechaLarga } from '../../lib/format';
import { BOOKING_WINDOW_DAYS, MASTER_SLOTS } from '../../config/schedule';
import { clasificarSlot, diaTieneCupo } from '../../lib/turnos';

const DIAS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

const diasEnMes = (y, m) => new Date(y, m + 1, 0).getDate();
const primerDia = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

export default function Calendar({ map, work, selectedDate, setSelectedDate, selectedTime, setSelectedTime }) {
  const hoy = new Date();
  const [vy, setVy] = useState(hoy.getFullYear());
  const [vm, setVm] = useState(hoy.getMonth());

  const hoyISO = todayISO();
  const limite = new Date(hoy); limite.setDate(limite.getDate() + BOOKING_WINDOW_DAYS);
  const limiteISO = toISO(limite.getFullYear(), limite.getMonth(), limite.getDate());

  const nombreMes = new Date(vy, vm, 1).toLocaleString('es-ES', { month: 'long' });
  const puedeAtras = vy > hoy.getFullYear() || vm > hoy.getMonth();
  const puedeAdel = !(vy === hoy.getFullYear() + 1 && vm >= hoy.getMonth());

  const prev = () => (vm === 0 ? (setVm(11), setVy((y) => y - 1)) : setVm((m) => m - 1));
  const next = () => (vm === 11 ? (setVm(0), setVy((y) => y + 1)) : setVm((m) => m + 1));

  const celdas = [];
  for (let i = 0; i < primerDia(vy, vm); i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes(vy, vm); d++) celdas.push(d);

  const slotsConEstado = selectedDate ? buildSlots(map, work, selectedDate) : [];
  const horarios = slotsConEstado.filter((s) => s.estado === 'libre').length;

  return (
    <div className="calwrap">
      <div className="cal-card">
        <div className="cal-nav">
          <button type="button" onClick={prev} disabled={!puedeAtras}><Icon name="chev-l" size={16} /></button>
          <b>{nombreMes} {vy}</b>
          <button type="button" onClick={next} disabled={!puedeAdel}><Icon name="chev-r" size={16} /></button>
        </div>
        <div className="cal-grid">
          {DIAS.map((d) => <div key={d} className="cal-wd">{d}</div>)}
          {celdas.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const iso = toISO(vy, vm, day);
            const pasado = iso < hoyISO;
            const fuera = iso > limiteISO;
            const cupo = !pasado && !fuera && diaTieneCupo(map, work, iso);
            const disabled = pasado || fuera || !cupo;
            const esHoy = iso === hoyISO;
            const sel = iso === selectedDate;
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => { setSelectedDate(iso); setSelectedTime(null); }}
                className={['cal-d', sel ? 'selected' : '', esHoy && !sel ? 'today' : '', disabled ? 'disabled' : ''].filter(Boolean).join(' ')}
              >
                <span>{day}</span>
                {cupo && !sel && <span className="cal-avail-dot" />}
                {cupo && sel && <span className="cal-avail-dot selected" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate ? (
        <div className="time-card anim-up">
          <div className="time-card-header">
            <div className="time-card-date">{formatFechaLarga(selectedDate)}</div>
            <div className="time-card-count">{horarios} libre{horarios !== 1 ? 's' : ''}</div>
          </div>
          {slotsConEstado.length === 0 ? (
            <div className="time-empty">No hay horarios disponibles este día.</div>
          ) : (
            <div className="time-grid">
              {slotsConEstado.map(({ hora, estado }) => {
                const ocupado = estado === 'ocupado';
                const sel = selectedTime === hora;
                return (
                  <button
                    key={hora}
                    type="button"
                    disabled={ocupado}
                    onClick={() => !ocupado && setSelectedTime(hora)}
                    className={['time-btn', ocupado ? 'booked' : '', sel ? 'selected' : ''].filter(Boolean).join(' ')}
                  >
                    {ocupado ? <span className="booked-label">RESERVADO</span> : hora}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="time-card time-empty">Seleccioná un día para ver los horarios.</div>
      )}
    </div>
  );
}

// Slots visibles del día: reservables + ocupados (los bloqueados/no disponibles se ocultan).
function buildSlots(map, work, fecha) {
  const out = [];
  for (const hora of MASTER_SLOTS) {
    const estado = clasificarSlot(map, work, fecha, hora);
    if (estado === 'reservable') out.push({ hora, estado: 'libre' });
    else if (estado === 'ocupado') out.push({ hora, estado: 'ocupado' });
  }
  return out;
}
