import { apiClient } from '@/shared/services/api';
import { Order, Customer, CreateOrderDTO, PayBalanceDTO } from '../types';
import { OrderStatus } from '@/shared/types';

export const orderApi = {
  // Customers
  getCustomers: () => apiClient<Customer[]>('/orders/customers'),
  getCustomerById: (id: string) => apiClient<Customer>(`/orders/customers/${id}`),
  createCustomer: (data: { name: string; instagram?: string; whatsapp?: string; notes?: string }) =>
    apiClient<Customer>('/orders/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Orders
  getOrders: (status?: OrderStatus) =>
    apiClient<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrderById: (id: string) => apiClient<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) =>
    apiClient<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  payBalance: (id: string, data: PayBalanceDTO) =>
    apiClient<Order>(`/orders/${id}/pay-balance`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteOrder: (id: string) =>
    apiClient<{ success: boolean; message: string }>(`/orders/${id}`, { method: 'DELETE' }),
  updateOrder: (
    id: string,
    data: {
      notes?: string;
      deliveryDate?: string | null;
      items?: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        customizationDetails?: string;
      }>;
    }
  ) =>
    apiClient<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
