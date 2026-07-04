import { useState, useEffect } from 'react';
import { restaurantsApi } from '../../api/restaurants.api';
import api from '../../api/axios';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadRestaurants = () => {
    setLoading(true);
    restaurantsApi
      .findAll({ page, limit: 15, isOpen: filter === 'open' ? true : filter === 'closed' ? false : undefined })
      .then(({ data }) => { setRestaurants(data.data); setTotal(data.total); setTotalPages(data.totalPages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRestaurants(); }, [page, filter]);

  const toggleActive = async (restaurant) => {
    await api.patch(`/restaurants/${restaurant.id}`, { isActive: !restaurant.isActive });
    loadRestaurants();
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-4">Gestión de restaurantes ({total})</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[['', 'Todos'], ['open', 'Abiertos'], ['closed', 'Cerrados']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setFilter(val); setPage(1); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${filter === val ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="space-y-2">
            {restaurants.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text">{r.name}</p>
                  <p className="text-xs text-text-secondary">{r.city}, {r.province}</p>
                  <p className="text-xs text-text-secondary">Dueño: {r.owner?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={r.isOpen ? 'green' : 'gray'}>{r.isOpen ? 'Abierto' : 'Cerrado'}</Badge>
                  <Badge color={r.isActive ? 'blue' : 'red'}>{r.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  <button
                    onClick={() => toggleActive(r)}
                    className={`text-xs hover:underline ${r.isActive ? 'text-red-400' : 'text-green-600'}`}
                  >
                    {r.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
            {restaurants.length === 0 && (
              <div className="text-center py-12 text-text-secondary">No hay restaurantes</div>
            )}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <BottomNav />
    </div>
  );
}
