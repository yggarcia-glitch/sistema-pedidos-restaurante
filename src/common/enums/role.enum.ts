// Antes era un enum de Prisma; ahora los roles viven en la tabla `roles`.
// Se conserva esta constante de strings para que los guards, el JWT y los
// decoradores @Roles(...) sigan comparando por nombre sin cambios.
export const Role = {
  CLIENTE: 'CLIENTE',
  VENDEDOR: 'VENDEDOR',
  ADMIN: 'ADMIN',
  REPARTIDOR: 'REPARTIDOR',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
