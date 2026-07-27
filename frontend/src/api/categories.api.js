import api from './axios';

export const categoriesApi = {
  // Devuelve las categorías genéricas globales + las propias del restaurante.
  findAll: (restaurantId) => api.get(`/restaurants/${restaurantId}/categories`),
  create: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/categories`, data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};
