import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import StepIndicator from './StepIndicator';
import Calendar from './Calendar';
import { SHOP } from '../../config/shop';
import { iconForService } from '../../config/services';
import { formatFechaLarga, formatFechaCorta, money, esPasado } from '../../lib/format';
import { reservarTurno, turnosDeEmail, cancelarTurno } from '../../lib/turnos';

const CHIPS = [
  { icon: 'scissors', label: 'Cortes' },
  { icon: 'beard', label: 'Barba' },
  { icon: 'combo', label: 'Combo' },
  { icon: 'spray', label: 'Tratamientos' },
];

export default function ClientApp({ map, work, servicios, refresh, session, onAdminClick }) {
  const [step, setStep] = useState('landing'); // landing|services|datetime|contact|confirmed|manage
  const [service, setService] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [confirmed, setConfirmed] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep('landing'); setService(null); setDate(null); setTime(null);
    setForm({ name: '', phone: '', email: '' }); setConfirmed(null);
  };

  const confirmar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reservarTurno({
        fecha: date, hora: time, cliente: form.name,
        telefono: form.phone, email: form.email, servicio: service.name,
      });
      setConfirmed({ service, date, time });
      setStep('confirmed');
      await refresh();
    } catch (err) {
      alert('No se pudo reservar. Intentá de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ───── LANDING ───── */
  if (step === 'landing') {
    return (
      <div className="scroll anim-up">
        <div className="brandbar">
          <div className="logo-mark"><Icon name="scissors" size={23} /></div>
          <div>
            <div className="brand-name">{SHOP.nombre}</div>
            <div className="brand-tag">{SHOP.rubro}</div>
          </div>
          <div className="brand-spacer" />
          <button className="icon-btn" title="Admin" onClick={onAdminClick}><Icon name="shield" /></button>
        </div>

        <div className="hero">
          <img src={SHOP.heroImg} alt="Barbería" />
          <div className="hero-grad" />
          <div className="hero-badge"><Icon name="star" size={13} /> +10 años</div>
          <div className="hero-txt">
            <h1>Tu mejor versión<br />empieza acá</h1>
            <p>Cortes y barba con turno previo · Sevilla</p>
          </div>
        </div>

        <div className="chips">
          {CHIPS.map((c) => (
            <div key={c.label} className="chip"><Icon name={c.icon} size={15} /> {c.label}</div>
          ))}
        </div>

        <div className="info-list">
          <div className="info-row"><Icon name="pin" /><span>{SHOP.ubicacion}</span></div>
          <div className="info-row"><Icon name="clock" /><span>{SHOP.horariosTexto}</span></div>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => setStep('services')}>
            <Icon name="cal" /> Agendar reserva
          </button>
          <button className="btn btn-ghost" onClick={() => setStep('manage')}>
            <Icon name="x" /> Gestionar / Cancelar
          </button>
        </div>
        <footer className="app-footer">© {SHOP.nombre}</footer>
      </div>
    );
  }

  /* ───── SERVICIOS ───── */
  if (step === 'services') {
    return (
      <div className="scroll anim-up">
        <StepIndicator currentStep={1} />
        <div className="step-header">
          <button className="icon-btn" onClick={reset}><Icon name="chev-l" /></button>
          <div className="sec-h" style={{ padding: '0' }}>
            <span className="eyebrow">Paso 1</span>
            <h2>Elegí tu servicio</h2>
          </div>
        </div>
        <div className="svc-grid">
          {servicios.map((s) => {
            const sel = service?.id === s.id;
            return (
              <button key={s.id} type="button" className={`svc ${sel ? 'sel' : ''}`}
                onClick={() => setService(sel ? null : s)}>
                {sel && <span className="svc-check"><Icon name="check" size={12} /></span>}
                <div className="svc-ic"><Icon name={s.icon} size={23} /></div>
                <div className="svc-name">{s.name}</div>
                <div className="svc-meta">{s.duration}{s.combo ? ' · combo' : ''}</div>
                <div className="svc-price">{money(s.price)}</div>
              </button>
            );
          })}
        </div>
        <div className="dock">
          <button className="btn" disabled={!service}
            onClick={() => { setDate(null); setTime(null); setStep('datetime'); }}>
            <Icon name="chev-r" /> {service ? `Continuar con ${service.name}` : 'Seleccioná un servicio'}
          </button>
        </div>
      </div>
    );
  }

  /* ───── FECHA / HORA ───── */
  if (step === 'datetime') {
    return (
      <div className="scroll anim-up">
        <StepIndicator currentStep={2} />
        <div className="step-header">
          <button className="icon-btn" onClick={() => setStep('services')}><Icon name="chev-l" /></button>
          <div className="step-header-info">
            <span className="step-service-name"><Icon name={service.icon} size={15} /> {service.name}</span>
            <span className="step-service-time">{service.duration} · {money(service.price)}</span>
          </div>
        </div>
        <Calendar map={map} work={work}
          selectedDate={date} setSelectedDate={setDate}
          selectedTime={time} setSelectedTime={setTime} />
        <div className="dock">
          <button className="btn" disabled={!date || !time} onClick={() => setStep('contact')}>
            <Icon name="chev-r" /> {date && time ? `Continuar — ${time} hs` : 'Seleccioná día y horario'}
          </button>
        </div>
      </div>
    );
  }

  /* ───── DATOS ───── */
  if (step === 'contact') {
    return (
      <form className="scroll anim-up" onSubmit={confirmar}>
        <StepIndicator currentStep={3} />
        <div className="step-header">
          <button type="button" className="icon-btn" onClick={() => setStep('datetime')}><Icon name="chev-l" /></button>
          <div className="sec-h" style={{ padding: 0 }}>
            <span className="eyebrow">Paso 3</span>
            <h2>Tus datos</h2>
          </div>
        </div>
        <div className="summary">
          <Icon name={service.icon} />
          <span className="s-txt">{service.name} · {formatFechaCorta(date)} · {time} hs</span>
          <span className="s-price">{money(service.price)}</span>
        </div>
        <div className="field">
          <label>Nombre completo</label>
          <input required value={form.name} placeholder="Ej. Alexander Wright"
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input required type="tel" value={form.phone} placeholder="+34 600 00 00 00"
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field">
          <label>Email</label>
          <input required type="email" value={form.email} placeholder="tu-correo@example.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="dock">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : <><Icon name="check" /> Confirmar reserva — {money(service.price)}</>}
          </button>
        </div>
      </form>
    );
  }

  /* ───── CONFIRMACIÓN (datos del turno, sin código) ───── */
  if (step === 'confirmed' && confirmed) {
    return (
      <div className="scroll anim-pop">
        <div className="confirmed">
          <div className="conf-ic"><Icon name="check" size={32} /></div>
          <h2>¡Turno confirmado!</h2>
          <p className="c-sub">Te esperamos. Estos son los datos de tu reserva.</p>
          <div className="ticket">
            <div className="ticket-top">
              <div className="t-ic"><Icon name={confirmed.service.icon} size={23} /></div>
              <div><b>{confirmed.service.name}</b><span>{SHOP.nombre}</span></div>
            </div>
            <div className="ticket-rows">
              <div className="t-row"><span className="t-k"><Icon name="cal" size={15} /> Fecha</span><span className="t-v">{formatFechaLarga(confirmed.date)}</span></div>
              <div className="t-row"><span className="t-k"><Icon name="clock" size={15} /> Hora</span><span className="t-v">{confirmed.time} hs</span></div>
              <div className="t-row"><span className="t-k"><Icon name="pin" size={15} /> Lugar</span><span className="t-v">Constitución 45</span></div>
              <div className="t-row"><span className="t-k"><Icon name="money" size={15} /> Total</span><span className="t-v">{money(confirmed.service.price)}</span></div>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} onClick={reset}>
            <Icon name="chev-l" /> Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  /* ───── GESTIONAR / CANCELAR (por email) ───── */
  if (step === 'manage') {
    return <ManageCancel onBack={reset} refresh={refresh} prefillEmail={session?.user?.email || ''} />;
  }

  return null;
}

/* ════════════ Sub-vista: gestionar / cancelar por email ════════════ */
function ManageCancel({ onBack, refresh, prefillEmail }) {
  const [email, setEmail] = useState(prefillEmail);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const buscar = async () => {
    if (!email.trim()) return;
    setLoading(true); setMsg('');
    const data = await turnosDeEmail(email);
    setItems(data);
    setLoading(false);
  };

  const cancelar = async (t) => {
    await cancelarTurno(t.id);
    setItems((prev) => prev.filter((x) => x.id !== t.id));
    setMsg(`Turno del ${formatFechaCorta(t.fecha)} a las ${t.hora} hs cancelado.`);
    refresh();
  };

  return (
    <div className="scroll anim-up">
      <div className="brandbar">
        <button className="icon-btn" onClick={onBack}><Icon name="chev-l" /></button>
        <div className="brand-name" style={{ marginLeft: 4 }}>Gestionar / Cancelar</div>
      </div>
      <div className="sec-h" style={{ paddingTop: 4 }}>
        <p>Ingresá tu email para ver y cancelar tus turnos.</p>
      </div>
      <div className="field">
        <label>Tu email</label>
        <div style={{ display: 'flex', gap: 9 }}>
          <input style={{ flex: 1 }} type="email" value={email} placeholder="tu-correo@example.com"
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscar()} />
          <button className="btn btn-sm" style={{ width: 'auto', padding: '0 16px' }} onClick={buscar} disabled={loading}>
            {loading ? <span className="spinner" /> : <Icon name="search" />}
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-ok"><Icon name="check" size={15} /> {msg}</div>}

      {items !== null && (
        items.length === 0 ? (
          <div className="empty">No encontramos turnos activos con ese email.</div>
        ) : (
          <>
            <div className="sec-h" style={{ padding: '14px 20px 2px' }}>
              <span className="eyebrow">{items.length} turno{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}</span>
            </div>
            {items.map((t) => (
              <div key={t.id} className="res">
                <div className="res-ic"><Icon name={iconForService(t.servicio)} size={21} /></div>
                <div className="res-main">
                  <b>{formatFechaLarga(t.fecha)} · {t.hora}</b>
                  <span>{t.servicio || 'Turno'}{esPasado(t.fecha, t.hora) ? ' · terminado' : ''}</span>
                </div>
                {!esPasado(t.fecha, t.hora) && (
                  <button className="res-cancel" title="Cancelar" onClick={() => cancelar(t)}><Icon name="x" size={15} /></button>
                )}
              </div>
            ))}
          </>
        )
      )}
    </div>
  );
}
