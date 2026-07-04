import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export function BottomNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const clientLinks = [
    { to: '/', label: 'Inicio', icon: '🏠' },
    { to: '/history', label: 'Pedidos', icon: '📋' },
    { to: '/cart', label: `Carrito${itemCount > 0 ? ` (${itemCount})` : ''}`, icon: '🛒' },
    { to: '/profile', label: 'Perfil', icon: '👤' },
  ];

  const vendorLinks = [
    { to: '/vendor/dashboard', label: 'Inicio', icon: '📊' },
    { to: '/vendor/orders', label: 'Pedidos', icon: '📋' },
    { to: '/vendor/menu', label: 'Menú', icon: '🍽️' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Inicio', icon: '📊' },
    { to: '/admin/users', label: 'Usuarios', icon: '👥' },
    { to: '/admin/restaurants', label: 'Locales', icon: '🏪' },
  ];

  const links =
    user?.role === 'VENDEDOR'
      ? vendorLinks
      : user?.role === 'ADMIN'
        ? adminLinks
        : clientLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border md:hidden">
      <div className="flex">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
