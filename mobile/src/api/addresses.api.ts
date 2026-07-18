import api from './axios';
import { Address } from '@/src/types';

interface AddressPayload {
  label: string;
  street: string;
  city: string;
  province: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export const addressesApi = {
  findAllMine: () => api.get<Address[]>('/addresses'),
  create: (data: AddressPayload) => api.post<Address>('/addresses', data),
  update: (id: string, data: Partial<AddressPayload>) =>
    api.patch<Address>(`/addresses/${id}`, data),
  setDefault: (id: string) => api.patch<Address>(`/addresses/${id}/default`),
  remove: (id: string) => api.delete(`/addresses/${id}`),
};
