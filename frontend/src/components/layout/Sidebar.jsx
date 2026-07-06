import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { initials } from '../../lib/format';

const NAV = {
  VENDEDOR: {
    section: 'Mi restaurante',
    items: [
      { icon: '📊', label: 'Dashboard', to: '/vendor/dashboard' },
      { icon: '🍽', label: 'Menú', to: '/vendor/menu' },
      { icon: '⚙️', label: 'Configuración', to: '/vendor/settings' },
    ],
  },
  ADMIN: {
    section: 'Administración',
    items: [
      { icon: '📊', label: 'Dashboard', to: '/admin/dashboard' },
      { icon: '👥', label: 'Usuarios', to: '/admin/users' },
      { icon: '🏪', label: 'Restaurantes', to: '/admin/restaurants' },
    ],
  },
};

const ROLE_LABEL = { VENDEDOR: 'Vendedor', ADMIN: 'Administrador', CLIENTE: 'Cliente' };

export function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const nav = NAV[user?.rol?.nombre] ?? { section: '', items: [] };

  return (
    <aside className="fixed top-0 left-0 w-[216px] h-screen bg-white border-r border-border flex flex-col">
      {/* Marca */}
      <div className="flex items-center gap-[10px] px-[16px] h-[60px] border-b border-border">
        <div className="w-[32px] h-[32px] rounded-[9px] bg-primary flex items-center justify-center text-[16px]">
          🍽
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-txt">Sistema Pedidos</p>
          <p className="text-[10px] text-txt-3">Partner Portal</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-[12px] py-[14px]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-txt-3 px-[10px] mb-[8px]">
          {nav.section}
        </p>
        {nav.items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`relative flex items-center gap-[10px] px-[10px] py-[9px] rounded-[9px] text-[12.5px] mb-[3px] transition-colors ${
                active
                  ? 'bg-primary-light text-primary-dark font-bold'
                  : 'text-txt-2 hover:bg-background'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-full bg-primary" />
              )}
              <span className="text-[15px] w-[18px] text-center">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + salir */}
      <div className="border-t border-border p-[12px]">
        <div className="flex items-center gap-[9px] mb-[8px]">
          <div className="w-[34px] h-[34px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center">
            {initials(user?.name) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-txt truncate">{user?.name}</p>
            <p className="text-[10px] text-txt-3">{ROLE_LABEL[user?.rol?.nombre] ?? ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-[9px] px-[10px] py-[8px] rounded-[9px] text-[12px] text-txt-2 hover:bg-background cursor-pointer"
        >
          <span className="text-[14px] w-[18px] text-center">↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
