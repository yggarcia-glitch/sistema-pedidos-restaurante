import api from './axios';
import { User } from '@/src/types';

export const usersApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get<User[]>('/users', { params }),
  findOne: (id: string) => api.get<User>(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<User>(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};
