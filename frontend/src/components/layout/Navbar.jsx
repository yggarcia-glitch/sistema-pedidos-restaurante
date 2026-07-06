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

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

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
          <span className="text-[18px] cursor-pointer">🔔</span>
          <Link
            to="/profile"
            className="w-[34px] h-[34px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center"
          >
            {initials(user?.name)}
          </Link>
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
