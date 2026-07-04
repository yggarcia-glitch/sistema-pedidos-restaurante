import api from './axios';
import { Cart } from '@/src/types';

interface AddItemPayload {
  productId: string;
  quantity: number;
  choiceIds?: string[];
  notes?: string;
}

export const cartApi = {
  get: () => api.get<Cart>('/cart'),
  addItem: (data: AddItemPayload) => api.post<Cart>('/cart/items', data),
  updateItem: (id: string, data: { quantity: number }) =>
    api.patch<Cart>(`/cart/items/${id}`, data),
  removeItem: (id: string) => api.delete<Cart>(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
};
