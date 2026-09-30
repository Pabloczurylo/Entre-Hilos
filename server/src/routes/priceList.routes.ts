import { Router } from 'express';
import { priceListController } from '../controllers/priceList.controller';

const router = Router();

router.get('/', (req, res, next) => priceListController.getAll(req, res, next));
router.post('/reset-defaults', (req, res, next) => priceListController.resetDefaults(req, res, next));
router.get('/:id', (req, res, next) => priceListController.getById(req, res, next));
router.post('/', (req, res, next) => priceListController.create(req, res, next));
router.patch('/:id', (req, res, next) => priceListController.update(req, res, next));
router.delete('/:id', (req, res, next) => priceListController.delete(req, res, next));

export default router;
