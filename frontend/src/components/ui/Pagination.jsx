export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const base =
    'min-w-[28px] h-[28px] px-2 rounded-[8px] text-[11px] font-medium cursor-pointer flex items-center justify-center';

  return (
    <div className="flex items-center justify-center gap-[6px] mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${base} bg-white border border-border text-txt-2 disabled:opacity-40`}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${base} ${
            p === page
              ? 'bg-primary text-white'
              : 'bg-white border border-border text-txt-2'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${base} bg-white border border-border text-txt-2 disabled:opacity-40`}
      >
        ›
      </button>
    </div>
  );
}
