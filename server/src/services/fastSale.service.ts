import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { PaymentMethod } from '@prisma/client';

export interface CreateFastSaleDTO {
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  catalogItemId?: string;
}

export class FastSaleService {
  async getAllFastSales() {
    return prisma.fastSale.findMany({
      include: {
        catalogItem: true,
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFastSale(data: CreateFastSaleDTO) {
    if (!data.description || !data.description.trim()) {
      throw new AppError('La descripción de la venta rápida es obligatoria', 400);
    }

    if (data.amount <= 0) {
      throw new AppError('El monto de la venta debe ser mayor a 0', 400);
    }

    if (!data.paymentMethod || !['EFECTIVO', 'TRANSFERENCIA'].includes(data.paymentMethod)) {
      throw new AppError('El método de pago (EFECTIVO o TRANSFERENCIA) es obligatorio', 400);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create transaction in finances directly
      const transaction = await tx.transaction.create({
        data: {
          type: 'INGRESO',
          category: 'VENTA_RAPIDA',
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: `Venta rápida (Feria): ${data.description.trim()}`,
        },
      });

      // 2. Create fast sale record linked to transaction
      const fastSale = await tx.fastSale.create({
        data: {
          description: data.description.trim(),
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          catalogItemId: data.catalogItemId || null,
          transactionId: transaction.id,
        },
        include: {
          catalogItem: true,
          transaction: true,
        },
      });

      return fastSale;
    });
  }
}

export const fastSaleService = new FastSaleService();
