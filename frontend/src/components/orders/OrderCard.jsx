import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { money, statusMeta } from '../../lib/format';

export function OrderCard({ order }) {
  const { id, restaurant, estado, total, createdAt } = order;
  const navigate = useNavigate();
  const meta = statusMeta(estado?.nombre);
  const isDelivered = estado?.nombre === 'ENTREGADO';
  const date = new Date(createdAt).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="mb-[10px]">
      {/* Fila 1: restaurante + estado */}
      <div className="flex items-center justify-between mb-[5px]">
        <p className="font-bold text-[13px] text-txt truncate mr-2">
          {restaurant?.name ?? 'Restaurante'}
        </p>
        <Badge type={meta.type}>{meta.label}</Badge>
      </div>

      {/* Fila 2: fecha + total */}
      <div className="flex items-center justify-between mb-[10px]">
        <p className="text-[10px] text-txt-2">{date}</p>
        <p className="text-[13px] font-bold text-primary">{money(total)}</p>
      </div>

      {/* Fila 3: acciones */}
      <div className="flex gap-[6px]">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/tracking/${id}`)}
        >
          Ver detalle
        </Button>
        {isDelivered && restaurant?.id && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          >
            Repetir
          </Button>
        )}
      </div>
    </Card>
  );
}
