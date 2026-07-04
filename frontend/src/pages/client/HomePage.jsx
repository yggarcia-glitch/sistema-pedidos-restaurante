import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { RestaurantCard } from '../../components/restaurants/RestaurantCard';
import { RestaurantMap } from '../../components/restaurants/RestaurantMap';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useNearby } from '../../hooks/useNearby';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const { data, page, totalPages, loading, setPage } = useRestaurants({
    city: cityFilter || undefined,
    limit: 12,
  });

  const { coords, nearby, loading: nearbyLoading } = useNearby();

  // Filtra los resultados localmente por nombre si hay texto en el buscador
  const filtered = search
    ? data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Buscador */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar restaurantes..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Mapa de restaurantes cercanos */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-text mb-3">Cerca de ti</h2>
          <RestaurantMap restaurants={nearby} userCoords={coords} />
        </section>

        {/* Restaurantes cercanos */}
        {nearby.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-text mb-3">
              Restaurantes cercanos ({nearby.length})
            </h2>
            {nearbyLoading ? (
              <PageSpinner />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {nearby.slice(0, 4).map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Todos los restaurantes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-text">Todos los restaurantes</h2>
            <input
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
              placeholder="Ciudad..."
              className="text-sm px-3 py-1.5 rounded-xl border border-border bg-white w-32 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {loading ? (
            <PageSpinner />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <span className="text-4xl">🍽️</span>
              <p className="mt-2">No se encontraron restaurantes</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
