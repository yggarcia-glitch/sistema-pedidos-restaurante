import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function ProductModal({ product, open, onClose }) {
  const { addItem, loading, cart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState({});
  const [error, setError] = useState('');

  if (!product) return null;

  const finalPrice =
    product.discountPct > 0
      ? Number(product.price) * (1 - product.discountPct / 100)
      : Number(product.price);

  const toggleChoice = (optionId, choiceId, maxSelect) => {
    setSelectedChoices((prev) => {
      const current = prev[optionId] ?? [];
      if (current.includes(choiceId)) {
        return { ...prev, [optionId]: current.filter((id) => id !== choiceId) };
      }
      if (maxSelect === 1) return { ...prev, [optionId]: [choiceId] };
      if (current.length >= maxSelect) return prev;
      return { ...prev, [optionId]: [...current, choiceId] };
    });
  };

  const handleAdd = async () => {
    if (!isAuthenticated || user?.rol?.nombre !== 'CLIENTE') {
      navigate('/login');
      return;
    }

    const requiredMissing = product.options?.filter(
      (opt) => opt.isRequired && !(selectedChoices[opt.id]?.length),
    );
    if (requiredMissing?.length) {
      setError(`Selecciona una opción para: ${requiredMissing.map((o) => o.name).join(', ')}`);
      return;
    }
    setError('');

    // Si hay items de otro restaurante, confirmar antes de vaciar el carrito
    if (cart?.restaurantId && cart.restaurantId !== product.restaurantId) {
      if (!window.confirm('Tu carrito tiene productos de otro restaurante. ¿Deseas vaciarlo y continuar?')) {
        return;
      }
    }

    const choiceIds = Object.values(selectedChoices).flat();
    await addItem(product.id, quantity, choiceIds);
    onClose();
  };

  const totalPrice = (finalPrice * quantity).toFixed(2);

  return (
    <Modal open={open} onClose={onClose} title={product.name}>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />
      )}
      {product.description && (
        <p className="text-sm text-txt-2 mb-4">{product.description}</p>
      )}

      {/* Opciones del producto */}
      {product.options?.map((opt) => (
        <div key={opt.id} className="mb-4">
          <p className="font-medium text-sm mb-1">
            {opt.name}
            {opt.isRequired && <span className="text-red-500 ml-1">*</span>}
            <span className="text-xs text-txt-2 ml-1">
              {opt.maxSelect > 1 ? `(máx. ${opt.maxSelect})` : ''}
            </span>
          </p>
          <div className="flex flex-col gap-2">
            {opt.choices.map((choice) => {
              const checked = selectedChoices[opt.id]?.includes(choice.id) ?? false;
              return (
                <label
                  key={choice.id}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type={opt.maxSelect === 1 ? 'radio' : 'checkbox'}
                      checked={checked}
                      onChange={() => toggleChoice(opt.id, choice.id, opt.maxSelect)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{choice.name}</span>
                  </div>
                  {Number(choice.extraPrice) > 0 && (
                    <span className="text-xs text-primary">+${Number(choice.extraPrice).toFixed(2)}</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Control de cantidad */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium">Cantidad:</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg hover:bg-background"
          >
            −
          </button>
          <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg hover:bg-background"
          >
            +
          </button>
        </div>
      </div>

      <Button onClick={handleAdd} disabled={loading} className="w-full">
        {loading ? 'Agregando...' : `Agregar al carrito • $${totalPrice}`}
      </Button>
    </Modal>
  );
}
