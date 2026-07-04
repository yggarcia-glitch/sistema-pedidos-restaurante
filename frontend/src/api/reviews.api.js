import api from './axios';

export const reviewsApi = {
  create: (data) => api.post('/reviews', data),
  remove: (id) => api.delete(`/reviews/${id}`),
};
