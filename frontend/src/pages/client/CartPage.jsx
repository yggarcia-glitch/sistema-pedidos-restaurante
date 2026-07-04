import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { CartItemRow } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';

export default function CartPage() {
  const { cart, loading, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) return <PageSpinner />;

  const items = cart?.items ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-4">Tu carrito</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl">🛒</span>
            <p className="text-text-secondary mt-3">Tu carrito está vacío</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Ver restaurantes
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-border p-4 mb-4">
              {cart?.restaurantId && (
                <p className="text-xs text-text-secondary mb-3 pb-3 border-b border-border">
                  🏪 Pedido en: <strong>un restaurante</strong>
                </p>
              )}
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
              <button
                onClick={clearCart}
                className="mt-3 text-xs text-red-400 hover:text-red-600"
              >
                Vaciar carrito
              </button>
            </div>

            <CartSummary subtotal={subtotal} />

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Ir a pagar
            </Button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
