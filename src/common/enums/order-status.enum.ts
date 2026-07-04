// Los estados de pedido viven en la tabla `estados_pedido`.
// Esta constante mantiene los nombres para la lógica de transiciones.
export const OrderStatus = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_PREPARACION: 'EN_PREPARACION',
  LISTO: 'LISTO',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  RECHAZADO: 'RECHAZADO',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
