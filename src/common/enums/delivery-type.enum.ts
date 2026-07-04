// Los tipos de entrega viven en la tabla `tipos_entrega`.
export const DeliveryType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
} as const;

export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];
