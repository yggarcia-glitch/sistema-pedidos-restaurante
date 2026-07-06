// Stepper horizontal de 4 pasos según el diseño aprobado.
const STEPS = ['Confirmado', 'Preparando', 'En camino', 'Entregado'];

// Cuántos pasos se consideran completados según el estado del backend.
const COMPLETED = {
  PENDIENTE: 0,
  CONFIRMADO: 1,
  EN_PREPARACION: 2,
  LISTO: 2,
  EN_CAMINO: 3,
  ENTREGADO: 4,
};

export function OrderStatusStepper({ currentStatus }) {
  if (['CANCELADO', 'RECHAZADO'].includes(currentStatus)) {
    return (
      <div className="flex items-center justify-center py-6 text-center">
        <div>
          <span className="text-[28px]">❌</span>
          <p className="font-bold text-red-600 text-[13px] mt-1">
            Pedido {currentStatus === 'CANCELADO' ? 'cancelado' : 'rechazado'}
          </p>
        </div>
      </div>
    );
  }

  const completed = COMPLETED[currentStatus] ?? 0;
  const fraction = Math.max(0, completed - 1) / (STEPS.length - 1);

  return (
    <div className="flex justify-between items-start relative mb-[16px]">
      {/* Línea de fondo */}
      <div className="absolute top-[9px] left-[12px] right-[12px] h-[2px] bg-border" />
      {/* Línea de progreso */}
      <div
        className="absolute top-[9px] left-[12px] h-[2px] bg-primary"
        style={{ width: `calc((100% - 24px) * ${fraction})` }}
      />

      {STEPS.map((label, idx) => {
        const done = idx < completed;
        return (
          <div key={label} className="text-center z-10 w-1/4">
            <div
              className={`w-[20px] h-[20px] rounded-full border-2 mx-auto flex items-center justify-center text-[10px] ${
                done
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background border-border'
              }`}
            >
              {done && '✓'}
            </div>
            <p
              className={`text-[9px] mt-[4px] ${
                done ? 'text-primary font-bold' : 'text-txt-3'
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
