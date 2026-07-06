// Formatea un valor monetario (Prisma Decimal llega como string).
export const money = (v) => `$${Number(v ?? 0).toFixed(2)}`;

// Iniciales para avatares.
export const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Metadata de estados de pedido: etiqueta + tipo de Badge.
export const ORDER_STATUS_META = {
  PENDIENTE: { label: 'Pendiente', type: 'warn' },
  CONFIRMADO: { label: 'Confirmado', type: 'info' },
  EN_PREPARACION: { label: 'Preparando', type: 'info' },
  LISTO: { label: 'Listo', type: 'info' },
  EN_CAMINO: { label: 'En camino', type: 'info' },
  ENTREGADO: { label: 'Entregado', type: 'ok' },
  CANCELADO: { label: 'Cancelado', type: 'default' },
  RECHAZADO: { label: 'Rechazado', type: 'default' },
};

export const statusMeta = (nombre) =>
  ORDER_STATUS_META[nombre] ?? { label: nombre ?? '—', type: 'default' };
