import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const STATUS_COLORS = { PENDIENTE: 'yellow', CONFIRMADO: 'blue', EN_PREPARACION: 'orange', LISTO: 'primary' };
const STATUS_LABELS = { PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', EN_PREPARACION: 'En preparación', LISTO: 'Listo' };

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      restaurantsApi.findAll({ limit: 1 }),
      ordersApi.findAll({ limit: 20 }),
    ])
      .then(([rRes, oRes]) => {
        setRestaurant(rRes.data.data[0] ?? null);
        setOrders(oRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    setToggling(true);
    try {
      const { data } = await restaurantsApi.toggleOpen(restaurant.id);
      setRestaurant((r) => ({ ...r, isOpen: data.isOpen }));
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <PageSpinner />;

  const activeOrders = orders.filter((o) =>
    ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO'].includes(o.status),
  );
  const todayIncome = orders
    .filter((o) => o.status === 'ENTREGADO' && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text">Dashboard</h1>
            {restaurant && <p className="text-sm text-text-secondary">{restaurant.name}</p>}
          </div>
          {restaurant && (
            <button
              onClick={handleToggleOpen}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                restaurant.isOpen
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              {restaurant.isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Activos hoy', value: activeOrders.length, icon: '📦' },
            { label: 'Ingresos hoy', value: `$${todayIncome.toFixed(2)}`, icon: '💰' },
            { label: 'En preparación', value: orders.filter((o) => o.status === 'EN_PREPARACION').length, icon: '👨‍🍳' },
            { label: 'Total pedidos', value: orders.length, icon: '📋' },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-4 text-center">
              <div className="text-3xl mb-1">{kpi.icon}</div>
              <div className="text-2xl font-bold text-text">{kpi.value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{kpi.label}</div>
            </Card>
          ))}
        </div>

        {/* Pedidos activos */}
        <h2 className="font-semibold text-text mb-3">Pedidos activos</h2>
        {activeOrders.length === 0 ? (
          <Card className="p-8 text-center text-text-secondary">No hay pedidos activos</Card>
        ) : (
          <div className="space-y-2">
            {activeOrders.map((order) => (
              <Card key={order.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-text-secondary">{order.items?.length} ítems · ${Number(order.total).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={STATUS_COLORS[order.status] ?? 'gray'}>{STATUS_LABELS[order.status] ?? order.status}</Badge>
                  <Link to="/vendor/orders" className="text-xs text-primary hover:underline">Gestionar →</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
