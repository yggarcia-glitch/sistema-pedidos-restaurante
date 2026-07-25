import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Receipt, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ordersApi } from '../../api/orders.api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { statusMeta } from '../../lib/format';

// Estados que ya no requieren seguimiento activo.
const CLOSED_STATUSES = ['ENTREGADO', 'CANCELADO', 'RECHAZADO'];

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== '/';
  const isClient = user?.rol?.nombre === 'CLIENTE';

  // Cerrar los menús al hacer clic fuera.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Notificaciones = pedidos propios que todavía están en curso.
  // Se consulta al montar y luego cada 20s, para reflejar cambios de estado sin recargar.
  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;

    const load = () => {
      ordersApi
        .findAll({ limit: 20 })
        .then(({ data }) => {
          if (cancelled) return;
          const active = (data.data ?? []).filter(
            (o) => !CLOSED_STATUSES.includes(o.estado?.nombre),
          );
          setActiveOrders(active);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isClient]);

  const account = ACCOUNT_LINK[user?.rol?.nombre];

  return (
    <header className="h-[56px] bg-white border-b border-border px-6 flex items-center justify-between">
      {/* Izquierda: retroceder + logo + nombre */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Volver"
            className="w-[34px] h-[34px] rounded-full border border-border flex items-center justify-center text-txt hover:bg-background"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-primary flex items-center justify-center text-white">
            <UtensilsCrossed size={18} />
          </div>
          <span className="font-bold text-[15px] text-txt">Sistema de Pedidos</span>
        </Link>
      </div>

      {/* Derecha */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {user?.rol?.nombre === 'CLIENTE' && (
            <Link to="/history" title="Mis pedidos" className="text-txt-2 hover:text-txt">
              <Receipt size={20} />
            </Link>
          )}
          {isClient && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                title="Notificaciones"
                className="relative text-txt-2 hover:text-txt"
              >
                <Bell size={20} />
                {activeOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-[8px] h-[8px] rounded-full bg-red-500 border border-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-[42px] w-[280px] bg-white border border-border rounded-[10px] shadow-lg py-1 z-[1100]">
                  <p className="px-3 py-2 text-[12px] font-bold text-txt border-b border-border">
                    Pedidos activos
                  </p>
                  {activeOrders.length === 0 ? (
                    <p className="px-3 py-4 text-[11px] text-txt-2 text-center">
                      No tienes pedidos en curso
                    </p>
                  ) : (
                    activeOrders.map((o) => {
                      const meta = statusMeta(o.estado?.nombre);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(`/tracking/${o.id}`);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-background border-b border-border last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-[2px]">
                            <span className="text-[12px] font-semibold text-txt truncate mr-2">
                              {o.restaurant?.name ?? 'Restaurante'}
                            </span>
                            <Badge type={meta.type}>{meta.label}</Badge>
                          </div>
                          <p className="text-[10px] text-txt-2">Toca para ver el seguimiento</p>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="w-[34px] h-[34px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center"
            >
              {initials(user?.name)}
            </button>

            {open && (
              <div className="absolute right-0 top-[42px] w-[200px] bg-white border border-border rounded-[10px] shadow-lg py-1 z-[1100]">
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
