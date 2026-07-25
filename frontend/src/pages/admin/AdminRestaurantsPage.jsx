import { useState, useEffect } from 'react';
import { restaurantsApi } from '../../api/restaurants.api';
import api from '../../api/axios';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { CategoryTabs } from '../../components/restaurants/CategoryTabs';
import { CreateRestaurantModal } from '../../components/admin/CreateRestaurantModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';

const TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'closed', label: 'Cerrados' },
];

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const loadRestaurants = () => {
    setLoading(true);
    restaurantsApi
      .findAll({
        page,
        limit: 15,
        isOpen: filter === 'open' ? true : filter === 'closed' ? false : undefined,
      })
      .then(({ data }) => {
        setRestaurants(data.data);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRestaurants(); }, [page, filter]);

  const toggleActive = async (restaurant) => {
    if (!window.confirm(`${restaurant.isActive ? 'Desactivar' : 'Activar'} ${restaurant.name}?`)) return;
    await api.patch(`/restaurants/${restaurant.id}`, { isActive: !restaurant.isActive });
    loadRestaurants();
  };

  const pending = restaurants.filter((r) => !r.isActive).length;

  return (
    <SidebarLayout>
      <TopBar
        title="Restaurantes"
        subtitle="Gestión de locales"
        actions={
          <div className="flex items-center gap-[10px]">
            {pending > 0 && <Badge type="warn">{pending} pendientes aprobación</Badge>}
            <Button size="sm" onClick={() => setModalOpen(true)}>+ Nuevo local</Button>
          </div>
        }
      />

      <CreateRestaurantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadRestaurants}
      />
      <div className="p-[22px]">
        <div className="mb-[12px]">
          <CategoryTabs
            items={TABS}
            active={filter}
            onChange={(v) => { setFilter(v); setPage(1); }}
          />
        </div>

        {loading ? (
          <PageSpinner />
        ) : restaurants.length === 0 ? (
          <p className="text-center text-[12px] text-txt-2 py-10">No hay restaurantes</p>
        ) : (
          restaurants.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-border rounded-[10px] p-[10px] mb-[8px] flex justify-between items-center"
            >
              <div className="flex items-center min-w-0">
                <div className="w-[38px] h-[38px] bg-background rounded-[9px] flex-shrink-0 overflow-hidden">
                  {r.logoUrl && (
                    <img src={r.logoUrl} alt={r.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="ml-[10px] min-w-0">
                  <p className="font-bold text-[13px] text-txt truncate">{r.name}</p>
                  <p className="text-[11px] text-txt-2 truncate">
                    {r.city} · ★ {Number(r.rating ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[8px] flex-shrink-0">
                <Badge type={r.isOpen ? 'ok' : 'default'}>{r.isOpen ? 'Abierto' : 'Cerrado'}</Badge>
                <span
                  onClick={() => toggleActive(r)}
                  className="text-txt-2 cursor-pointer"
                  title={r.isActive ? 'Desactivar' : 'Activar'}
                >
                  ⋮
                </span>
              </div>
            </div>
          ))
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </SidebarLayout>
  );
}
