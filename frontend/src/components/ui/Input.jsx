import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-medium text-txt-2 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-background border rounded-[8px] px-3 py-2 text-[12px] text-txt placeholder:text-txt-3 focus:outline-none focus:ring-0 ${
          error ? 'border-red-400' : 'border-border focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-[10px] text-red-500 mt-1">{error}</span>}
    </div>
  );
});
