export function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !activeId
            ? 'bg-primary text-white'
            : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeId === cat.id
              ? 'bg-primary text-white'
              : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
