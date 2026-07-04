import api from './axios';
import {
  Paginated,
  Restaurant,
  RestaurantSchedule,
  Review,
} from '@/src/types';

interface NearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
}

export const restaurantsApi = {
  // Listado paginado: devuelve { data, total, page, totalPages }
  findAll: (params?: Record<string, unknown>) =>
    api.get<Paginated<Restaurant>>('/restaurants', { params }),
  // Cercanos: devuelve un array con distanceKm calculado por el backend
  findNearby: (params: NearbyParams) =>
    api.get<Restaurant[]>('/restaurants/nearby', { params }),
  findOne: (id: string) => api.get<Restaurant>(`/restaurants/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<Restaurant>('/restaurants', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Restaurant>(`/restaurants/${id}`, data),
  remove: (id: string) => api.delete(`/restaurants/${id}`),
  toggleOpen: (id: string) =>
    api.patch<Restaurant>(`/restaurants/${id}/toggle-open`),
  getSchedules: (id: string) =>
    api.get<{ schedules: RestaurantSchedule[]; isOpenNow: boolean }>(
      `/restaurants/${id}/schedules`,
    ),
  getReviews: (id: string, params?: Record<string, unknown>) =>
    api.get<Review[]>(`/restaurants/${id}/reviews`, { params }),
};
