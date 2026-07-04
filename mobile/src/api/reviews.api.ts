import api from './axios';
import { Review } from '@/src/types';

interface CreateReviewPayload {
  restaurantId: string;
  orderId?: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  create: (data: CreateReviewPayload) => api.post<Review>('/reviews', data),
  remove: (id: string) => api.delete(`/reviews/${id}`),
};
