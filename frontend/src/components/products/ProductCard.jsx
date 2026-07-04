import { Button } from '../ui/Button';

export function ProductCard({ product, onSelect }) {
  const { name, description, price, discountPct, imageUrl, isAvailable } = product;
  const finalPrice = discountPct > 0 ? Number(price) * (1 - discountPct / 100) : Number(price);

  return (
    <div
      className={`flex gap-3 p-3 bg-white rounded-2xl border border-border ${
        !isAvailable ? 'opacity-50' : 'hover:shadow-sm cursor-pointer'
      } transition`}
      onClick={() => isAvailable && onSelect(product)}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text text-sm">{name}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-primary text-sm">${finalPrice.toFixed(2)}</span>
          {discountPct > 0 && (
            <span className="text-xs line-through text-text-secondary">${Number(price).toFixed(2)}</span>
          )}
          {!isAvailable && <span className="text-xs text-red-500">No disponible</span>}
        </div>
      </div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-background flex items-center justify-center flex-shrink-0 text-2xl">
          🍔
        </div>
      )}
    </div>
  );
}
