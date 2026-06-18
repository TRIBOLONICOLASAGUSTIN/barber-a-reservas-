import { useState } from 'react';
import { supabase } from '../Backend/supabaseClient';
import '../estilos/ViewLogin.css';

export const ViewLogin = ({ onLoginSuccess, onVolver }) => {
  const [modo, setModo]           = useState('login'); // 'login' | 'register'
  const [nombre, setNombre]       = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  const limpiar = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    limpiar();
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(traducirError(err.message)); return; }
    onLoginSuccess();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    limpiar();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre } }
    });
    setLoading(false);
    if (err) { setError(traducirError(err.message)); return; }
    setSuccess('¡Cuenta creada! Revisá tu email para confirmar y luego iniciá sesión.');
    setModo('login');
    setPassword('');
  };

  const traducirError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (msg.includes('User already registered'))   return 'Este email ya está registrado. Iniciá sesión.';
    if (msg.includes('Email not confirmed'))        return 'Confirmá tu email antes de iniciar sesión.';
    if (msg.includes('Password should be'))         return 'La contraseña debe tener al menos 6 caracteres.';
    return 'Ocurrió un error. Intentá de nuevo.';
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* ── Hero dark con branding ── */}
        <div className="login-hero">
          <div className="login-hero-stripes" />
          <div className="login-hero-content">
            <div className="login-hero-icon">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="rgba(200,164,74,0.12)" stroke="rgba(200,164,74,0.4)" strokeWidth="1.5"/>
                <line x1="16" y1="14" x2="32" y2="28" stroke="#C8A44A" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="13" cy="12" r="4" stroke="#C8A44A" strokeWidth="2" fill="none"/>
                <line x1="48" y1="14" x2="32" y2="28" stroke="#C8A44A" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="51" cy="12" r="4" stroke="#C8A44A" strokeWidth="2" fill="none"/>
                <circle cx="32" cy="26" r="2.5" fill="#C8A44A"/>
                <ellipse cx="32" cy="40" rx="11" ry="12" fill="#fff" opacity="0.9"/>
                <ellipse cx="32" cy="34" rx="8" ry="9" fill="#2B1F0E"/>
                <path d="M21 44 Q25 52 32 54 Q39 52 43 44 Q38 48 32 48 Q26 48 21 44Z" fill="#fff" opacity="0.9"/>
                <path d="M21 44 Q25 52 32 54 Q39 52 43 44 Q38 48 32 48 Q26 48 21 44Z" fill="#2B1F0E"/>
              </svg>
            </div>
            <h1 className="login-hero-brand">THE GENTS BARBER</h1>
            <p className="login-hero-tag">✦ BOOKING APPS ✦</p>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="login-body">
          <div className="login-header">
            <h2 className="login-title">
              {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="login-subtitle">
              {modo === 'login'
                ? 'Accedé para ver y gestionar tus reservas'
                : 'Completá tus datos para registrarte'}
            </p>
          </div>

          {error   && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}

          <form onSubmit={modo === 'login' ? handleLogin : handleRegister}>
            {modo === 'register' && (
              <div className="input-group">
                <label>Nombre completo</label>
                <input type="text" placeholder="Tu nombre" value={nombre}
                  onChange={(e) => setNombre(e.target.value)} required />
              </div>
            )}
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="tu-correo@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Procesando...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          {/* ── Links inferiores ── */}
          <div className="login-footer-links">
            {modo === 'login' ? (
              <p className="login-switch-text">
                ¿No tenés cuenta?{' '}
                <button type="button" className="btn-switch-mode" onClick={() => { setModo('register'); limpiar(); }}>
                  Registrarse
                </button>
              </p>
            ) : (
              <p className="login-switch-text">
                ¿Ya tenés cuenta?{' '}
                <button type="button" className="btn-switch-mode" onClick={() => { setModo('login'); limpiar(); }}>
                  Iniciá sesión
                </button>
              </p>
            )}
            <button type="button" className="btn-guest" onClick={onVolver}>
              Continuar sin cuenta →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
