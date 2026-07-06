import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders.api';
import { Navbar } from '../../components/layout/Navbar';
import { OrderCard } from '../../components/orders/OrderCard';
import { CategoryTabs } from '../../components/restaurants/CategoryTabs';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';

const TABS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
];

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .findAll({ page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data ?? []);
        setTotalPages(data.totalPages ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered =
    activeTab === 'ALL' ? orders : orders.filter((o) => o.estado?.nombre === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-[15px] font-bold text-txt mb-[12px]">Mis pedidos</h1>

        <div className="mb-[12px]">
          <CategoryTabs items={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-center text-[12px] text-txt-2 py-16">No hay pedidos todavía</p>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
