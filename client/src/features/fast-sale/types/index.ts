import { PaymentMethod } from '@/shared/types';

export interface FastSale {
  id: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  catalogItemId?: string | null;
  transactionId?: string | null;
  createdAt: string;
}

export interface CreateFastSaleDTO {
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  catalogItemId?: string;
}
