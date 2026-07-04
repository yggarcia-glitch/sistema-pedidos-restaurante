import api from './axios';
import { AuthResponse, RegisterPayload, User } from '@/src/types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
};
