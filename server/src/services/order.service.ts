import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export interface CreateCustomerDTO {
  name: string;
  instagram?: string;
  whatsapp?: string;
  notes?: string;
}

export interface OrderItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
  catalogItemId?: string;
  customizationDetails?: string;
}

export interface CreateOrderDTO {
  customerId?: string;
  newCustomer?: CreateCustomerDTO;
  items: OrderItemInput[];
  depositAmount?: number;
  depositPaymentMethod?: PaymentMethod;
  deliveryDate?: string;
  notes?: string;
}

export interface PayBalanceDTO {
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export class OrderService {
  // --- Customers Directory ---
  async getAllCustomers() {
    return prisma.customer.findMany({
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });
    if (!customer) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return customer;
  }

  async createCustomer(data: CreateCustomerDTO) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('El nombre del cliente es obligatorio', 400);
    }
    return prisma.customer.create({
      data: {
        name: data.name.trim(),
        instagram: data.instagram?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  // --- Orders Management ---
  async getAllOrders(status?: OrderStatus) {
    return prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: true,
        items: true,
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!order) {
      throw new AppError('Pedido no encontrado', 404);
    }
    return order;
  }

  async createOrder(data: CreateOrderDTO) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('El pedido debe incluir al menos un ítem', 400);
    }

    // Resolve customer (either existing or new)
    let customerId = data.customerId;
    if (!customerId) {
      if (!data.newCustomer || !data.newCustomer.name?.trim()) {
        throw new AppError('Debe seleccionar o ingresar los datos del cliente (nombre obligatorio)', 400);
      }
      const newCust = await this.createCustomer(data.newCustomer);
      customerId = newCust.id;
    }

    // Calculate total amount
    const totalAmount = data.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    const depositAmount = data.depositAmount || 0;
    const balanceAmount = Number((totalAmount - depositAmount).toFixed(2));

    if (depositAmount > 0 && !data.depositPaymentMethod) {
      throw new AppError(
        'El método de pago (EFECTIVO o TRANSFERENCIA) es obligatorio para la seña',
        400
      );
    }

    // Si el total es 0 (precio a confirmar), no puede haber seña
    if (totalAmount === 0 && depositAmount > 0) {
      throw new AppError(
        'No se puede registrar una seña sin haber definido el precio total',
        400
      );
    }

    return prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count();
      const orderNumber = `PED-${String(orderCount + 1).padStart(4, '0')}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerId!,
          status: OrderStatus.PENDIENTE,
          totalAmount,
          depositAmount,
          balanceAmount,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              catalogItemId: item.catalogItemId || null,
              customizationDetails: item.customizationDetails || null,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // Register deposit transaction if deposit was paid
      if (depositAmount > 0 && data.depositPaymentMethod) {
        await tx.transaction.create({
          data: {
            type: 'INGRESO',
            category: 'SENA_PEDIDO',
            amount: depositAmount,
            paymentMethod: data.depositPaymentMethod,
            description: `Seña para pedido #${orderNumber} (${order.customer.name})`,
            orderId: order.id,
          },
        });
      }

      return order;
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    await this.getOrderById(id);
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async payBalance(orderId: string, data: PayBalanceDTO) {
    const order = await this.getOrderById(orderId);

    const currentBalance = Number(order.balanceAmount);
    if (currentBalance <= 0) {
      throw new AppError('Este pedido ya no tiene saldo pendiente', 400);
    }

    if (data.amount <= 0 || data.amount > currentBalance) {
      throw new AppError(
        `El monto a abonar debe ser mayor a 0 y no puede superar el saldo pendiente ($${currentBalance})`,
        400
      );
    }

    const newBalance = Number((currentBalance - data.amount).toFixed(2));

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          balanceAmount: newBalance,
        },
        include: {
          customer: true,
          items: true,
          transactions: true,
        },
      });

      await tx.transaction.create({
        data: {
          type: 'INGRESO',
          category: 'SALDO_PEDIDO',
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: `Pago de saldo para pedido #${order.orderNumber} (${order.customer.name})${data.notes ? ` - ${data.notes}` : ''}`,
          orderId: order.id,
        },
      });

      return updatedOrder;
    });
  }
}

export const orderService = new OrderService();
