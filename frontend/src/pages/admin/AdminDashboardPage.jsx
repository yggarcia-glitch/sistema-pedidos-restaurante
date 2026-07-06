import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ordersApi } from '../../api/orders.api';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { money, statusMeta } from '../../lib/format';

const isToday = (d) => new Date(d).toDateString() === new Date().toDateString();

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, restaurants: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/restaurants'), ordersApi.findAll({ limit: 10 })])
      .then(([uRes, rRes, oRes]) => {
        setStats({
          users: Array.isArray(uRes.data) ? uRes.data.length : uRes.data.total ?? 0,
          restaurants: rRes.data.total ?? 0,
        });
        setOrders(oRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const todayIncome = todayOrders
    .filter((o) => o.estado?.nombre === 'ENTREGADO')
    .reduce((s, o) => s + Number(o.total), 0);

  if (loading) return <SidebarLayout><PageSpinner /></SidebarLayout>;

  return (
    <SidebarLayout>
      <TopBar title="Vista general" subtitle="Estado del sistema" />

      <div className="p-[22px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[16px]">
          <StatCard icon="👥" label="Usuarios" value={stats.users} tint="info" />
          <StatCard icon="🏪" label="Restaurantes" value={stats.restaurants} tint="primary" />
          <StatCard icon="📦" label="Pedidos hoy" value={todayOrders.length} tint="warn" />
          <StatCard icon="💰" label="Ingresos hoy" value={money(todayIncome)} tint="ok" />
        </div>

        <div className="bg-white border border-border rounded-[12px] p-[16px] shadow-sm">
          <h2 className="text-[13px] font-bold text-txt mb-[12px]">Actividad reciente</h2>
          {orders.length === 0 ? (
            <p className="text-[12px] text-txt-2">No hay actividad todavía</p>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => {
                const meta = statusMeta(order.estado?.nombre);
                const time = new Date(order.createdAt).toLocaleString('es-EC', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={order.id} className="flex items-center gap-[10px] py-[9px]">
                    <div className="w-[30px] h-[30px] rounded-full bg-primary-light flex items-center justify-center text-[13px] flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-txt truncate">
                        Pedido #{order.id.slice(0, 4).toUpperCase()} · {order.restaurant?.name} · {money(order.total)}
                      </p>
                      <p className="text-[10px] text-txt-3">{time}</p>
                    </div>
                    <Badge type={meta.type}>{meta.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
