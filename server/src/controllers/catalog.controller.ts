import { Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service';

export class CatalogController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await catalogService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await catalogService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
      const items = await catalogService.getAllItems(categoryId);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await catalogService.getItemById(id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await catalogService.createItem(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await catalogService.updateItem(id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await catalogService.deleteItem(id);
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const catalogController = new CatalogController();
