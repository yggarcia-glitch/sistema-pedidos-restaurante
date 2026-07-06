import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { RestaurantCard } from '../../components/restaurants/RestaurantCard';
import { RestaurantMap } from '../../components/restaurants/RestaurantMap';
import { PageSpinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useNearby } from '../../hooks/useNearby';

const CATEGORIES = [
  { label: 'Todo', kw: null },
  { label: '🔥 Rápido', kw: 'rápid' },
  { label: '🍕 Pizza', kw: 'pizza' },
  { label: '🍣 Sushi', kw: 'sushi' },
  { label: '🍗 Pollo', kw: 'pollo' },
  { label: '🥗 Saludable', kw: 'salud' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [activeKw, setActiveKw] = useState(null);

  const { data, page, totalPages, loading, error, setPage } = useRestaurants({ limit: 12 });
  const { coords, nearby } = useNearby();

  const filtered = data.filter((r) => {
    const matchName = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !activeKw ||
      r.categories?.some((c) => c.name.toLowerCase().includes(activeKw)) ||
      r.name.toLowerCase().includes(activeKw);
    return matchName && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Fila 1: ubicación + buscador */}
        <div className="flex items-center gap-[14px] mb-[12px]">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-primary">📍</span>
            <span className="font-semibold text-[11px] text-txt">Cuenca</span>
            <span className="text-txt-3">▾</span>
          </div>
          <div className="bg-background rounded-full px-[14px] py-[8px] flex items-center gap-[8px] border border-border flex-1 max-w-lg">
            <span className="text-txt-3">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes o platillos..."
              className="bg-transparent text-[12px] text-txt placeholder:text-txt-3 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Fila 2: chips de categoría */}
        <div className="flex gap-[6px] overflow-x-auto mb-[14px]">
          {CATEGORIES.map((cat) => {
            const active = activeKw === cat.kw;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveKw(cat.kw)}
                className={`whitespace-nowrap text-[10px] px-[11px] py-[5px] rounded-full border cursor-pointer ${
                  active ? 'bg-primary border-primary text-white' : 'border-border text-txt-2'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Mapa */}
        <div className="mb-[14px]">
          <RestaurantMap restaurants={nearby} userCoords={coords} />
        </div>

        {/* Grid de restaurantes */}
        <h2 className="text-[13px] font-bold text-txt mb-[10px]">Cerca de ti</h2>

        {loading ? (
          <PageSpinner />
        ) : error ? (
          <p className="text-center text-[12px] text-red-500 py-8">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[12px] text-txt-2 py-10">
            No hay restaurantes todavía
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px]">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
