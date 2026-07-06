// Fila horizontal de chips reutilizable (categorías, filtros, tabs).
// items: [{ value, label }] | strings. active: value seleccionado.
export function CategoryTabs({ items = [], active, onChange, className = '' }) {
  return (
    <div className={`flex gap-[6px] overflow-x-auto ${className}`}>
      {items.map((it) => {
        const value = typeof it === 'object' ? it.value : it;
        const label = typeof it === 'object' ? it.label : it;
        const isActive = active === value;
        return (
          <button
            key={value ?? label}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap text-[10px] px-[11px] py-[5px] rounded-full border cursor-pointer ${
              isActive
                ? 'bg-primary border-primary text-white'
                : 'border-border text-txt-2'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
