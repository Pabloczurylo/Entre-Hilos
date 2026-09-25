import { apiClient } from '@/shared/services/api';
import { FastSale, CreateFastSaleDTO } from '../types';

export const fastSaleApi = {
  getAll: () => apiClient<FastSale[]>('/fast-sales'),
  create: (data: CreateFastSaleDTO) =>
    apiClient<FastSale>('/fast-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
