import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';
import { productsApi } from '../../api/products.api';
import { CategoryTabs } from '../../components/restaurants/CategoryTabs';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductModal } from '../../components/products/ProductModal';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useCart } from '../../hooks/useCart';
import { money } from '../../lib/format';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itemCount, subtotal } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantsApi
      .findOne(id)
      .then(({ data }) => {
        setRestaurant(data);
        setActiveCategoryId(data.categories?.[0]?.id ?? null);
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
  if (!restaurant)
    return <div className="text-center p-8 text-[12px] text-txt-2">Restaurante no encontrado</div>;

  const categories = restaurant.categories ?? [];
  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const eta = restaurant.deliveryTime ?? 30;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-[90px] bg-background relative">
        {restaurant.coverUrl && (
          <img src={restaurant.coverUrl} alt="" className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-[10px] left-[12px] bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center border border-border text-[14px]"
        >
          ←
        </button>
        <div className="absolute bottom-[-20px] left-[14px] w-[42px] h-[42px] rounded-[12px] bg-white border border-border flex items-center justify-center text-[22px] overflow-hidden">
          {restaurant.logoUrl ? (
            <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            '🍽'
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-[28px]">
        {/* Nombre + favorito */}
        <div className="flex items-center justify-between mb-[4px]">
          <h1 className="text-[16px] font-bold text-txt">{restaurant.name}</h1>
          <span className="text-[16px] cursor-pointer">🤍</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-[8px] mb-[8px]">
          <span className="text-primary font-semibold text-[11px]">
            ★ {Number(restaurant.rating ?? 0).toFixed(1)}
          </span>
          <span className="text-txt-2 text-[10px]">({restaurant.totalReviews ?? 0} reseñas)</span>
          <Badge type={restaurant.isOpenNow ? 'ok' : 'default'}>
            {restaurant.isOpenNow ? 'Abierto' : 'Cerrado'}
          </Badge>
        </div>

        {/* Info */}
        <div className="flex items-center gap-[10px] text-[10px] text-txt-2 mb-[12px]">
          <span>⏱ {eta}–{eta + 10} min</span>
          <span>🛵 {money(restaurant.deliveryFee)}</span>
          <span>🧾 Mín. {money(restaurant.minOrder ?? 0)}</span>
        </div>

        {/* Tabs de categoría */}
        {categories.length > 0 && (
          <div className="mb-[12px]">
            <CategoryTabs
              items={categories.map((c) => ({ value: c.id, label: c.name }))}
              active={activeCategoryId}
              onChange={setActiveCategoryId}
            />
          </div>
        )}

        {/* Título categoría activa */}
        <h2 className="text-[12px] font-bold text-txt mb-[10px]">
          {activeCategory?.name ?? 'Menú'}
        </h2>

        {/* Lista de productos */}
        <div className="pb-28">
          {products.length === 0 ? (
            <p className="text-center text-[12px] text-txt-2 py-8">
              No hay productos todavía
            </p>
          ) : (
            products.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))
          )}
        </div>
      </div>

      {/* Botón flotante del carrito */}
      {itemCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-[20px] right-[20px] bg-primary text-white rounded-full px-[16px] py-[10px] flex items-center gap-[8px] shadow-lg font-semibold text-[13px]"
        >
          🛒 {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'} · {money(subtotal)}
        </button>
      )}

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
