import api from './axios';

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  findAll: (params) => api.get('/orders', { params }),
  findOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};
