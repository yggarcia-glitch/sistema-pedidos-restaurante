import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { OrderCard } from '../../components/orders/OrderCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';

const TABS = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: 'PENDIENTE,CONFIRMADO,EN_PREPARACION,LISTO,EN_CAMINO' },
  { label: 'Entregados', value: 'ENTREGADO' },
  { label: 'Cancelados', value: 'CANCELADO' },
];

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .findAll({ page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  // Filtrado local por estado según tab activo
  const filtered = activeTab
    ? orders.filter((o) => activeTab.split(',').includes(o.status))
    : orders;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-4">Mis pedidos</h1>

        {/* Tabs de filtro */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value ?? 'all'}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-text-secondary hover:border-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <span className="text-5xl">📋</span>
            <p className="mt-2">No tienes pedidos aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <BottomNav />
    </div>
  );
}
