const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  outline: 'bg-white border border-border text-txt hover:bg-background',
  danger: 'bg-white border border-red-300 text-red-600 hover:bg-red-50',
};

// md respeta el spec base (11px 14px, text-sm); sm para botones compactos.
const sizes = {
  md: 'px-[14px] py-[11px] text-sm',
  sm: 'px-[12px] py-[7px] text-[11px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
        sizes[size] ?? sizes.md
      } ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
