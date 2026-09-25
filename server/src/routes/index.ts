import { Router } from 'express';
import catalogRoutes from './catalog.routes';
import quoteRoutes from './quote.routes';
import orderRoutes from './order.routes';
import fastSaleRoutes from './fastSale.routes';
import financeRoutes from './finance.routes';

const router = Router();

router.use('/catalog', catalogRoutes);
router.use('/quotes', quoteRoutes);
router.use('/orders', orderRoutes);
router.use('/fast-sales', fastSaleRoutes);
router.use('/finances', financeRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
