import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { CartSummary } from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../hooks/useCart';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: '💵 Efectivo' },
  { value: 'TARJETA_CREDITO', label: '💳 Tarjeta de crédito' },
  { value: 'TARJETA_DEBITO', label: '💳 Tarjeta de débito' },
  { value: 'TRANSFERENCIA', label: '🏦 Transferencia' },
  { value: 'PAYPAL', label: '🅿️ PayPal' },
];

export default function CheckoutPage() {
  const { cart, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { paymentMethod: 'EFECTIVO', deliveryType: 'DELIVERY' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethod = watch('paymentMethod');
  const deliveryType = watch('deliveryType');
  const isCard = ['TARJETA_CREDITO', 'TARJETA_DEBITO'].includes(paymentMethod);
  const deliveryFee = deliveryType === 'PICKUP' ? 0 : Number(cart?.restaurant?.deliveryFee ?? 0);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      // 1. Crear el pedido desde el carrito
      const { data: order } = await ordersApi.create({
        deliveryType: data.deliveryType,
        notes: data.notes,
      });

      // 2. Registrar el pago
      await paymentsApi.create({ orderId: order.id, method: data.paymentMethod });

      // 3. Actualizar el carrito (ya fue vaciado por el backend) y redirigir
      await fetchCart();
      navigate(`/tracking/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items ?? [];
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-4">Confirmar pedido</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo de entrega */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="font-semibold text-sm text-text mb-3">Tipo de entrega</h2>
            <div className="flex gap-3">
              {[
                { value: 'DELIVERY', label: '🛵 Delivery' },
                { value: 'PICKUP', label: '🏪 Recoger en local' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={opt.value} {...register('deliveryType')} className="accent-primary" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="font-semibold text-sm text-text mb-3">Resumen del pedido</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-text">
                  {item.quantity}× {item.product?.name}
                </span>
                <span className="text-text-secondary">
                  ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="font-semibold text-sm text-text mb-3">Método de pago</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={m.value} {...register('paymentMethod')} className="accent-primary" />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </div>

            {/* Campos de tarjeta (solo visual) */}
            {isCard && (
              <div className="mt-4 space-y-3 pt-3 border-t border-border">
                <Input label="Número de tarjeta" placeholder="1234 5678 9012 3456" maxLength={19} {...register('cardNumber')} />
                <div className="flex gap-3">
                  <Input label="MM/AA" placeholder="12/26" maxLength={5} {...register('cardExpiry')} />
                  <Input label="CVV" placeholder="123" maxLength={3} type="password" {...register('cardCvv')} />
                </div>
              </div>
            )}
          </div>

          {/* Nota */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <label className="text-sm font-medium text-text block mb-2">Instrucciones especiales</label>
            <textarea
              {...register('notes')}
              placeholder="Sin cebolla, extra salsa..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Procesando...' : `Confirmar pedido • $${(subtotal + deliveryFee).toFixed(2)}`}
          </Button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
