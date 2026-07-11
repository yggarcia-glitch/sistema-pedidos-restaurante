import api from './axios';
import { DriverProfile, Order } from '@/src/types';

export const driversApi = {
  getMe: () => api.get<DriverProfile>('/drivers/me'),
  setAvailability: (isAvailable: boolean) =>
    api.patch<DriverProfile>('/drivers/me/availability', { isAvailable }),
  updateLocation: (lat: number, lng: number) =>
    api.patch<DriverProfile>('/drivers/me/location', { lat, lng }),
  getCurrentOrder: () => api.get<Order | null>('/drivers/me/current-order'),
};
