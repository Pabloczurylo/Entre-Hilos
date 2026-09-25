import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { QuoteStatus } from '@prisma/client';

export interface CalculateQuoteInput {
  materialsCost: number;
  estimatedHours: number;
  hourlyRate: number;
}

export interface CreateQuoteDTO extends CalculateQuoteInput {
  title: string;
  description?: string;
}

export interface ConvertQuoteToOrderDTO {
  customerId: string;
  depositAmount?: number;
  depositPaymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
  deliveryDate?: string;
  customizationDetails?: string;
}

export class QuoteService {
  /**
   * Core formula:
   * Sugerido = Costo total de materiales + (Cantidad de horas estimadas * Valor hora de tejido)
   */
  calculatePrice(input: CalculateQuoteInput): number {
    const { materialsCost, estimatedHours, hourlyRate } = input;
    const laborCost = estimatedHours * hourlyRate;
    const total = materialsCost + laborCost;
    return Number(total.toFixed(2));
  }

  async getAllQuotes() {
    return prisma.quote.findMany({
      include: {
        order: {
          select: { id: true, orderNumber: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuoteById(id: string) {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        order: {
          include: { customer: true },
        },
      },
    });
    if (!quote) {
      throw new AppError('Presupuesto no encontrado', 404);
    }
    return quote;
  }

  async createQuote(data: CreateQuoteDTO) {
    const suggestedPrice = this.calculatePrice({
      materialsCost: data.materialsCost,
      estimatedHours: data.estimatedHours,
      hourlyRate: data.hourlyRate,
    });

    return prisma.quote.create({
      data: {
        title: data.title,
        description: data.description,
        materialsCost: data.materialsCost,
        estimatedHours: data.estimatedHours,
        hourlyRate: data.hourlyRate,
        suggestedPrice,
        status: QuoteStatus.BORRADOR,
      },
    });
  }

  async updateQuoteStatus(id: string, status: QuoteStatus) {
    await this.getQuoteById(id);
    return prisma.quote.update({
      where: { id },
      data: { status },
    });
  }

  async convertToOrder(quoteId: string, orderData: ConvertQuoteToOrderDTO) {
    const quote = await this.getQuoteById(quoteId);

    if (quote.status === QuoteStatus.CONVERTIDO_A_PEDIDO) {
      throw new AppError('Este presupuesto ya ha sido convertido a pedido', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: orderData.customerId },
    });
    if (!customer) {
      throw new AppError('Cliente no encontrado', 404);
    }

    const totalAmount = Number(quote.suggestedPrice);
    const depositAmount = orderData.depositAmount || 0;
    const balanceAmount = Number((totalAmount - depositAmount).toFixed(2));

    if (depositAmount > 0 && !orderData.depositPaymentMethod) {
      throw new AppError(
        'El método de pago (EFECTIVO o TRANSFERENCIA) es obligatorio al registrar una seña',
        400
      );
    }

    // Atomic transaction for order creation, quote status update, and finance movement
    return prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count();
      const orderNumber = `PED-${String(orderCount + 1).padStart(4, '0')}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: orderData.customerId,
          totalAmount,
          depositAmount,
          balanceAmount,
          deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : null,
          items: {
            create: {
              name: quote.title,
              quantity: 1,
              unitPrice: totalAmount,
              customizationDetails:
                orderData.customizationDetails || quote.description || undefined,
            },
          },
        },
      });

      // Register deposit transaction if deposit was paid
      if (depositAmount > 0 && orderData.depositPaymentMethod) {
        await tx.transaction.create({
          data: {
            type: 'INGRESO',
            category: 'SENA_PEDIDO',
            amount: depositAmount,
            paymentMethod: orderData.depositPaymentMethod,
            description: `Seña para pedido #${orderNumber} (${customer.name})`,
            orderId: order.id,
          },
        });
      }

      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: QuoteStatus.CONVERTIDO_A_PEDIDO,
          orderId: order.id,
        },
      });

      return order;
    });
  }
}

export const quoteService = new QuoteService();
