import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../hooks/useCart';
import { money } from '../../lib/format';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', icon: '💵', label: 'Efectivo' },
  { value: 'TARJETA_CREDITO', icon: '💳', label: 'Tarjeta de crédito' },
  { value: 'TARJETA_DEBITO', icon: '💳', label: 'Tarjeta de débito' },
  { value: 'TRANSFERENCIA', icon: '🏦', label: 'Transferencia' },
  { value: 'PAYPAL', icon: '🅿️', label: 'PayPal' },
];

export default function CheckoutPage() {
  const { cart, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items ?? [];
  const deliveryFee = Number(cart?.restaurant?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;
  const isCard = ['TARJETA_CREDITO', 'TARJETA_DEBITO'].includes(method);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const { data: order } = await ordersApi.create({ deliveryType: 'DELIVERY' });
      await paymentsApi.create({ orderId: order.id, method });
      navigate(`/tracking/${order.id}`);
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-[10px] mb-[14px]">
          <button
            onClick={() => navigate(-1)}
            className="bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center border border-border text-[14px]"
          >
            ←
          </button>
          <h1 className="text-[15px] font-bold text-txt">Confirmar pago</h1>
        </div>

        {/* Método de pago */}
        <h2 className="text-[11px] font-bold text-txt mb-[10px]">Método de pago</h2>
        {PAYMENT_METHODS.map((m) => {
          const selected = method === m.value;
          return (
            <div
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={`bg-white border rounded-[10px] p-[10px] mb-[6px] flex justify-between items-center cursor-pointer ${
                selected ? 'border-primary border-2' : 'border-border'
              }`}
            >
              <div className="flex items-center">
                <span className="text-[14px]">{m.icon}</span>
                <span className="text-[12px] text-txt ml-[6px]">{m.label}</span>
              </div>
              <div
                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                  selected
                    ? 'bg-primary border-primary'
                    : 'border-2 border-border'
                }`}
              >
                {selected && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
            </div>
          );
        })}

        {/* Inputs de tarjeta (solo visual) */}
        {isCard && (
          <Card className="mb-[12px] mt-[6px]">
            <p className="text-[11px] text-txt-2 mb-[6px]">Número de tarjeta</p>
            <Input placeholder="•••• •••• •••• 4242" className="mb-[6px]" maxLength={19} />
            <div className="flex gap-[8px]">
              <Input placeholder="MM/AA" className="flex-1" maxLength={5} />
              <Input placeholder="CVV" className="flex-1" maxLength={4} type="password" />
            </div>
          </Card>
        )}

        {/* Resumen */}
        <Card className="mb-[14px] mt-[12px]">
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

        {error && <p className="text-[11px] text-red-500 text-center mb-[10px]">{error}</p>}

        <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>
          Confirmar pedido · {money(total)}
        </Button>
      </div>
    </div>
  );
}
