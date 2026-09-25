import { OrderStatus, PaymentMethod } from '@/shared/types';

export interface Customer {
  id: string;
  name: string;
  instagram?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { orders: number };
}

export interface OrderItem {
  id: string;
  orderId: string;
  catalogItemId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  customizationDetails?: string | null;
}

export interface Order {
  id: string;
  orderNumber?: string | null;
  customerId: string;
  customer: Customer;
  status: OrderStatus;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  deliveryDate?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  customerId?: string;
  newCustomer?: {
    name: string;
    instagram?: string;
    whatsapp?: string;
    notes?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    catalogItemId?: string;
    customizationDetails?: string;
  }>;
  depositAmount?: number;
  depositPaymentMethod?: PaymentMethod;
  deliveryDate?: string;
  notes?: string;
}

export interface PayBalanceDTO {
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}
