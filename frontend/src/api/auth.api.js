import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
};
