const STEPS = [
  { key: 'PENDIENTE', label: 'Pendiente', icon: '🕐' },
  { key: 'CONFIRMADO', label: 'Confirmado', icon: '✅' },
  { key: 'EN_PREPARACION', label: 'En preparación', icon: '👨‍🍳' },
  { key: 'LISTO', label: 'Listo', icon: '📦' },
  { key: 'EN_CAMINO', label: 'En camino', icon: '🛵' },
  { key: 'ENTREGADO', label: 'Entregado', icon: '🎉' },
];

export function OrderStatusStepper({ currentStatus }) {
  if (['CANCELADO', 'RECHAZADO'].includes(currentStatus)) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-2xl">
        <div className="text-center">
          <span className="text-4xl">❌</span>
          <p className="font-semibold text-red-600 mt-2">
            Pedido {currentStatus === 'CANCELADO' ? 'Cancelado' : 'Rechazado'}
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center min-w-max">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex flex-col items-center ${active ? 'scale-110' : ''} transition-transform`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    done
                      ? 'bg-primary border-primary text-white'
                      : active
                        ? 'bg-primary-light border-primary'
                        : 'bg-white border-border'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-1 text-center max-w-[60px] leading-tight ${
                    active ? 'text-primary font-semibold' : done ? 'text-text-secondary' : 'text-border'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 rounded-full ${
                    idx < currentIdx ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
