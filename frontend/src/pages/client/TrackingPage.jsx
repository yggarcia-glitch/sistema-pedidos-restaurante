import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { OrderStatusStepper } from '../../components/orders/OrderStatusStepper';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';

// Polling cada 10 segundos para detectar cambios de estado del pedido
const POLL_INTERVAL = 10_000;

export default function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const pollRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const { data } = await ordersApi.findOne(orderId);
      setOrder(data);
      // Detener el polling cuando el pedido ya terminó
      if (['ENTREGADO', 'CANCELADO', 'RECHAZADO'].includes(data.status)) {
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

  const handleCancel = async () => {
    if (!window.confirm('¿Deseas cancelar este pedido?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(orderId);
      fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo cancelar el pedido');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-1">Seguimiento del pedido</h1>
        {order && (
          <p className="text-xs text-text-secondary mb-6">
            {order.restaurant?.name} · #{order.id.slice(0, 8).toUpperCase()}
          </p>
        )}

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {order && (
          <>
            <div className="bg-white rounded-2xl border border-border p-4 mb-4 overflow-hidden">
              <OrderStatusStepper currentStatus={order.status} />
            </div>

            {/* Ítems del pedido */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-4">
              <h2 className="font-semibold text-sm text-text mb-3">Detalle del pedido</h2>
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-text">{item.quantity}× {item.productName}</span>
                  <span className="text-text-secondary">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-text border-t border-border mt-2 pt-2 text-sm">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              {order.status === 'PENDIENTE' && (
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1"
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate('/history')}
                className="flex-1"
              >
                Mis pedidos
              </Button>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
