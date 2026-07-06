import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { OrderStatusStepper } from '../../components/orders/OrderStatusStepper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { statusMeta } from '../../lib/format';

// Polling cada 10 segundos para reflejar cambios de estado.
const POLL_INTERVAL = 10_000;

const TITLES = {
  PENDIENTE: '¡Tu pedido fue recibido! 🧾',
  CONFIRMADO: '¡Tu pedido fue confirmado! ✅',
  EN_PREPARACION: '¡Estamos preparando tu pedido! 👨‍🍳',
  LISTO: '¡Tu pedido está listo! 📦',
  EN_CAMINO: '¡Tu pedido está en camino! 🛵',
  ENTREGADO: '¡Pedido entregado! 🎉',
  CANCELADO: 'Pedido cancelado',
  RECHAZADO: 'Pedido rechazado',
};

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const { data } = await ordersApi.findOne(orderId);
      setOrder(data);
      if (['ENTREGADO', 'CANCELADO', 'RECHAZADO'].includes(data.estado?.nombre)) {
        clearInterval(pollRef.current);
      }
    } catch {
      setError('No se pudo cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  if (loading) return <PageSpinner />;
  if (error) return <p className="text-center text-[12px] text-red-500 py-16">{error}</p>;
  if (!order) return null;

  const status = order.estado?.nombre;
  const meta = statusMeta(status);
  const eta = order.restaurant?.deliveryTime;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-[12px]">
          <h1 className="text-[15px] font-bold text-txt">
            📦 Pedido #{order.id.slice(0, 4).toUpperCase()}
          </h1>
          <Badge type={meta.type}>{meta.label}</Badge>
        </div>

        {/* Título */}
        <h2 className="text-[15px] font-bold text-txt mb-[12px]">{TITLES[status] ?? 'Seguimiento del pedido'}</h2>

        {/* Imagen */}
        <div className="h-[100px] rounded-[12px] bg-background border border-border mb-[14px] flex items-center justify-center text-[36px]">
          🛵
        </div>

        {/* Stepper */}
        <OrderStatusStepper currentStatus={status} />

        {/* Repartidor */}
        <Card className="mb-[10px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center">
              CM
            </div>
            <div>
              <p className="text-[12px] font-bold text-txt">Carlos Morales</p>
              <p className="text-[10px] text-txt-2">Repartidor · ★ 4.8</p>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="text-[20px] cursor-pointer">📞</span>
            <span className="text-[20px] cursor-pointer">💬</span>
          </div>
        </Card>

        {/* Tiempo estimado */}
        <Card className="flex items-center gap-[10px]">
          <span className="text-[22px]">⏱</span>
          <div>
            <p className="text-[10px] text-txt-2">Tiempo estimado</p>
            <p className="text-[15px] font-bold text-txt">
              {eta ? `${eta} – ${eta + 5} minutos` : '8 – 12 minutos'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
