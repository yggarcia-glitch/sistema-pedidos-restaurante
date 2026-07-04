import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const STATUS_COLORS = {
  PENDIENTE: 'yellow',
  CONFIRMADO: 'blue',
  EN_PREPARACION: 'orange',
  LISTO: 'primary',
  EN_CAMINO: 'blue',
  ENTREGADO: 'green',
  CANCELADO: 'red',
  RECHAZADO: 'red',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  RECHAZADO: 'Rechazado',
};

export function OrderCard({ order }) {
  const { id, restaurant, estado, total, createdAt, items } = order;
  const status = estado?.nombre; // la API ahora envía el estado como { id, nombre }
  const date = new Date(createdAt).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-text">{restaurant?.name ?? 'Restaurante'}</p>
          <p className="text-xs text-text-secondary mt-0.5">{date}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {items?.length ?? 0} {items?.length === 1 ? 'ítem' : 'ítems'} • ${Number(total).toFixed(2)}
          </p>
        </div>
        <Badge color={STATUS_COLORS[status] ?? 'gray'}>{STATUS_LABELS[status] ?? status}</Badge>
      </div>
      <div className="flex gap-2 mt-3">
        <Link
          to={`/tracking/${id}`}
          className="text-xs text-primary hover:underline"
        >
          Ver detalle →
        </Link>
        {restaurant?.id && (
          <Link
            to={`/restaurant/${restaurant.id}`}
            className="text-xs text-text-secondary hover:underline ml-3"
          >
            Volver a pedir
          </Link>
        )}
      </div>
    </Card>
  );
}
