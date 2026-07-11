import api from './axios';
import { DeliveryType, Order, OrderStatus, Paginated } from '@/src/types';

interface CreateOrderPayload {
  addressId?: string;
  deliveryType?: DeliveryType;
  notes?: string;
}

export const ordersApi = {
  create: (data: CreateOrderPayload) => api.post<Order>('/orders', data),
  // GET /orders devuelve paginado: { data, total, page, totalPages }
  findAll: (params?: Record<string, unknown>) =>
    api.get<Paginated<Order>>('/orders', { params }),
  findOne: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, data: { status: OrderStatus; note?: string }) =>
    api.patch<Order>(`/orders/${id}/status`, data),
  cancel: (id: string) => api.patch<Order>(`/orders/${id}/cancel`),
  acceptDriver: (id: string) => api.patch<Order>(`/orders/${id}/accept-driver`),
  rejectDriver: (id: string) => api.patch<Order>(`/orders/${id}/reject-driver`),
  pickup: (id: string) => api.patch<Order>(`/orders/${id}/pickup`),
  deliver: (id: string) => api.patch<Order>(`/orders/${id}/deliver`),
};
