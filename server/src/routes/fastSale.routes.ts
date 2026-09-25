import { Router } from 'express';
import { fastSaleController } from '../controllers/fastSale.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const createFastSaleSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
  catalogItemId: z.string().uuid().optional(),
});

router.get('/', (req, res, next) => fastSaleController.getAll(req, res, next));
router.post('/', validateRequest(createFastSaleSchema), (req, res, next) =>
  fastSaleController.create(req, res, next)
);

export default router;
