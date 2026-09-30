import { Request, Response, NextFunction } from 'express';
import { priceListService } from '../services/priceList.service';

export class PriceListController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await priceListService.getAll();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await priceListService.getById(id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await priceListService.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await priceListService.update(id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await priceListService.delete(id);
      res.json({ success: true, message: 'Precio eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async resetDefaults(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await priceListService.resetDefaults();
      res.json({ success: true, data: items, message: 'Lista de precios restablecida a valores por defecto' });
    } catch (error) {
      next(error);
    }
  }
}

export const priceListController = new PriceListController();
