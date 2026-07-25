import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Destino de "Mi cuenta" según el rol (evita mandar a /profile, que es solo de CLIENTE
// y rebota a los demás roles creando un bucle).
const ACCOUNT_LINK = {
  CLIENTE: { to: '/profile', label: 'Mi perfil' },
  VENDEDOR: { to: '/vendor/dashboard', label: 'Mi panel' },
  ADMIN: { to: '/admin/dashboard', label: 'Panel de admin' },
};

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const account = ACCOUNT_LINK[user?.rol?.nombre];

  return (
    <header className="h-[56px] bg-white border-b border-border px-6 flex items-center justify-between">
      {/* Izquierda: logo + nombre */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-primary flex items-center justify-center text-[18px]">
          🍽
        </div>
        <span className="font-bold text-[15px] text-txt">Sistema de Pedidos</span>
      </Link>

      {/* Derecha */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {user?.rol?.nombre === 'CLIENTE' && (
            <Link
              to="/history"
              title="Mis pedidos"
              className="text-[18px] leading-none"
            >
              🧾
            </Link>
          )}
          <span className="text-[18px] cursor-pointer">🔔</span>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="w-[34px] h-[34px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center"
            >
              {initials(user?.name)}
            </button>

            {open && (
              <div className="absolute right-0 top-[42px] w-[200px] bg-white border border-border rounded-[10px] shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[12px] font-bold text-txt truncate">{user?.name}</p>
                  <p className="text-[10px] text-txt-2 truncate">{user?.email}</p>
                </div>
                {account && (
                  <Link
                    to={account.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-[12px] text-txt hover:bg-background"
                  >
                    {account.label}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] text-red-500 hover:bg-background"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="outline">Iniciar sesión</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Registrarse</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
