import { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service';
import { PaymentMethod, TransactionType } from '@prisma/client';

export class FinanceController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, paymentMethod, startDate, endDate } = req.query;
      const transactions = await financeService.getAllTransactions({
        type: type as TransactionType | undefined,
        paymentMethod: paymentMethod as PaymentMethod | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await financeService.createExpense(req.body);
      res.status(201).json({
        success: true,
        message: 'Egreso registrado correctamente',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  async createIncome(req: Request, res: Response, next: NextFunction) {
    try {
      const income = await financeService.createIncome(req.body);
      res.status(201).json({
        success: true,
        message: 'Ingreso registrado correctamente',
        data: income,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const metrics = await financeService.getDashboardMetrics(year, month);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

export const financeController = new FinanceController();
