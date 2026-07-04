import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';
import { productsApi } from '../../api/products.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { CategoryTabs } from '../../components/restaurants/CategoryTabs';
import { ScheduleBadge } from '../../components/restaurants/ScheduleBadge';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductModal } from '../../components/products/ProductModal';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itemCount, subtotal } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      restaurantsApi.findOne(id),
      restaurantsApi.getSchedules(id),
      restaurantsApi.getReviews(id),
    ])
      .then(([rRes, sRes, revRes]) => {
        setRestaurant(rRes.data);
        setSchedules(sRes.data.schedules ?? []);
        setReviews(revRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!restaurant) return;
    productsApi
      .findAll(id, { categoryId: activeCategoryId ?? undefined, isAvailable: true })
      .then(({ data }) => setProducts(data));
  }, [id, activeCategoryId, restaurant]);

  if (loading) return <PageSpinner />;
  if (!restaurant) return <div className="text-center p-8 text-text-secondary">Restaurante no encontrado</div>;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-6">
      <Navbar />

      {/* Banner */}
      <div className="relative h-48 bg-background overflow-hidden">
        {restaurant.coverUrl ? (
          <img src={restaurant.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-light to-background flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Info header */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🍽️</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl text-text">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-sm text-text-secondary mt-0.5">{restaurant.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-secondary">
                {restaurant.rating > 0 && <span>⭐ {restaurant.rating.toFixed(1)} ({restaurant.totalReviews})</span>}
                {restaurant.deliveryTime && <span>⏱ {restaurant.deliveryTime} min</span>}
                <span>🚚 ${Number(restaurant.deliveryFee).toFixed(2)}</span>
                <span>📍 {restaurant.city}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <ScheduleBadge schedules={schedules} />
          </div>
        </div>

        {/* Tabs de categorías */}
        {restaurant.categories?.length > 0 && (
          <div className="mb-4">
            <CategoryTabs
              categories={restaurant.categories}
              activeId={activeCategoryId}
              onChange={setActiveCategoryId}
            />
          </div>
        )}

        {/* Lista de productos */}
        <div className="space-y-3 mb-8">
          {products.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">No hay productos disponibles</div>
          ) : (
            products.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))
          )}
        </div>

        {/* Reseñas */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="font-semibold text-text mb-3">Reseñas ({reviews.length})</h2>
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {itemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-dark transition font-medium"
          >
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {itemCount}
            </span>
            Ver carrito • ${subtotal.toFixed(2)}
          </button>
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <BottomNav />
    </div>
  );
}
