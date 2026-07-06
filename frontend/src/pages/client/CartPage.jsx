import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { CartItemRow } from '../../components/cart/CartItem';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';
import { money } from '../../lib/format';

export default function CartPage() {
  const { cart, loading, subtotal } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) return <PageSpinner />;

  const items = cart?.items ?? [];
  const deliveryFee = Number(cart?.restaurant?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-[14px]">
          <h1 className="text-[15px] font-bold text-txt">Tu carrito</h1>
          {cart?.restaurant?.name && (
            <span className="text-[10px] text-txt-2">{cart.restaurant.name}</span>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-center text-[12px] text-txt-2 py-16">
            Tu carrito está vacío 🛒
          </p>
        ) : (
          <>
            {/* Ítems */}
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}

            {/* Dirección */}
            <Card className="mb-[10px]">
              <div className="flex items-center justify-between mb-[4px]">
                <span className="text-[10px] text-txt-2">📍 Dirección de entrega</span>
                <span className="text-[10px] text-primary font-semibold cursor-pointer">Cambiar</span>
              </div>
              <p className="text-[11px] text-txt">Calle Larga y Benigno Malo, Cuenca</p>
            </Card>

            {/* Desglose */}
            <Card className="mb-[14px]">
              <div className="flex items-center justify-between mb-[4px]">
                <span className="text-[11px] text-txt-2">Subtotal</span>
                <span className="text-[11px] text-txt">{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between mb-[4px]">
                <span className="text-[11px] text-txt-2">Envío</span>
                <span className="text-[11px] text-txt">
                  {deliveryFee > 0 ? money(deliveryFee) : 'Gratis'}
                </span>
              </div>
              <div className="border-t border-border my-[6px]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-txt">Total</span>
                <span className="text-[16px] font-bold text-primary">{money(total)}</span>
              </div>
            </Card>

            <Button variant="primary" fullWidth onClick={() => navigate('/checkout')}>
              Ir a pagar →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
