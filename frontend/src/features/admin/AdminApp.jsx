import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { money, todayISO } from '../../lib/format';
import { turnosOcupados, esTerminado } from '../../lib/adminData';
import TurnosTab from './TurnosTab';
import AgendaTab from './AgendaTab';
import ClientesTab from './ClientesTab';
import FinanzasTab from './FinanzasTab';
import HorariosTab from './HorariosTab';
import PreciosTab from './PreciosTab';

const TABS = [
  { k: 'turnos', label: 'Turnos', icon: 'shield', eyebrow: 'Panel de control', title: 'Hola, Admin' },
  { k: 'agenda', label: 'Agenda', icon: 'cal', eyebrow: 'Agenda diaria', title: 'Próximos turnos' },
  { k: 'clientes', label: 'Clientes', icon: 'user', eyebrow: 'Clientes', title: 'Todos los usuarios' },
  { k: 'finanzas', label: 'Finanzas', icon: 'chart', eyebrow: 'Finanzas', title: 'Resumen' },
  { k: 'horarios', label: 'Horarios', icon: 'sliders', eyebrow: 'Disponibilidad', title: 'Horarios' },
  { k: 'precios', label: 'Precios', icon: 'tag', eyebrow: 'Precios', title: 'Tarifas' },
];

export default function AdminApp({ turnos, map, work, servicios, refresh, signOut, isDark, onThemeToggle }) {
  const [tab, setTab] = useState('turnos');
  const meta = TABS.find((t) => t.k === tab);

  const precios = Object.fromEntries(servicios.map((s) => [s.name, s.price]));
  const ocupados = turnosOcupados(turnos);
  const hoy = todayISO();
  const turnosHoy = ocupados.filter((t) => t.fecha === hoy).length;
  const pendientes = ocupados.filter((t) => !esTerminado(t)).length;
  const cajaHoy = ocupados.filter((t) => t.fecha === hoy).reduce((a, t) => a + (precios[t.servicio] || 0), 0);

  return (
    <div className="scroll anim-up">
      <div className="adm-top">
        <div className="logo-mark"><Icon name={meta.icon} size={22} /></div>
        <div><div className="a-eye">{meta.eyebrow}</div><h2>{meta.title}</h2></div>
        <div className="sp" />
        <button className="icon-btn" title={isDark ? 'Modo claro' : 'Modo oscuro'} onClick={onThemeToggle}>
          <Icon name={isDark ? 'sun' : 'moon'} />
        </button>
        <button className="icon-btn" title="Cerrar sesión" onClick={signOut}><Icon name="logout" /></button>
      </div>

      {tab === 'turnos' && (
        <div className="metrics">
          <div className="metric gold"><div className="m-v">{turnosHoy}</div><div className="m-l">Turnos hoy</div></div>
          <div className="metric"><div className="m-v">{pendientes}</div><div className="m-l">Pendientes</div></div>
          <div className="metric"><div className="m-v">{money(cajaHoy)}</div><div className="m-l">Caja hoy</div></div>
        </div>
      )}

      <div className="adm-tabs">
        {TABS.map((t) => (
          <button key={t.k} className={tab === t.k ? 'on' : ''} onClick={() => setTab(t.k)}>{t.label}</button>
        ))}
      </div>

      {tab === 'turnos' && <TurnosTab turnos={turnos} />}
      {tab === 'agenda' && <AgendaTab map={map} work={work} />}
      {tab === 'clientes' && <ClientesTab turnos={turnos} />}
      {tab === 'finanzas' && <FinanzasTab turnos={turnos} servicios={servicios} />}
      {tab === 'horarios' && <HorariosTab map={map} work={work} refresh={refresh} />}
      {tab === 'precios' && <PreciosTab servicios={servicios} refresh={refresh} />}
    </div>
  );
}
