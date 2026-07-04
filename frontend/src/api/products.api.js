import api from './axios';

export const productsApi = {
  findAll: (restaurantId, params) =>
    api.get(`/restaurants/${restaurantId}/products`, { params }),
  findOne: (id) => api.get(`/products/${id}`),
  create: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/products`, data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  toggleAvailability: (id) => api.patch(`/products/${id}/toggle-availability`),
  remove: (id) => api.delete(`/products/${id}`),
};
