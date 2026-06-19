import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { MASTER_SLOTS } from '../../config/schedule';
import { clasificarSlot, adminBloquear, adminLiberar, aplicarHorarioTrabajo } from '../../lib/turnos';
import { guardarWorkConfig } from '../../lib/scheduleConfig';
import { todayISO, formatFechaLarga } from '../../lib/format';

const HORAS = MASTER_SLOTS; // opciones para los selects de rango

export default function HorariosTab({ map, work, refresh }) {
  const [inicio, setInicio] = useState(work?.inicio || '09:00');
  const [fin, setFin] = useState(work?.fin || '20:00');
  const [fecha, setFecha] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const guardarRango = async () => {
    setBusy(true); setMsg('');
    try {
      await guardarWorkConfig({ inicio, fin });
      await refresh();
      setMsg('Horario de trabajo guardado.');
    } catch { setMsg('Error al guardar.'); }
    setBusy(false);
  };

  const aplicarAlDia = async () => {
    setBusy(true); setMsg('');
    try {
      await aplicarHorarioTrabajo(fecha, { inicio, fin }, map);
      await refresh();
      setMsg('Horario aplicado al día seleccionado.');
    } catch { setMsg('Error al aplicar.'); }
    setBusy(false);
  };

  const toggleSlot = async (hora, estado) => {
    if (estado === 'ocupado' || busy) return;
    setBusy(true);
    try {
      if (estado === 'reservable') await adminBloquear(fecha, hora);
      else await adminLiberar(fecha, hora);
      await refresh();
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="work-card">
        <div className="w-t">Horario de trabajo</div>
        <div className="w-d">Dentro de este rango los turnos quedan disponibles por defecto. Fuera, bloqueados.</div>
        <div className="range">
          <select className="r-in" value={inicio} onChange={(e) => setInicio(e.target.value)}>
            {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <span className="r-sep">→</span>
          <select className="r-in" value={fin} onChange={(e) => setFin(e.target.value)}>
            {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={guardarRango} disabled={busy}>
          <Icon name="check" /> Guardar horario de trabajo
        </button>
      </div>

      <div className="field" style={{ paddingTop: 6 }}>
        <label>Editar día puntual</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="sec-h" style={{ padding: '4px 18px 2px' }}>
        <p>{formatFechaLarga(fecha)} — tocá un slot para habilitar / bloquear.</p>
      </div>

      {msg && <div className="alert alert-ok"><Icon name="check" size={15} /> {msg}</div>}

      <div className="slot-grid">
        {MASTER_SLOTS.map((hora) => {
          const estado = clasificarSlot(map, work, fecha, hora);
          const cls = estado === 'ocupado' ? 'taken' : estado === 'reservable' ? 'on' : 'off';
          const lbl = estado === 'ocupado' ? 'Reservado' : estado === 'reservable' ? 'Disponible' : 'Bloqueado';
          return (
            <button key={hora} className={`slot ${cls}`} onClick={() => toggleSlot(hora, estado)} disabled={estado === 'ocupado'}>
              {hora}<span className="s-st">{lbl}</span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ margin: '12px 18px', width: 'calc(100% - 36px)' }} onClick={aplicarAlDia} disabled={busy}>
        <Icon name="sliders" /> Resetear día al horario de trabajo
      </button>
      <div className="h20" />
    </>
  );
}
