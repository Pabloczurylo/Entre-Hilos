import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { PaymentMethod, TransactionCategory, TransactionType } from '@prisma/client';

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
  paymentMethod: PaymentMethod; // Mandatory
  description: string;
  orderId?: string;
  date?: string;
}

export class FinanceService {
  async getAllTransactions(filters?: {
    type?: TransactionType;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    return prisma.transaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(data: CreateExpenseDTO) {
    if (data.amount <= 0) {
      throw new AppError('El monto del egreso debe ser mayor a 0', 400);
    }
    if (!data.description || !data.description.trim()) {
      throw new AppError('La descripción del gasto es obligatoria', 400);
    }

    return prisma.transaction.create({
      data: {
        type: TransactionType.EGRESO,
        category: data.category as TransactionCategory,
        amount: data.amount,
        paymentMethod: data.paymentMethod || null,
        description: data.description.trim(),
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async createIncome(data: CreateIncomeDTO) {
    if (data.amount <= 0) {
      throw new AppError('El monto del ingreso debe ser mayor a 0', 400);
    }
    if (!data.paymentMethod || !['EFECTIVO', 'TRANSFERENCIA'].includes(data.paymentMethod)) {
      throw new AppError(
        'El método de pago (EFECTIVO o TRANSFERENCIA) es obligatorio para todo ingreso',
        400
      );
    }
    if (!data.description || !data.description.trim()) {
      throw new AppError('La descripción del ingreso es obligatoria', 400);
    }

    return prisma.transaction.create({
      data: {
        type: TransactionType.INGRESO,
        category: (data.category as TransactionCategory) || TransactionCategory.OTRO_INGRESO,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description.trim(),
        orderId: data.orderId || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  /**
   * Monthly dashboard metrics:
   * - Ingresos del mes (segmentados por método de pago: EFECTIVO y TRANSFERENCIA)
   * - Egresos totales del mes
   * - Ganancia Neta mensual (Ingresos - Egresos)
   * - Próximas entregas ordenadas cronológicamente
   */
  async getDashboardMetrics(year?: number, month?: number) {
    const now = new Date();
    const currentYear = year ?? now.getFullYear();
    const currentMonth = month ?? now.getMonth() + 1; // 1-indexed

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Fetch transactions for the given month
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let totalIncomeCash = 0; // Efectivo
    let totalIncomeTransfer = 0; // Transferencia
    let totalExpenses = 0;

    for (const t of monthTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INGRESO) {
        if (t.paymentMethod === PaymentMethod.EFECTIVO) {
          totalIncomeCash += amount;
        } else if (t.paymentMethod === PaymentMethod.TRANSFERENCIA) {
          totalIncomeTransfer += amount;
        }
      } else if (t.type === TransactionType.EGRESO) {
        totalExpenses += amount;
      }
    }

    const totalIncome = Number((totalIncomeCash + totalIncomeTransfer).toFixed(2));
    totalExpenses = Number(totalExpenses.toFixed(2));
    const netProfit = Number((totalIncome - totalExpenses).toFixed(2));

    // 2. Fetch upcoming deliveries ordered chronologically (orders not yet DELIVERED)
    const upcomingDeliveries = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDIENTE', 'TEJIENDO', 'TERMINADO'],
        },
        deliveryDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        deliveryDate: 'asc',
      },
      take: 10,
    });

    return {
      period: {
        year: currentYear,
        month: currentMonth,
      },
      income: {
        total: totalIncome,
        cash: Number(totalIncomeCash.toFixed(2)),
        transfer: Number(totalIncomeTransfer.toFixed(2)),
      },
      expenses: {
        total: totalExpenses,
      },
      netProfit,
      upcomingDeliveries,
    };
  }
}

export const financeService = new FinanceService();
