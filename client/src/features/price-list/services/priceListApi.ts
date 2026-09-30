import { apiClient } from '@/shared/services/api';

export interface PriceItem {
  id: string;
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePriceItemDTO {
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  notes?: string;
}

export interface UpdatePriceItemDTO {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  notes?: string;
}

export const priceListApi = {
  getAll: () => apiClient<PriceItem[]>('/price-list'),

  getById: (id: string) => apiClient<PriceItem>(`/price-list/${id}`),

  create: (data: CreatePriceItemDTO) =>
    apiClient<PriceItem>('/price-list', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePriceItemDTO) =>
    apiClient<PriceItem>(`/price-list/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/price-list/${id}`, {
      method: 'DELETE',
    }),

  resetDefaults: () =>
    apiClient<PriceItem[]>('/price-list/reset-defaults', {
      method: 'POST',
    }),
};
