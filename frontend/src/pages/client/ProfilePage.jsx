import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { initials } from '../../lib/format';

const ADDRESSES = [
  { label: 'Casa', detail: 'Calle Larga y Benigno Malo, Cuenca' },
  { label: 'Trabajo', detail: 'Av. Solano 3-45, Cuenca' },
];

const OPTIONS = [
  { icon: '💳', label: 'Métodos de pago' },
  { icon: '🔔', label: 'Notificaciones' },
  { icon: '🔒', label: 'Seguridad' },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-[16px]">
          <h1 className="text-[15px] font-bold text-txt">Mi perfil</h1>
          <span className="text-[16px] cursor-pointer">⚙️</span>
        </div>

        {/* Avatar */}
        <div className="w-[62px] h-[62px] rounded-full bg-primary-light flex items-center justify-center font-bold text-[20px] text-primary-dark mx-auto mb-[10px]">
          {initials(user?.name) || '?'}
        </div>
        <p className="text-[16px] font-bold text-txt text-center mb-[4px]">{user?.name}</p>
        <p className="text-[11px] text-txt-2 text-center mb-[18px]">{user?.email}</p>

        {/* Direcciones */}
        <h2 className="text-[11px] font-bold text-txt mb-[8px]">Mis direcciones</h2>
        {ADDRESSES.map((addr) => (
          <div
            key={addr.label}
            className="bg-white border border-border rounded-[10px] p-[10px] mb-[6px] flex items-center"
          >
            <span className="text-[14px]">📍</span>
            <div className="ml-[8px] flex-1 min-w-0">
              <p className="font-semibold text-[12px] text-txt">{addr.label}</p>
              <p className="text-[10px] text-txt-2 truncate">{addr.detail}</p>
            </div>
            <span className="text-txt-3">›</span>
          </div>
        ))}

        <div className="border-t border-border my-[10px]" />

        {/* Opciones */}
        {OPTIONS.map((opt) => (
          <div
            key={opt.label}
            className="flex justify-between items-center py-[10px] border-b border-border cursor-pointer"
          >
            <div className="flex items-center flex-1">
              <span className="text-[14px]">{opt.icon}</span>
              <span className="text-[12px] text-txt ml-[9px]">{opt.label}</span>
            </div>
            <span className="text-txt-3">›</span>
          </div>
        ))}

        <Button variant="danger" fullWidth className="mt-[16px]" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
