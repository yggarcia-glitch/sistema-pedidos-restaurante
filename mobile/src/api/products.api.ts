import api from './axios';
import { Product } from '@/src/types';

interface ProductQuery {
  categoryId?: string;
  isAvailable?: boolean;
}

export const productsApi = {
  // Devuelve un array plano de productos (con options.choices, category, tags)
  findAll: (restaurantId: string, params?: ProductQuery) =>
    api.get<Product[]>(`/restaurants/${restaurantId}/products`, { params }),
  findOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (restaurantId: string, data: Record<string, unknown>) =>
    api.post<Product>(`/restaurants/${restaurantId}/products`, data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Product>(`/products/${id}`, data),
  toggleAvailability: (id: string) =>
    api.patch<Product>(`/products/${id}/toggle-availability`),
  remove: (id: string) => api.delete(`/products/${id}`),
};
