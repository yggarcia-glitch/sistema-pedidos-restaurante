const types = {
  ok: 'bg-ok text-ok-text',
  warn: 'bg-warn text-warn-text',
  info: 'bg-info text-info-text',
  default: 'bg-background text-txt-2 border border-border',
  acc: 'bg-primary text-white',
};

export function Badge({ type = 'default', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${types[type]} ${className}`}
    >
      {children}
    </span>
  );
}
