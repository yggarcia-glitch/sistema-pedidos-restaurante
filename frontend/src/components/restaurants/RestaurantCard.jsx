import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function RestaurantCard({ restaurant }) {
  const { id, name, logoUrl, rating, deliveryTime, deliveryFee, isOpen, distanceKm } =
    restaurant;

  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="h-32 bg-background flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🍽️</span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text text-sm leading-tight">{name}</h3>
            <Badge color={isOpen ? 'green' : 'red'}>{isOpen ? 'Abierto' : 'Cerrado'}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
            {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
            {deliveryTime && <span>⏱ {deliveryTime} min</span>}
            <span>🚚 ${Number(deliveryFee).toFixed(2)}</span>
            {distanceKm !== undefined && <span>📍 {distanceKm} km</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
