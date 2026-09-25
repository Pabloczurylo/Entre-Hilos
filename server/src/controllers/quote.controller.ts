import { Request, Response, NextFunction } from 'express';
import { quoteService } from '../services/quote.service';

export class QuoteController {
  calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialsCost, estimatedHours, hourlyRate } = req.body;
      const suggestedPrice = quoteService.calculatePrice({
        materialsCost: Number(materialsCost),
        estimatedHours: Number(estimatedHours),
        hourlyRate: Number(hourlyRate),
      });
      res.json({ success: true, data: { suggestedPrice } });
    } catch (error) {
      next(error);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const quotes = await quoteService.getAllQuotes();
      res.json({ success: true, data: quotes });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const quote = await quoteService.getQuoteById(id);
      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await quoteService.createQuote(req.body);
      res.status(201).json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const quote = await quoteService.updateQuoteStatus(id, req.body.status);
      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }

  async convertToOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await quoteService.convertToOrder(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Presupuesto convertido a pedido con éxito',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const quoteController = new QuoteController();
