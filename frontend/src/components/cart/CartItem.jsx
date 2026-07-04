import { useCart } from '../../hooks/useCart';

export function CartItemRow({ item }) {
  const { updateItem, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-text">{item.product?.name ?? item.productName}</p>
        {item.choices?.map((c) => (
          <p key={c.id} className="text-xs text-text-secondary">
            + {c.choice?.name ?? c.choiceName}
          </p>
        ))}
        <p className="text-sm font-semibold text-primary mt-1">
          ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => updateItem(item.id, item.quantity - 1)}
          className="w-7 h-7 rounded-full border border-border text-lg leading-none hover:bg-background"
        >
          −
        </button>
        <span className="text-sm w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => updateItem(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-border text-lg leading-none hover:bg-background"
        >
          +
        </button>
        <button
          onClick={() => removeItem(item.id)}
          className="ml-1 text-red-400 hover:text-red-600 text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
