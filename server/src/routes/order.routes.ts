import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

const createCustomerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  notes: z.string().optional(),
});

const orderItemSchema = z.object({
  name: z.string().min(1, 'El nombre del ítem es requerido'),
  quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo'),
  catalogItemId: z.string().uuid().optional(),
  customizationDetails: z.string().optional(),
});

const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  newCustomer: createCustomerSchema.optional(),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un ítem'),
  depositAmount: z.number().min(0).optional(),
  depositPaymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO']),
});

const payBalanceSchema = z.object({
  amount: z.number().positive('El monto a abonar debe ser positivo'),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
  notes: z.string().optional(),
});

// Customers endpoints
router.get('/customers', (req, res, next) => orderController.getCustomers(req, res, next));
router.get('/customers/:id', (req, res, next) => orderController.getCustomerById(req, res, next));
router.post('/customers', validateRequest(createCustomerSchema), (req, res, next) =>
  orderController.createCustomer(req, res, next)
);

// Orders endpoints
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));
router.post('/', validateRequest(createOrderSchema), (req, res, next) =>
  orderController.createOrder(req, res, next)
);
router.patch('/:id/status', validateRequest(updateStatusSchema), (req, res, next) =>
  orderController.updateStatus(req, res, next)
);
router.post('/:id/pay-balance', validateRequest(payBalanceSchema), (req, res, next) =>
  orderController.payBalance(req, res, next)
);

export default router;
