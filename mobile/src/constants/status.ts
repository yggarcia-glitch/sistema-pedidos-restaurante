import { OrderStatus } from '@/src/types';

// Etiquetas legibles y color de badge por estado de pedido.
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: 'ok' | 'warn' | 'info' | 'danger' | 'default' }
> = {
  [OrderStatus.PENDIENTE]: { label: 'Pendiente', badge: 'warn' },
  [OrderStatus.CONFIRMADO]: { label: 'Confirmado', badge: 'info' },
  [OrderStatus.EN_PREPARACION]: { label: 'En preparación', badge: 'info' },
  [OrderStatus.LISTO]: { label: 'Listo', badge: 'info' },
  [OrderStatus.EN_CAMINO]: { label: 'En camino', badge: 'info' },
  [OrderStatus.ENTREGADO]: { label: 'Entregado', badge: 'ok' },
  [OrderStatus.CANCELADO]: { label: 'Cancelado', badge: 'danger' },
  [OrderStatus.RECHAZADO]: { label: 'Rechazado', badge: 'danger' },
};

// Secuencia de estados para el stepper de seguimiento (flujo feliz).
export const ORDER_FLOW: OrderStatus[] = [
  OrderStatus.PENDIENTE,
  OrderStatus.CONFIRMADO,
  OrderStatus.EN_PREPARACION,
  OrderStatus.LISTO,
  OrderStatus.EN_CAMINO,
  OrderStatus.ENTREGADO,
];

// Formatea un valor monetario (Prisma Decimal llega como string).
export function money(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return `$${n.toFixed(2)}`;
}
