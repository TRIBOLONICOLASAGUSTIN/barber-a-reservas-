import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabase';
import { traducirError } from '../../lib/useAuth';

// Login dedicado de administrador (cuenta real de Supabase).
export default function AdminLogin({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(traducirError(err.message));
    // Si es correcto, useAuth detecta la sesión y App muestra el panel.
  };

  return (
    <form className="alogin anim-up" onSubmit={submit}>
      <div className="alock"><Icon name="lock" size={30} /></div>
      <h2>Acceso administrador</h2>
      <p>Iniciá sesión con tus credenciales de gestión</p>

      {error && <div className="alert alert-error" style={{ width: '100%' }}><Icon name="x" size={15} /> {error}</div>}

      <div style={{ width: '100%', marginTop: 8 }}>
        <div className="field" style={{ padding: '6px 0' }}>
          <label>Email</label>
          <input type="email" required value={email} placeholder="admin@thegentsbarber.com"
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field" style={{ padding: '6px 0' }}>
          <label>Contraseña</label>
          <input type="password" required value={password} placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      <div className="actions" style={{ width: '100%', padding: '14px 0 6px' }}>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <><Icon name="shield" /> Ingresar al panel</>}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          <Icon name="chev-l" /> Volver al inicio
        </button>
      </div>
    </form>
  );
}
