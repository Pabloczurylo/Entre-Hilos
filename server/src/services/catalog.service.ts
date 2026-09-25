import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export interface CreateCategoryDTO {
  name: string;
}

export interface CreateCatalogItemDTO {
  name: string;
  description?: string;
  referencePrice: number;
  estimatedHours?: number;
  categoryId: string;
}

export interface UpdateCatalogItemDTO {
  name?: string;
  description?: string;
  referencePrice?: number;
  estimatedHours?: number;
  categoryId?: string;
}

export class CatalogService {
  async getAllCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: CreateCategoryDTO) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name.trim() },
    });
    if (existing) {
      throw new AppError('La categoría ya existe', 400);
    }
    return prisma.category.create({
      data: { name: data.name.trim() },
    });
  }

  async getAllItems(categoryId?: string) {
    return prisma.catalogItem.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async getItemById(id: string) {
    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!item) {
      throw new AppError('Producto del catálogo no encontrado', 404);
    }
    return item;
  }

  async createItem(data: CreateCatalogItemDTO) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('La categoría especificada no existe', 404);
    }

    return prisma.catalogItem.create({
      data: {
        name: data.name,
        description: data.description,
        referencePrice: data.referencePrice,
        estimatedHours: data.estimatedHours,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
  }

  async updateItem(id: string, data: UpdateCatalogItemDTO) {
    await this.getItemById(id);
    return prisma.catalogItem.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteItem(id: string) {
    await this.getItemById(id);
    return prisma.catalogItem.delete({
      where: { id },
    });
  }
}

export const catalogService = new CatalogService();
