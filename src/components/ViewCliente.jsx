import { useState } from 'react';
import { supabase } from '../Backend/supabaseClient';
import CalendarSelector from './CalendarSelector';
import ServiceSelector from './ServiceSelector';
import StepIndicator from './StepIndicator';

export const SERVICIOS = [
  { id: 1, name: 'Corte de pelo',       price: '$15.000', priceNum: 15000, duration: '30 min', icon: '✂️' },
  { id: 2, name: 'Perfilado de barba',  price: '$20.000',   priceNum: 20000,  duration: '20 min', icon: '🪒' },
  { id: 3, name: 'Barba completa',      price: '$22.000', priceNum: 22000, duration: '30 min', icon: '🧔' },
  { id: 4, name: 'Tratamiento capilar', price: '$30.000', priceNum: 30000, duration: '45 min', icon: '💆' },
];

const CONFIG = {
  nombre: 'The Gents Barber',
  rubro: 'Barbería & Estilo Masculino',
  descripcion: 'Somos una barbería profesional con más de 10 años de experiencia. Especialistas en cortes modernos y clásicos, perfilado de barba y tratamientos capilares. Atendemos con turno previo para brindarte la mejor experiencia.',
  ubicacion: 'Av. de la Constitución 45, Sevilla, España',
  horariosSemana: 'Lunes a Viernes: 09:00 – 20:00 hs',
  horariosSabado: 'Sábados: 09:00 – 14:00 hs',
};

const HIGHLIGHTS = [
  { icon: '✂️', label: 'Cortes' },
  { icon: '🪒', label: 'Barba' },
  { icon: '💆', label: 'Tratamientos' },
  { icon: '⭐', label: '+10 años' },
];

const HORARIOS_DEFAULT = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00',
];

function formatFecha(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const fecha = new Date(Number(y), Number(m) - 1, Number(d));
  const dia = fecha.toLocaleString('es-ES', { weekday: 'long' });
  const mes = fecha.toLocaleString('es-ES', { month: 'long' });
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${d} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
}

export default function ViewCliente({ turnosPorFecha, setTurnosPorFecha, onRefrescar, session, onIrALogin, onLogout }) {
  const [step, setStep] = useState('landing');
  const [activeTab, setActiveTab] = useState('agendar');

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate,    setSelectedDate]    = useState(null);
  const [selectedTime,    setSelectedTime]    = useState(null);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });
  const [confirmedData, setConfirmedData] = useState(null);

  const [codigoCancelacion, setCodigoCancelacion] = useState(
    () => localStorage.getItem('lastBookingCode') || ''
  );
  const [cancelError,   setCancelError]   = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const lastInfo = (() => {
    try { return JSON.parse(localStorage.getItem('lastBookingInfo') || 'null'); }
    catch { return null; }
  })();

  const resetFlow = () => {
    setStep('landing');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientData({ name: '', email: '', phone: '' });
    setConfirmedData(null);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const randomCode = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;

    const turnosActualesDelDia = turnosPorFecha[selectedDate] || HORARIOS_DEFAULT.map(h => ({
      hora: h, estado: 'libre', cliente: '', telefono: '', email: '', codigo: '', servicio: '',
    }));

    const turnosModificados = turnosActualesDelDia.map(t =>
      t.hora === selectedTime
        ? { ...t, estado: 'ocupado', cliente: clientData.name, telefono: clientData.phone, email: clientData.email, codigo: randomCode, servicio: selectedService?.name || '' }
        : t
    );

    setTurnosPorFecha({ ...turnosPorFecha, [selectedDate]: turnosModificados });

    localStorage.setItem('lastBookingCode', randomCode);
    localStorage.setItem('lastBookingInfo', JSON.stringify({
      fecha: selectedDate, hora: selectedTime,
      servicio: selectedService?.name || '', cliente: clientData.name,
    }));

    setConfirmedData({ code: randomCode, fecha: selectedDate, hora: selectedTime, servicio: selectedService?.name || '' });
    setStep('confirmed');
    setClientData({ name: '', email: '', phone: '' });
  };

  const handleCancelacion = async () => {
    if (!codigoCancelacion.trim()) return;
    setCancelError(''); setCancelSuccess(''); setCancelLoading(true);

    const codigo = codigoCancelacion.trim().toUpperCase();

    // 1. Buscar el turno por código
    const { data, error: fetchError } = await supabase
      .from('turnos')
      .select('*')
      .eq('codigo', codigo)
      .single();

    let turnoAEliminar = data;

    if (fetchError || !data) {
      // También intentar sin toUpperCase por si fue guardado en otro case
      const { data: data2 } = await supabase
        .from('turnos')
        .select('*')
        .ilike('codigo', codigo)
        .single();

      if (!data2) {
        setCancelError('Código no encontrado. Verificá que sea correcto.');
        setCancelLoading(false);
        return;
      }
      turnoAEliminar = data2;
    }

    // 2. Actualizar el turno a libre usando el id (más confiable que el código)
    const { error: updateError } = await supabase
      .from('turnos')
      .update({
        estado: 'libre',
        cliente: '',
        telefono: '',
        email: '',
        codigo: '',
        servicio: '',
      })
      .eq('id', turnoAEliminar.id);

    if (updateError) {
      console.error('Error al cancelar turno:', updateError);
      setCancelError(`Error al cancelar: ${updateError.message || 'Intentá de nuevo.'}`);
      setCancelLoading(false);
      return;
    }

    localStorage.removeItem('lastBookingCode');
    localStorage.removeItem('lastBookingInfo');
    setCancelSuccess(`Turno del ${turnoAEliminar.fecha} a las ${turnoAEliminar.hora} hs cancelado exitosamente.`);
    setCodigoCancelacion('');
    setCancelLoading(false);
    if (onRefrescar) onRefrescar();
  };

  const misReservas = session?.user?.email
    ? Object.entries(turnosPorFecha)
        .flatMap(([fecha, turnos]) =>
          (turnos || []).filter(t => t.email === session.user.email && t.estado === 'ocupado').map(t => ({ ...t, fecha }))
        )
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    : [];

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (step === 'landing') {
    const nombreUsuario = session?.user?.user_metadata?.nombre
      || session?.user?.email?.split('@')[0]
      || null;

    return (
      <main className="app-card animate-input">
        <div className="landing-screen">

          {/* ══ CENTRO: branding + info ══ */}
          <div className="landing-center">

            {/* Logo grande */}
            <div className="landing-big-icon">✂️</div>

            {/* Nombre y rubro */}
            <h1 className="landing-nombre">{CONFIG.nombre}</h1>
            <span className="landing-badge">{CONFIG.rubro}</span>

            {/* Descripción */}
            <p className="landing-desc">{CONFIG.descripcion}</p>

            {/* Chips de servicios */}
            <div className="landing-chips">
              {HIGHLIGHTS.map(h => (
                <div key={h.label} className="landing-chip">
                  <span>{h.icon}</span>
                  <span>{h.label}</span>
                </div>
              ))}
            </div>

            {/* Separador */}
            <div className="landing-sep" />

            {/* Dirección y horarios */}
            <div className="landing-location">
              <p className="landing-loc-item">
                <span className="landing-loc-icon">📍</span>
                {CONFIG.ubicacion}
              </p>
              <p className="landing-loc-item">
                <span className="landing-loc-icon">🕒</span>
                {CONFIG.horariosSemana}
              </p>
              <p className="landing-loc-item">
                <span className="landing-loc-icon">🕒</span>
                {CONFIG.horariosSabado}
              </p>
            </div>

          </div>

          {/* ══ BOTONES DE ACCIÓN ══ */}
          <div className="landing-actions">

            {session && (
              <div className="landing-user-badge">
                <span>👋 Hola, <strong>{nombreUsuario}</strong></span>
                <button type="button" className="btn-session-logout" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn-confirm-final"
              onClick={() => { setActiveTab('agendar'); setStep('services'); }}
            >
              📅 Agendar Reserva
            </button>

            <button
              type="button"
              className="btn-landing-secondary"
              onClick={() => { setActiveTab('cancelar'); setStep('services'); }}
            >
              🔄 Gestionar / Cancelar
            </button>

            {session && (
              <button
                type="button"
                className="btn-landing-secondary"
                onClick={() => { setActiveTab('mis-reservas'); setStep('services'); }}
              >
                📋 Mis Reservas
              </button>
            )}
          </div>

        </div>
        <footer className="app-footer"><p>© {CONFIG.nombre}. Powered by Systems Suite</p></footer>
      </main>
    );
  }

  // ── CONFIRMACIÓN ─────────────────────────────────────────────────────────
  if (step === 'confirmed' && confirmedData) {
    return (
      <main className="app-card animate-input">
        <StepIndicator currentStep={4} />
        <div className="confirmed-screen">
          <div className="confirmed-icon">✅</div>
          <h2 className="confirmed-title">¡Reserva confirmada!</h2>
          <p className="confirmed-subtitle">
            {confirmedData.servicio} · {formatFecha(confirmedData.fecha)} · {confirmedData.hora} hs
          </p>
          <div className="confirmed-code-box">
            <p className="confirmed-code-label">Tu código de reserva</p>
            <div className="confirmed-code">{confirmedData.code}</div>
            <p className="confirmed-code-hint">Guardá este código para cancelar tu turno</p>
          </div>
          <button type="button" className="btn-confirm-final" onClick={resetFlow}>
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  // ── CONTACTO ─────────────────────────────────────────────────────────────
  if (step === 'contact') {
    return (
      <main className="app-card animate-input">
        <StepIndicator currentStep={3} />
        <div className="step-header">
          <button type="button" className="step-back-btn" onClick={() => setStep('datetime')}>‹</button>
          <div className="step-header-info">
            <span className="step-service-name">{selectedService?.icon} {selectedService?.name}</span>
            <span className="step-service-time">{formatFecha(selectedDate)} · {selectedTime} hs</span>
          </div>
        </div>
        <form className="app-body" onSubmit={handleConfirm}>
          <div className="booking-summary-chip">
            <span>{selectedService?.icon}</span>
            <span>{selectedService?.name}</span>
            <span>·</span>
            <span>{selectedDate}</span>
            <span>·</span>
            <span>{selectedTime} hs</span>
            <span className="chip-price">{selectedService?.price}</span>
          </div>
          <h3 className="form-step-title">Tus datos de contacto</h3>
          <div className="form-inputs-grid">
            <div className="input-group">
              <label>Nombre Completo</label>
              <input type="text" required placeholder="Ej. Alexander Wright"
                value={clientData.name}
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>WhatsApp</label>
              <input type="tel" required placeholder="+34 600 00 00 00"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} />
            </div>
            <div className="input-group full">
              <label>Email</label>
              <input type="email" required placeholder="tu-correo@example.com"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-confirm-final">
            Confirmar Reserva — {selectedService?.price}
          </button>
        </form>
        <footer className="app-footer"><p>© {CONFIG.nombre}</p></footer>
      </main>
    );
  }

  // ── FECHA Y HORA ──────────────────────────────────────────────────────────
  if (step === 'datetime') {
    return (
      <main className="app-card animate-input">
        <StepIndicator currentStep={2} />
        <div className="step-header">
          <button type="button" className="step-back-btn" onClick={() => setStep('services')}>‹</button>
          <div className="step-header-info">
            <span className="step-service-name">{selectedService?.icon} {selectedService?.name}</span>
            <span className="step-service-time">{selectedService?.duration} · {selectedService?.price}</span>
          </div>
        </div>
        <div className="app-body">
          <CalendarSelector
            turnosPorFecha={turnosPorFecha}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
          />
          <button
            type="button"
            className="btn-confirm-final"
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep('contact')}
            style={{ opacity: selectedDate && selectedTime ? 1 : 0.4 }}
          >
            {selectedDate && selectedTime ? `Continuar — ${selectedTime} hs` : 'Seleccioná día y horario'}
          </button>
        </div>
        <footer className="app-footer"><p>© {CONFIG.nombre}</p></footer>
      </main>
    );
  }

  // ── SERVICIOS (+ tabs cancelar / mis reservas) ───────────────────────────
  return (
    <main className="app-card animate-input">
      <StepIndicator currentStep={activeTab === 'agendar' ? 1 : null} />

      <div className="tab-header">
        <button type="button" className={`tab-btn ${activeTab === 'agendar' ? 'active' : ''}`} onClick={() => setActiveTab('agendar')}>
          Agendar
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'cancelar' ? 'active' : ''}`} onClick={() => setActiveTab('cancelar')}>
          Gestionar
        </button>
        {session && (
          <button type="button" className={`tab-btn ${activeTab === 'mis-reservas' ? 'active' : ''}`} onClick={() => setActiveTab('mis-reservas')}>
            Mis Reservas
          </button>
        )}
        <button type="button" className="tab-btn tab-btn-back" onClick={() => setStep('landing')} title="Inicio">
          ⌂
        </button>
      </div>

      <div className="app-body">

        {/* ── AGENDAR ── */}
        {activeTab === 'agendar' && (
          <>
            <ServiceSelector services={SERVICIOS} selectedService={selectedService} onSelect={setSelectedService} />
            <button
              type="button"
              className="btn-confirm-final"
              disabled={!selectedService}
              onClick={() => { setSelectedDate(null); setSelectedTime(null); setStep('datetime'); }}
              style={{ opacity: selectedService ? 1 : 0.4 }}
            >
              {selectedService ? `Continuar con ${selectedService.name}` : 'Seleccioná un servicio'}
            </button>
          </>
        )}

        {/* ── CANCELAR ── */}
        {activeTab === 'cancelar' && (
          <div className="cancel-flow">
            <h3>Cancelación de Citas</h3>
            <p className="cancel-desc">Ingresá el código que recibiste al reservar para liberar tu turno.</p>
            {lastInfo && !cancelSuccess && (
              <div className="last-booking-card">
                <span className="last-booking-label">Última reserva guardada</span>
                <strong>{lastInfo.servicio}</strong>
                <span>{lastInfo.fecha} · {lastInfo.hora} hs</span>
                <span className="last-booking-code">{localStorage.getItem('lastBookingCode')}</span>
              </div>
            )}
            {cancelError   && <div className="cancel-error">⚠️ {cancelError}</div>}
            {cancelSuccess && <div className="cancel-success">✅ {cancelSuccess}</div>}
            <div className="input-group">
              <label>Código de Reserva</label>
              <input type="text" placeholder="Ej. TRN-749201" value={codigoCancelacion}
                onChange={(e) => { setCodigoCancelacion(e.target.value); setCancelError(''); setCancelSuccess(''); }} />
            </div>
            <button type="button" className="btn-cancel-submit" onClick={handleCancelacion}
              disabled={cancelLoading || !codigoCancelacion.trim()}>
              {cancelLoading ? 'Cancelando...' : 'Anular Turno'}
            </button>
          </div>
        )}

        {/* ── MIS RESERVAS ── */}
        {activeTab === 'mis-reservas' && (
          <div className="mis-reservas-section">
            <h3>Mis Reservas</h3>
            {misReservas.length === 0 ? (
              <p className="cancel-desc">No tenés reservas activas.</p>
            ) : (
              <div className="reservas-list">
                {misReservas.map((r, i) => (
                  <div key={i} className="reserva-card">
                    <div className="reserva-info">
                      <strong>{r.fecha}</strong>
                      <span>{r.hora} hs</span>
                      {r.servicio && <span className="reserva-servicio-badge">{r.servicio}</span>}
                    </div>
                    <span className="reserva-codigo">{r.codigo}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="info-footer-box">
          <h4>Horarios de Atención</h4>
          <p>🕒 {CONFIG.horariosSemana}</p>
          <p>🕒 {CONFIG.horariosSabado}</p>
        </div>
      </div>
      <footer className="app-footer"><p>© {CONFIG.nombre}. Powered by Systems Suite</p></footer>
    </main>
  );
}
