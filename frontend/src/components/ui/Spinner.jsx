export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-10 h-10' }[size];
  return (
    <div
      className={`${s} border-2 border-border border-t-primary rounded-full animate-spin ${className}`}
    />
  );
}

// Spinner centrado para estados de carga de página.
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  );
}
