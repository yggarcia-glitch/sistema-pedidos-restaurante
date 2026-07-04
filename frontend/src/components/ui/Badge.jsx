const colors = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  primary: 'bg-primary-light text-primary',
};

export function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}
