import { Restaurant } from '@/src/types';

// Nivel de precio ($/$$/$$$) derivado del pedido mínimo del restaurante, ya que
// no existe un campo de precio promedio en el backend. Umbrales pensados para
// USD (mercado local de RestauMap).
export function priceTier(restaurant: Pick<Restaurant, 'minOrder'>): '$' | '$$' | '$$$' {
  const min = Number(restaurant.minOrder ?? 0);
  if (min < 5) return '$';
  if (min < 12) return '$$';
  return '$$$';
}
