import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ADMIN_EMAIL } from '../config/shop';

// Hook de sesión Supabase. Expone session, isAdmin, loading y signOut.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch((e) => console.error('Auth:', e))
      .finally(() => setLoading(false));
    const guard = setTimeout(() => setLoading(false), 6000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => { subscription.unsubscribe(); clearTimeout(guard); };
  }, []);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, isAdmin, loading, signOut };
}

const traducciones = [
  ['Invalid login credentials', 'Email o contraseña incorrectos.'],
  ['User already registered', 'Este email ya está registrado. Iniciá sesión.'],
  ['Email not confirmed', 'Confirmá tu email antes de iniciar sesión.'],
  ['Password should be', 'La contraseña debe tener al menos 6 caracteres.'],
];

export function traducirError(msg = '') {
  const hit = traducciones.find(([k]) => msg.includes(k));
  return hit ? hit[1] : 'Ocurrió un error. Intentá de nuevo.';
}
