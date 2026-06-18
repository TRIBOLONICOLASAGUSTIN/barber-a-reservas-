import { useState } from 'react';

const DIAS_SEMANA = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

const HORARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDiasEnMes(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getPrimerDiaDelMes(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function formatDiaLargo(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const fecha = new Date(Number(y), Number(m) - 1, Number(d));
  const mes = fecha.toLocaleString('es-ES', { month: 'long' });
  return `${Number(d)} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
}

export default function CalendarSelector({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, turnosPorFecha = {} }) {
  const hoy = new Date();
  const [viewYear, setViewYear]   = useState(hoy.getFullYear());
  const [viewMonth, setViewMonth] = useState(hoy.getMonth());

  const diasEnMes  = getDiasEnMes(viewYear, viewMonth);
  const primerDia  = getPrimerDiaDelMes(viewYear, viewMonth);
  const hoyISO     = toISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + 90);
  const limiteISO = toISO(limite.getFullYear(), limite.getMonth(), limite.getDate());

  const nombreMes       = new Date(viewYear, viewMonth, 1).toLocaleString('es-ES', { month: 'long' });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  const puedeRetroceder = viewYear > hoy.getFullYear() || viewMonth > hoy.getMonth();
  const puedeAvanzar    = !(viewYear === hoy.getFullYear() + 1 && viewMonth >= hoy.getMonth());

  const handlePrevMes = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNextMes = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  // Cuenta horarios libres para un día (para mostrar el punto de disponibilidad)
  const getLibres = (iso) => {
    const turnosDelDia = turnosPorFecha[iso] || [];
    const ocupados     = turnosDelDia.filter(t => t.estado === 'ocupado').length;
    return HORARIOS.length - ocupados;
  };

  // Horarios para el día seleccionado
  const horariosDelDia = selectedDate
    ? HORARIOS.map(time => {
        const turno   = turnosPorFecha[selectedDate]?.find(t => t.hora === time);
        const ocupado = turno?.estado === 'ocupado';
        return { time, ocupado };
      })
    : [];

  const libresHoy = selectedDate ? horariosDelDia.filter(h => !h.ocupado).length : 0;

  return (
    <div className="cal-wrapper">

      {/* ── Navegación de mes ── */}
      <div className="cal-card">
        <div className="cal-nav">
          <button type="button" className="cal-nav-btn" onClick={handlePrevMes} disabled={!puedeRetroceder}>‹</button>
          <span className="cal-nav-title">{mesCapitalizado} {viewYear}</span>
          <button type="button" className="cal-nav-btn" onClick={handleNextMes} disabled={!puedeAvanzar}>›</button>
        </div>

        {/* ── Cabecera días semana ── */}
        <div className="cal-grid">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}

          {celdas.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;

            const iso       = toISO(viewYear, viewMonth, day);
            const diaSemana = new Date(viewYear, viewMonth, day).getDay();
            const esDomingo = diaSemana === 0;
            const esPasado  = iso < hoyISO;
            const fueraRango= iso > limiteISO;
            const disabled  = esDomingo || esPasado || fueraRango;
            const esHoy     = iso === hoyISO;
            const seleccionado = iso === selectedDate;

            // Punto de disponibilidad (solo días activos con al menos 1 libre)
            const tieneLibres = !disabled && getLibres(iso) > 0;

            return (
              <button
                type="button"
                key={iso}
                disabled={disabled}
                onClick={() => { setSelectedDate(iso); setSelectedTime(null); }}
                className={[
                  'cal-day-btn',
                  seleccionado ? 'selected' : '',
                  esHoy && !seleccionado ? 'today' : '',
                  disabled ? 'disabled' : '',
                ].filter(Boolean).join(' ')}
              >
                <span className="cal-day-num">{day}</span>
                {tieneLibres && !disabled && (
                  <span className={`cal-avail-dot ${seleccionado ? 'selected' : ''}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Horarios: siempre visible en desktop como placeholder ── */}
      {selectedDate ? (
        <div className="time-card animate-input">
          <div className="time-card-header">
            <div>
              <p className="time-card-date">{formatDiaLargo(selectedDate)}</p>
              <p className="time-card-count">{libresHoy} horario{libresHoy !== 1 ? 's' : ''} disponible{libresHoy !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="time-grid">
            {horariosDelDia.map(({ time, ocupado }) => {
              const selec = selectedTime === time;
              return (
                <button
                  type="button"
                  key={time}
                  disabled={ocupado}
                  onClick={() => !ocupado && setSelectedTime(time)}
                  className={[
                    'time-btn',
                    ocupado ? 'booked' : '',
                    selec   ? 'selected' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {ocupado
                    ? <span className="booked-label">RESERVADO</span>
                    : time}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="time-card time-card-empty">
          <p className="time-card-empty-msg">← Seleccioná un día para ver los horarios disponibles</p>
        </div>
      )}
    </div>
  );
}
