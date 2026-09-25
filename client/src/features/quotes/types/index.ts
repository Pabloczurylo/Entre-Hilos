import { QuoteStatus } from '@/shared/types';

export interface Quote {
  id: string;
  title: string;
  description?: string | null;
  materialsCost: number;
  estimatedHours: number;
  hourlyRate: number;
  suggestedPrice: number;
  status: QuoteStatus;
  orderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateQuoteInput {
  materialsCost: number;
  estimatedHours: number;
  hourlyRate: number;
}

export interface CreateQuoteDTO extends CalculateQuoteInput {
  title: string;
  description?: string;
}
