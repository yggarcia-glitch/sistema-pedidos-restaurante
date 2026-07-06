import { useCart } from '../../hooks/useCart';
import { Card } from '../ui/Card';
import { money } from '../../lib/format';

export function CartItemRow({ item }) {
  const { updateItem, removeItem } = useCart();
  const name = item.product?.name ?? item.productName;
  const lineTotal = money(Number(item.unitPrice) * item.quantity);

  const dec = () =>
    item.quantity <= 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1);

  return (
    <Card className="mb-[8px]">
      {/* Fila 1: nombre + precio */}
      <div className="flex items-center justify-between mb-[5px]">
        <p className="font-bold text-[12px] text-txt truncate mr-2">{name}</p>
        <p className="text-[12px] font-bold text-primary whitespace-nowrap">{lineTotal}</p>
      </div>

      {/* Fila 2: nota + control de cantidad */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-txt-3 truncate mr-2">
          {item.notes || item.choices?.map((c) => c.choice?.name ?? c.choiceName).filter(Boolean).join(', ') || '—'}
        </p>
        <div className="bg-background rounded-full px-[11px] py-[4px] flex items-center gap-[10px] flex-shrink-0">
          <button onClick={dec} className="text-primary font-bold text-[16px] leading-none cursor-pointer">
            −
          </button>
          <span className="font-bold text-[12px] text-txt">{item.quantity}</span>
          <button
            onClick={() => updateItem(item.id, item.quantity + 1)}
            className="text-primary font-bold text-[16px] leading-none cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </Card>
  );
}
