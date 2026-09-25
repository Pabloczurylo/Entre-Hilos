import { apiClient } from '@/shared/services/api';
import { Quote, CreateQuoteDTO, CalculateQuoteInput } from '../types';

export const quoteApi = {
  calculate: (data: CalculateQuoteInput) =>
    apiClient<{ suggestedPrice: number }>('/quotes/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiClient<Quote[]>('/quotes'),

  getById: (id: string) => apiClient<Quote>(`/quotes/${id}`),

  create: (data: CreateQuoteDTO) =>
    apiClient<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Quote['status']) =>
    apiClient<Quote>(`/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  convertToOrder: (id: string, payload: {
    customerId: string;
    depositAmount?: number;
    depositPaymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
    deliveryDate?: string;
    customizationDetails?: string;
  }) =>
    apiClient<any>(`/quotes/${id}/convert-to-order`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
