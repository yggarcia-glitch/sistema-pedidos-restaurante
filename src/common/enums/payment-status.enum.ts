// Los estados de pago viven en la tabla `estados_pago`.
export const PaymentStatus = {
  PENDIENTE: 'PENDIENTE',
  COMPLETADO: 'COMPLETADO',
  FALLIDO: 'FALLIDO',
  REEMBOLSADO: 'REEMBOLSADO',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
