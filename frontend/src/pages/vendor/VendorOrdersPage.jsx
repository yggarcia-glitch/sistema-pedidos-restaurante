import { useState, useEffect, useRef } from 'react';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';

// Polling cada 15 segundos para detectar nuevos pedidos
const POLL_INTERVAL = 15_000;

const COLUMNS = [
  { label: 'Pendientes', statuses: ['PENDIENTE'] },
  { label: 'Preparando', statuses: ['CONFIRMADO', 'EN_PREPARACION'] },
  { label: 'Listos', statuses: ['LISTO'] },
];

const NEXT_STATUS = {
  PENDIENTE: 'CONFIRMADO',
  CONFIRMADO: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'EN_CAMINO',
};

const ACTION_LABELS = {
  PENDIENTE: 'Aceptar',
  CONFIRMADO: 'En preparación',
  EN_PREPARACION: 'Marcar listo',
  LISTO: 'En camino',
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersApi.findAll({ limit: 50 });
      setOrders(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersApi.updateStatus(orderId, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al cambiar estado');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await ordersApi.updateStatus(orderId, { status: 'RECHAZADO' });
      fetchOrders();
    } catch {
      alert('Error al rechazar el pedido');
    }
  };

  const activeOrders = orders.filter((o) =>
    ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO'].includes(o.estado?.nombre),
  );

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-6">Tablero de pedidos</h1>

        {/* Kanban */}
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colOrders = activeOrders.filter((o) => col.statuses.includes(o.estado?.nombre));
            return (
              <div key={col.label}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-semibold text-text">{col.label}</h2>
                  <span className="bg-background border border-border text-text-secondary text-xs rounded-full px-2 py-0.5">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-sm text-text-secondary bg-white rounded-2xl border border-border">
                      Sin pedidos
                    </div>
                  )}
                  {colOrders.map((order) => (
                    <Card key={order.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-text">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span className="text-xs text-text-secondary">
                          {new Date(order.createdAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary mb-2 space-y-0.5">
                        {order.items?.map((i) => (
                          <p key={i.id}>{i.quantity}× {i.productName}</p>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-text mb-3">${Number(order.total).toFixed(2)}</p>
                      <div className="flex gap-2">
                        {NEXT_STATUS[order.estado?.nombre] && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusChange(order.id, NEXT_STATUS[order.estado?.nombre])}
                          >
                            {ACTION_LABELS[order.estado?.nombre]}
                          </Button>
                        )}
                        {order.estado?.nombre === 'PENDIENTE' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(order.id)}
                          >
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
