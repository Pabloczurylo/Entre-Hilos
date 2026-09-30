import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  // Customers
  async getCustomers(_req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await orderService.getAllCustomers();
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = await orderService.getCustomerById(id);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await orderService.createCustomer(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  // Orders
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const orders = await orderService.getAllOrders(status);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await orderService.getOrderById(id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async payBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await orderService.payBalance(id, req.body);
      res.json({
        success: true,
        message: 'Saldo registrado y actualizado con éxito',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await orderService.deleteOrder(id);
      res.json({ success: true, message: 'Pedido eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await orderService.updateOrder(id, req.body);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
