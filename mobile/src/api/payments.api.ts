import api from './axios';
import { Payment, PaymentMethod } from '@/src/types';

interface CreatePaymentPayload {
  orderId: string;
  method: PaymentMethod;
}

export const paymentsApi = {
  create: (data: CreatePaymentPayload) => api.post<Payment>('/payments', data),
  findByOrderId: (orderId: string) =>
    api.get<Payment>(`/payments/${orderId}`),
  confirm: (id: string) => api.patch<Payment>(`/payments/${id}/confirm`),
};
