import { useState } from 'react';
import { IconSprite } from '../components/ui/Icon';
import { useAuth } from '../lib/useAuth';
import { useShopData } from '../lib/useShopData';
import { useTheme } from '../lib/useTheme';
import ClientApp from '../features/booking/ClientApp';
import AdminApp from '../features/admin/AdminApp';
import AdminLogin from '../features/auth/AdminLogin';

export default function App() {
  const { session, isAdmin, loading: authLoading, signOut } = useAuth();
  const { turnos, map, work, servicios, loading: dataLoading, refresh } = useShopData();
  const { isDark, toggle } = useTheme();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const loading = authLoading || dataLoading;

  return (
    <>
      <IconSprite />
      <div className="app-shell">
        {loading ? (
          <div className="center-screen"><div className="spinner" /></div>
        ) : isAdmin ? (
          <AdminApp
            turnos={turnos} map={map} work={work} servicios={servicios}
            refresh={refresh} signOut={signOut}
            isDark={isDark} onThemeToggle={toggle}
          />
        ) : showAdminLogin ? (
          <AdminLogin onBack={() => setShowAdminLogin(false)} />
        ) : (
          <ClientApp
            map={map} work={work} servicios={servicios} refresh={refresh}
            session={session} onAdminClick={() => setShowAdminLogin(true)}
            isDark={isDark} onThemeToggle={toggle}
          />
        )}
      </div>
    </>
  );
}
