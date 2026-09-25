import { Request, Response, NextFunction } from 'express';
import { fastSaleService } from '../services/fastSale.service';

export class FastSaleController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const sales = await fastSaleService.getAllFastSales();
      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await fastSaleService.createFastSale(req.body);
      res.status(201).json({
        success: true,
        message: 'Venta rápida registrada e ingresada en finanzas exitosamente',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fastSaleController = new FastSaleController();
