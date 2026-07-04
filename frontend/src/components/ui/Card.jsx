export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
