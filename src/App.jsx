import { useState, useEffect } from 'react';
import ViewCliente from './components/ViewCliente';
import { ViewLogin } from './components/ViewLogin';
import { ViewAdmin } from './components/ViewAdmin';
import { supabase } from './Backend/supabaseClient';
import './App.css';

const ADMIN_EMAIL = 'admin@thegentsbarber.com';

export default function App() {
  const [session, setSession]           = useState(null);
  const [loadingAuth, setLoadingAuth]   = useState(true);
  const [skipLogin, setSkipLogin]       = useState(false); // "continuar sin cuenta"
  const [turnosPorFecha, setTurnosPorFecha] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) setSkipLogin(false); // si inicia sesión, resetear skip
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { descargarTurnos(); }, []);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const descargarTurnos = async () => {
    const { data, error } = await supabase.from('turnos').select('*');
    if (error) { console.error('Error al traer turnos:', error); return; }
    if (data) {
      const agrupado = {};
      data.forEach(t => {
        if (!agrupado[t.fecha]) agrupado[t.fecha] = [];
        agrupado[t.fecha].push({
          id: t.id, hora: t.hora, estado: t.estado,
          cliente: t.cliente || '', telefono: t.telefono || '',
          email: t.email || '', codigo: t.codigo || '', servicio: t.servicio || '',
        });
      });
      setTurnosPorFecha(agrupado);
    }
  };

  const guardarTurnosEnBaseDeDatos = async (fecha, nuevosTurnos) => {
    setTurnosPorFecha(prev => ({ ...prev, [fecha]: nuevosTurnos }));
    for (const turno of nuevosTurnos) {
      const { error } = await supabase.from('turnos').upsert({
        fecha, hora: turno.hora, estado: turno.estado,
        cliente: turno.cliente || '', telefono: turno.telefono || '',
        email: turno.email || '', codigo: turno.codigo || '', servicio: turno.servicio || '',
      }, { onConflict: 'fecha,hora' });
      if (error) console.error('Error en upsert:', error);
    }
    descargarTurnos();
  };

  const handleSetTurnos = (nuevosTurnos) => {
    const fechaModificada =
      Object.keys(nuevosTurnos).find(k => JSON.stringify(nuevosTurnos[k]) !== JSON.stringify(turnosPorFecha[k]))
      || Object.keys(nuevosTurnos)[0];
    if (fechaModificada) guardarTurnosEnBaseDeDatos(fechaModificada, nuevosTurnos[fechaModificada]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSkipLogin(false);
  };

  /* ── Loading ── */
  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando...</div>
      </div>
    );
  }

  /* ── Admin ── */
  if (isAdmin) {
    return (
      <div className="app-layout">
        <button type="button" onClick={handleLogout} style={styles.btnAdmin}>
          Cerrar Sesión
        </button>
        <ViewAdmin turnosPorFecha={turnosPorFecha} alActualizar={descargarTurnos} setTurnosPorFecha={handleSetTurnos} />
      </div>
    );
  }

  /* ── Sin sesión y sin skip → mostrar login primero ── */
  if (!session && !skipLogin) {
    return (
      <div className="app-layout">
        <ViewLogin
          onLoginSuccess={() => {}} // la sesión se actualiza via onAuthStateChange
          onVolver={() => setSkipLogin(true)} // "continuar sin cuenta"
        />
      </div>
    );
  }

  /* ── Con sesión o skip → mostrar app cliente ── */
  return (
    <div className="app-layout">
      <ViewCliente
        turnosPorFecha={turnosPorFecha}
        setTurnosPorFecha={handleSetTurnos}
        onRefrescar={descargarTurnos}
        session={session}
        onIrALogin={() => setSkipLogin(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

const styles = {
  btnAdmin: {
    position: 'fixed', top: '20px', right: '24px',
    backgroundColor: 'var(--danger)', color: '#fff',
    border: 'none', padding: '10px 18px', borderRadius: '50px',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
    zIndex: 1000, boxShadow: '0 4px 14px rgba(198,40,40,0.3)',
  }
};
