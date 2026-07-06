import { Link } from 'react-router-dom';
import { money } from '../../lib/format';

export function RestaurantCard({ restaurant }) {
  const { id, name, rating, deliveryTime, deliveryFee, coverUrl, categories } = restaurant;
  const categoria = categories?.[0]?.name ?? 'Restaurante';

  return (
    <Link
      to={`/restaurant/${id}`}
      className="block bg-white border border-border rounded-[10px] overflow-hidden cursor-pointer hover:border-primary transition-colors"
    >
      {/* Imagen placeholder */}
      <div className="bg-background h-[70px] w-full overflow-hidden">
        {coverUrl && (
          <img src={coverUrl} alt={name} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="p-[10px]">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[13px] text-txt truncate">{name}</p>
          <span className="text-[11px] text-primary font-semibold whitespace-nowrap">
            ★ {Number(rating ?? 0).toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-[6px] text-[10px] text-txt-2 mt-[3px]">
          <span>{categoria}</span>
          <span>·</span>
          <span>🛵 {money(deliveryFee)}</span>
          <span>·</span>
          <span>⏱ {deliveryTime ?? 30} min</span>
        </div>
      </div>
    </Link>
  );
}
