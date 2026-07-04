import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-lg">
          🍽️ PediYa
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'CLIENTE' && (
                <>
                  <Link to="/history" className="text-sm text-text-secondary hover:text-text">
                    Mis pedidos
                  </Link>
                  <Link to="/cart" className="relative">
                    <span className="text-2xl">🛒</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user?.role === 'VENDEDOR' && (
                <Link to="/vendor/dashboard" className="text-sm text-text-secondary hover:text-text">
                  Dashboard
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="text-sm text-text-secondary hover:text-text">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="text-sm font-medium text-text">
                {user?.name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-text-secondary hover:text-red-500"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-text-secondary hover:text-text">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
