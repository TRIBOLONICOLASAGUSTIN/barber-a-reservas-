import { useState } from 'react';
import '../estilos/Navbar.css';

export const Navbar = ({ session, onIrALogin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  const nombre = session?.user?.user_metadata?.nombre || session?.user?.email?.split('@')[0] || 'Usuario';

  return (
    <>
      <button type="button" className="hamburger-btn" onClick={toggle} title="Menú">
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`admin-dropdown-menu ${isOpen ? 'active' : ''}`}>
        {session ? (
          <>
            <p className="navbar-greeting">Hola, <strong>{nombre}</strong></p>
            <button type="button" className="btn-menu-login" onClick={() => { onLogout(); close(); }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <h4>Gestión de cuenta</h4>
            <button type="button" className="btn-menu-login" onClick={() => { onIrALogin(); close(); }}>
              Iniciar sesión / Registro
            </button>
          </>
        )}
      </div>
    </>
  );
};
