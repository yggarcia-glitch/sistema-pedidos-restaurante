// Sub-estado de asignación de un pedido a un repartidor. Vive en `orders.driver_status`
// (columna simple, no catálogo) porque es un detalle interno del flujo de reparto,
// independiente del `estado` (EstadoPedido) que ve el cliente.
export const DriverOrderStatus = {
  ASIGNADO: 'ASIGNADO',
  ACEPTADO: 'ACEPTADO',
  RETIRADO: 'RETIRADO',
  ENTREGADO: 'ENTREGADO',
} as const;

export type DriverOrderStatus =
  (typeof DriverOrderStatus)[keyof typeof DriverOrderStatus];

// Estados en los que un repartidor tiene un pedido activo (no puede recibir otro).
export const ACTIVE_DRIVER_STATUSES: string[] = [
  DriverOrderStatus.ASIGNADO,
  DriverOrderStatus.ACEPTADO,
  DriverOrderStatus.RETIRADO,
];
