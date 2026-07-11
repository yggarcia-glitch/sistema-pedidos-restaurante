import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { OrderStatusStepper } from '../../components/orders/OrderStatusStepper';
import { CourierRouteMap } from '../../components/orders/CourierRouteMap';
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
  const isCancelled = ['CANCELADO', 'RECHAZADO'].includes(status);

  // Coordenadas para el mapa de ruta.
  const restaurantCoords =
    order.restaurant?.latitude != null
      ? { lat: order.restaurant.latitude, lng: order.restaurant.longitude }
      : null;
  const destinationCoords =
    order.client?.homeLat != null
      ? { lat: order.client.homeLat, lng: order.client.homeLng }
      : null;
  // Solo mostramos al repartidor moviéndose cuando el pedido está en marcha.
  const dp = order.driver?.driverProfile;
  const driverCoords =
    ['LISTO', 'EN_CAMINO'].includes(status) && dp?.currentLat != null
      ? { lat: dp.currentLat, lng: dp.currentLng }
      : null;
  const showMap = !isCancelled && restaurantCoords && destinationCoords;

  const driverInitials = order.driver?.name
    ? order.driver.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

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

        {/* Mapa de ruta del repartidor (tipo PedidosYa) */}
        {showMap ? (
          <CourierRouteMap
            restaurant={restaurantCoords}
            destination={destinationCoords}
            driver={driverCoords}
          />
        ) : (
          <div className="h-[100px] rounded-[12px] bg-background border border-border mb-[14px] flex items-center justify-center text-[36px]">
            🛵
          </div>
        )}

        {/* Stepper */}
        <OrderStatusStepper currentStatus={status} />

        {/* Repartidor asignado (dato real; aparece cuando el pedido tiene repartidor) */}
        {order.driver && (
          <Card className="mb-[10px] flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full bg-primary-light text-primary-dark font-bold text-[12px] flex items-center justify-center">
                {driverInitials}
              </div>
              <div>
                <p className="text-[12px] font-bold text-txt">{order.driver.name}</p>
                <p className="text-[10px] text-txt-2">Repartidor</p>
              </div>
            </div>
            {order.driver.phone && (
              <a href={`tel:${order.driver.phone}`} className="text-[20px] cursor-pointer">
                📞
              </a>
            )}
          </Card>
        )}

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
