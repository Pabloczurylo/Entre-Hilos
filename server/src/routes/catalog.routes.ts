import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
});

const createItemSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es requerido'),
  description: z.string().optional(),
  referencePrice: z.number().positive('El precio de referencia debe ser positivo'),
  estimatedHours: z.number().positive('Las horas estimadas deben ser positivas').optional(),
  categoryId: z.string().uuid('ID de categoría inválido'),
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  referencePrice: z.number().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
});

router.get('/categories', (req, res, next) => catalogController.getCategories(req, res, next));
router.post('/categories', validateRequest(createCategorySchema), (req, res, next) =>
  catalogController.createCategory(req, res, next)
);

router.get('/items', (req, res, next) => catalogController.getItems(req, res, next));
router.get('/items/:id', (req, res, next) => catalogController.getItemById(req, res, next));
router.post('/items', validateRequest(createItemSchema), (req, res, next) =>
  catalogController.createItem(req, res, next)
);
router.put('/items/:id', validateRequest(updateItemSchema), (req, res, next) =>
  catalogController.updateItem(req, res, next)
);
router.delete('/items/:id', (req, res, next) => catalogController.deleteItem(req, res, next));

export default router;
