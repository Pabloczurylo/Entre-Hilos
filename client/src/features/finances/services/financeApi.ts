import { apiClient } from '@/shared/services/api';
import { Transaction, DashboardMetrics, CreateExpenseDTO, CreateIncomeDTO } from '../types';

export const financeApi = {
  getDashboard: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<DashboardMetrics>(`/finances/dashboard${query}`);
  },

  getTransactions: (filters?: {
    type?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Transaction[]>(`/finances/transactions${query}`);
  },

  createExpense: (data: CreateExpenseDTO) =>
    apiClient<Transaction>('/finances/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createIncome: (data: CreateIncomeDTO) =>
    apiClient<Transaction>('/finances/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
