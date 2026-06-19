import { useMemo, useState } from 'react';
import { resumenFinanzas } from '../../lib/adminData';
import { money } from '../../lib/format';

const PERIODOS = [
  { k: 'dia', label: 'Diario' },
  { k: 'semana', label: 'Semanal' },
  { k: 'mes', label: 'Mensual' },
];
const DONUT_COLORS = ['var(--ink)', 'var(--gold)', '#bcbcc2', '#e0e0e4'];

export default function FinanzasTab({ turnos, servicios }) {
  const [period, setPeriod] = useState('mes');
  const precios = useMemo(
    () => Object.fromEntries(servicios.map((s) => [s.name, s.price])),
    [servicios]
  );
  const r = useMemo(() => resumenFinanzas(turnos, precios, period), [turnos, precios, period]);

  const maxSerie = Math.max(1, ...r.serie.map((s) => s.val));
  const reparto = r.repartoServicio.slice(0, 4);

  // conic-gradient acumulado para la dona.
  let acc = 0;
  const stops = reparto.map((s, i) => {
    const from = acc; acc += s.pct;
    return `${DONUT_COLORS[i]} ${from}% ${acc}%`;
  });
  if (acc < 100) stops.push(`#e0e0e4 ${acc}% 100%`);

  return (
    <>
      <div className="seg" style={{ margin: '6px 18px' }}>
        {PERIODOS.map((p) => (
          <button key={p.k} className={period === p.k ? 'on' : ''} onClick={() => setPeriod(p.k)}>{p.label}</button>
        ))}
      </div>

      <div className="fin-cards">
        <div className="fin-card dark">
          <div className="f-l">Facturado (completados)</div>
          <div className="f-v">{money(r.total)}</div>
          <div className="f-d">{r.completados} turnos</div>
        </div>
        <div className="fin-card">
          <div className="f-l">Turnos completados</div>
          <div className="f-v">{r.completados}</div>
        </div>
        <div className="fin-card">
          <div className="f-l">Ticket promedio</div>
          <div className="f-v">{money(r.ticket)}</div>
        </div>
        <div className="fin-card">
          <div className="f-l">Servicio top</div>
          <div className="f-v" style={{ fontSize: 14, padding: '4px 0' }}>{r.servicioTop}</div>
          <div className="f-d" style={{ color: 'var(--ink-2)' }}>{reparto[0]?.pct || 0}% del total</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <b>Ingresos {period === 'dia' ? 'por día' : period === 'semana' ? 'por semana' : 'por mes'}</b>
          <span>completados</span>
        </div>
        {r.serie.length === 0 ? (
          <div className="empty" style={{ padding: '20px 0' }}>Sin datos todavía.</div>
        ) : (
          <div className="chart">
            {r.serie.map((s, i) => (
              <div key={i} className="bar-col">
                <div className={`bar ${i === r.serie.length - 1 ? 'hot' : ''}`} style={{ height: `${Math.max(4, (s.val / maxSerie) * 100)}%` }} />
                <div className="bar-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reparto.length > 0 && (
        <div className="donut-row">
          <div className="donut" style={{ background: `conic-gradient(${stops.join(',')})` }} />
          <div className="leg">
            {reparto.map((s, i) => (
              <div key={s.name} className="leg-row">
                <span className="leg-dot" style={{ background: DONUT_COLORS[i] }} /> {s.name}
                <span className="leg-v">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="h20" />
    </>
  );
}
