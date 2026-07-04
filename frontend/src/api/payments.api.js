import api from './axios';

export const paymentsApi = {
  create: (data) => api.post('/payments', data),
  findByOrderId: (orderId) => api.get(`/payments/${orderId}`),
  confirm: (id) => api.patch(`/payments/${id}/confirm`),
};
