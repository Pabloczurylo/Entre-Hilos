import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const calculateSchema = z.object({
  materialsCost: z.number().min(0, 'El costo de materiales no puede ser negativo'),
  estimatedHours: z.number().min(0, 'Las horas estimadas no pueden ser negativas'),
  hourlyRate: z.number().min(0, 'El valor hora no puede ser negativo'),
});

const createQuoteSchema = calculateSchema.extend({
  title: z.string().min(1, 'El título del presupuesto es requerido'),
  description: z.string().optional(),
});

const convertToOrderSchema = z.object({
  customerId: z.string().uuid('ID de cliente inválido'),
  depositAmount: z.number().min(0).optional(),
  depositPaymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional(),
  deliveryDate: z.string().optional(),
  customizationDetails: z.string().optional(),
});

router.post('/calculate', validateRequest(calculateSchema), (req, res, next) =>
  quoteController.calculate(req, res, next)
);
router.get('/', (req, res, next) => quoteController.getAll(req, res, next));
router.get('/:id', (req, res, next) => quoteController.getById(req, res, next));
router.post('/', validateRequest(createQuoteSchema), (req, res, next) =>
  quoteController.create(req, res, next)
);
router.patch('/:id/status', (req, res, next) => quoteController.updateStatus(req, res, next));
router.post('/:id/convert-to-order', validateRequest(convertToOrderSchema), (req, res, next) =>
  quoteController.convertToOrder(req, res, next)
);

export default router;
