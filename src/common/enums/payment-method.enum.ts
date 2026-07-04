// Los métodos de pago viven en la tabla `metodos_pago`.
export const PaymentMethod = {
  EFECTIVO: 'EFECTIVO',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
