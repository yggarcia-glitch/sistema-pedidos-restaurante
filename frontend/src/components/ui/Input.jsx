export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border ${
          error ? 'border-red-400' : 'border-border'
        } bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
