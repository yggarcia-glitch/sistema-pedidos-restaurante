import api from './axios';

export const restaurantsApi = {
  findAll: (params) => api.get('/restaurants', { params }),
  findNearby: (params) => api.get('/restaurants/nearby', { params }),
  findOne: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.patch(`/restaurants/${id}`, data),
  remove: (id) => api.delete(`/restaurants/${id}`),
  toggleOpen: (id) => api.patch(`/restaurants/${id}/toggle-open`),
  setSchedules: (id, data) => api.post(`/restaurants/${id}/schedules`, data),
  getSchedules: (id) => api.get(`/restaurants/${id}/schedules`),
  getReviews: (id, params) => api.get(`/restaurants/${id}/reviews`, { params }),
};
