import { money } from '../../lib/format';

export function ProductCard({ product, onSelect }) {
  const { name, description, price, discountPct, imageUrl, isAvailable } = product;
  const finalPrice =
    discountPct > 0 ? Number(price) * (1 - discountPct / 100) : Number(price);

  return (
    <div
      className={`bg-white border border-border rounded-[10px] p-[10px] mb-[8px] flex justify-between ${
        isAvailable ? 'cursor-pointer hover:border-primary transition-colors' : 'opacity-50'
      }`}
      onClick={() => isAvailable && onSelect(product)}
    >
      {/* Izquierda */}
      <div className="flex-1 mr-[10px] min-w-0">
        <p className="text-[12px] font-bold text-txt mb-[3px]">{name}</p>
        {description && (
          <p className="text-[10px] text-txt-2 mb-[5px] line-clamp-2">{description}</p>
        )}
        <p className="text-[13px] font-bold text-primary">{money(finalPrice)}</p>
      </div>

      {/* Derecha: imagen + botón agregar */}
      <div className="w-[58px] h-[58px] bg-background rounded-[10px] flex-shrink-0 relative overflow-hidden">
        {imageUrl && (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        )}
        {isAvailable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-[-6px] right-[-6px] w-[22px] h-[22px] rounded-full bg-primary text-white flex items-center justify-center text-[14px] font-bold shadow"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
