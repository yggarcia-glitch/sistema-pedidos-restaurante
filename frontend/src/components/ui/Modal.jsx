import { useEffect } from 'react';

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[14px] p-5 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[15px] text-txt">{title}</h3>
            <button
              onClick={onClose}
              className="text-txt-2 text-[16px] cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
