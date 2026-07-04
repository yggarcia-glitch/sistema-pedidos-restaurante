const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50',
  secondary: 'bg-white border border-border text-text hover:bg-background disabled:opacity-50',
  ghost: 'text-primary hover:bg-primary-light disabled:opacity-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
