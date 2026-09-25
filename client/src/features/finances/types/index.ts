import { PaymentMethod, TransactionType, TransactionCategory } from '@/shared/types';
import { Order } from '@/features/orders/types';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  paymentMethod?: PaymentMethod | null;
  description: string;
  date: string;
  orderId?: string | null;
  order?: {
    id: string;
    orderNumber?: string | null;
    customer: { name: string };
  } | null;
}

export interface DashboardMetrics {
  period: {
    year: number;
    month: number;
  };
  income: {
    total: number;
    cash: number;
    transfer: number;
  };
  expenses: {
    total: number;
  };
  netProfit: number;
  upcomingDeliveries: Order[];
}

export interface CreateExpenseDTO {
  amount: number;
  category: 'INSUMOS' | 'PACKAGING' | 'FERIA_STAND' | 'OTRO_EGRESO';
  description: string;
  paymentMethod?: PaymentMethod;
  date?: string;
}

export interface CreateIncomeDTO {
  amount: number;
  category?: 'SENA_PEDIDO' | 'SALDO_PEDIDO' | 'VENTA_RAPIDA' | 'OTRO_INGRESO';
  paymentMethod: PaymentMethod;
  description: string;
  orderId?: string;
  date?: string;
}
