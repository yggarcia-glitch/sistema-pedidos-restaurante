import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const STATUS_COLORS = { PENDIENTE: 'yellow', CONFIRMADO: 'blue', EN_PREPARACION: 'orange', LISTO: 'primary', ENTREGADO: 'green', CANCELADO: 'red', RECHAZADO: 'red' };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, restaurants: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/restaurants'),
      ordersApi.findAll({ limit: 10 }),
    ])
      .then(([uRes, rRes, oRes]) => {
        setStats({
          users: Array.isArray(uRes.data) ? uRes.data.length : 0,
          restaurants: rRes.data.total ?? 0,
        });
        setOrders(oRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayIncome = todayOrders
    .filter((o) => o.status === 'ENTREGADO')
    .reduce((s, o) => s + Number(o.total), 0);

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-6">Panel de administración</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Usuarios', value: stats.users, icon: '👥' },
            { label: 'Restaurantes', value: stats.restaurants, icon: '🏪' },
            { label: 'Pedidos hoy', value: todayOrders.length, icon: '📦' },
            { label: 'Ingresos hoy', value: `$${todayIncome.toFixed(2)}`, icon: '💰' },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-4 text-center">
              <div className="text-3xl mb-1">{kpi.icon}</div>
              <div className="text-2xl font-bold text-text">{kpi.value}</div>
              <div className="text-xs text-text-secondary">{kpi.label}</div>
            </Card>
          ))}
        </div>

        <h2 className="font-semibold text-text mb-3">Actividad reciente</h2>
        <div className="space-y-2">
          {orders.map((order) => (
            <Card key={order.id} className="p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-text">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-text-secondary">{order.restaurant?.name} · ${Number(order.total).toFixed(2)}</p>
              </div>
              <Badge color={STATUS_COLORS[order.status] ?? 'gray'}>{order.status}</Badge>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
