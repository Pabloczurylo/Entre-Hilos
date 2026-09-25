import { Router } from 'express';
import { financeController } from '../controllers/finance.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const createExpenseSchema = z.object({
  amount: z.number().positive('El monto del egreso debe ser mayor a 0'),
  category: z.enum(['INSUMOS', 'PACKAGING', 'FERIA_STAND', 'OTRO_EGRESO']),
  description: z.string().min(1, 'La descripción es obligatoria'),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional(),
  date: z.string().optional(),
});

const createIncomeSchema = z.object({
  amount: z.number().positive('El monto del ingreso debe ser mayor a 0'),
  category: z.enum(['SENA_PEDIDO', 'SALDO_PEDIDO', 'VENTA_RAPIDA', 'OTRO_INGRESO']).optional(),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
  description: z.string().min(1, 'La descripción es obligatoria'),
  orderId: z.string().uuid().optional(),
  date: z.string().optional(),
});

router.get('/dashboard', (req, res, next) => financeController.getDashboard(req, res, next));
router.get('/transactions', (req, res, next) => financeController.getTransactions(req, res, next));
router.post('/expenses', validateRequest(createExpenseSchema), (req, res, next) =>
  financeController.createExpense(req, res, next)
);
router.post('/incomes', validateRequest(createIncomeSchema), (req, res, next) =>
  financeController.createIncome(req, res, next)
);

export default router;
