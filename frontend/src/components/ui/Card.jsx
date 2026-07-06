export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-border rounded-[10px] p-[10px] shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
