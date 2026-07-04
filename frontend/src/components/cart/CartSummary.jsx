export function CartSummary({ subtotal, deliveryFee = 0, discount = 0 }) {
  const total = subtotal + deliveryFee - discount;
  return (
    <div className="bg-background rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between text-text-secondary">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-text-secondary">
        <span>Envío</span>
        <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Gratis'}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Descuento</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-text border-t border-border pt-2 mt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
