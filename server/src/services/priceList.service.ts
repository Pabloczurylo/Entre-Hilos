import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import type { PriceListItem, Prisma } from '@prisma/client';

export interface CreatePriceListItemDTO {
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  notes?: string;
}

export interface UpdatePriceListItemDTO {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  notes?: string;
}

export interface FormattedPriceListItem {
  id: string;
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PRICE_ITEMS: Array<{
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  notes: string;
}> = [
  { name: 'Llavero básico', category: 'Llaveros', minPrice: 800, maxPrice: 1000, notes: '' },
  { name: 'Llavero personalizado', category: 'Llaveros', minPrice: 1200, maxPrice: 1800, notes: 'Incluye inicial o diseño simple' },
  { name: 'Flor tejida', category: 'Flores', minPrice: 600, maxPrice: 900, notes: '' },
  { name: 'Ramo x5 flores', category: 'Flores', minPrice: 2200, maxPrice: 3000, notes: 'Varias flores combinadas' },
  { name: 'Mini amigurumi', category: 'Amigurumis General', minPrice: 1800, maxPrice: 2500, notes: '' },
  { name: 'Amigurumi mediano', category: 'Amigurumis General', minPrice: 3000, maxPrice: 4500, notes: '' },
  { name: 'Amigurumi grande', category: 'Amigurumis General', minPrice: 5000, maxPrice: 8000, notes: 'Diseño complejo o articulado' },
  { name: 'Personaje custom', category: 'Personajes', minPrice: 4000, maxPrice: 7000, notes: 'Referencia provista por el cliente' },
  { name: 'Mascota personalizada', category: 'Mascotas', minPrice: 4500, maxPrice: 7500, notes: 'Foto + descripción del cliente' },
  { name: 'Muñeco de apego', category: 'Personajes', minPrice: 7000, maxPrice: 12000, notes: 'Hiper personalizado, premium' },
  { name: 'Set postal tejido x3', category: 'Otras', minPrice: 900, maxPrice: 1200, notes: '' },
];

export class PriceListService {
  async getAll(): Promise<FormattedPriceListItem[]> {
    const count = await prisma.priceListItem.count();
    // If table is completely empty on first use, auto-populate with initial prices
    if (count === 0) {
      await prisma.priceListItem.createMany({
        data: DEFAULT_PRICE_ITEMS.map((item) => ({
          name: item.name,
          category: item.category,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          notes: item.notes || null,
        })),
      });
    }

    const items: PriceListItem[] = await prisma.priceListItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return items.map((item: PriceListItem): FormattedPriceListItem => ({
      ...item,
      minPrice: Number(item.minPrice),
      maxPrice: Number(item.maxPrice),
    }));
  }

  async getById(id: string): Promise<FormattedPriceListItem> {
    const item = await prisma.priceListItem.findUnique({
      where: { id },
    });
    if (!item) {
      throw new AppError('Precio de lista no encontrado', 404);
    }
    return {
      ...item,
      minPrice: Number(item.minPrice),
      maxPrice: Number(item.maxPrice),
    };
  }

  async create(data: CreatePriceListItemDTO): Promise<FormattedPriceListItem> {
    if (!data.name?.trim()) {
      throw new AppError('El nombre del producto es obligatorio', 400);
    }
    const minPrice = Number(data.minPrice);
    const maxPrice = Number(data.maxPrice);

    if (isNaN(minPrice) || minPrice <= 0) {
      throw new AppError('El precio mínimo debe ser un número positivo', 400);
    }
    if (isNaN(maxPrice) || maxPrice <= 0) {
      throw new AppError('El precio máximo debe ser un número positivo', 400);
    }
    if (maxPrice < minPrice) {
      throw new AppError('El precio máximo no puede ser menor que el precio mínimo', 400);
    }

    const created = await prisma.priceListItem.create({
      data: {
        name: data.name.trim(),
        category: data.category?.trim() || 'Otras',
        minPrice,
        maxPrice,
        notes: data.notes?.trim() || null,
      },
    });

    return {
      ...created,
      minPrice: Number(created.minPrice),
      maxPrice: Number(created.maxPrice),
    };
  }

  async update(id: string, data: UpdatePriceListItemDTO): Promise<FormattedPriceListItem> {
    await this.getById(id);

    const updatePayload: Prisma.PriceListItemUpdateInput = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) throw new AppError('El nombre del producto no puede estar vacío', 400);
      updatePayload.name = data.name.trim();
    }
    if (data.category !== undefined) {
      updatePayload.category = data.category.trim() || 'Otras';
    }
    if (data.notes !== undefined) {
      updatePayload.notes = data.notes.trim() || null;
    }
    if (data.minPrice !== undefined) {
      const minPrice = Number(data.minPrice);
      if (isNaN(minPrice) || minPrice <= 0) {
        throw new AppError('El precio mínimo debe ser un número positivo', 400);
      }
      updatePayload.minPrice = minPrice;
    }
    if (data.maxPrice !== undefined) {
      const maxPrice = Number(data.maxPrice);
      if (isNaN(maxPrice) || maxPrice <= 0) {
        throw new AppError('El precio máximo debe ser un número positivo', 400);
      }
      updatePayload.maxPrice = maxPrice;
    }

    const updated = await prisma.priceListItem.update({
      where: { id },
      data: updatePayload,
    });

    return {
      ...updated,
      minPrice: Number(updated.minPrice),
      maxPrice: Number(updated.maxPrice),
    };
  }

  async delete(id: string): Promise<PriceListItem> {
    await this.getById(id);
    return prisma.priceListItem.delete({
      where: { id },
    });
  }

  async resetDefaults(): Promise<FormattedPriceListItem[]> {
    await prisma.priceListItem.deleteMany({});
    await prisma.priceListItem.createMany({
      data: DEFAULT_PRICE_ITEMS.map((item) => ({
        name: item.name,
        category: item.category,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        notes: item.notes || null,
      })),
    });

    return this.getAll();
  }
}

export const priceListService = new PriceListService();
