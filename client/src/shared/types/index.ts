export const PRODUCT_CATEGORIES = [
  'Llaveros',
  'Flores',
  'Amigurumis General',
  'Personajes',
  'Mascotas',
  'Otras',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export type OrderStatus = 'PENDIENTE' | 'TEJIENDO' | 'TERMINADO' | 'ENTREGADO';

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export type TransactionType = 'INGRESO' | 'EGRESO';

export type TransactionCategory =
  | 'SENA_PEDIDO'
  | 'SALDO_PEDIDO'
  | 'VENTA_RAPIDA'
  | 'OTRO_INGRESO'
  | 'INSUMOS'
  | 'PACKAGING'
  | 'FERIA_STAND'
  | 'OTRO_EGRESO';

export type QuoteStatus = 'BORRADOR' | 'ACEPTADO' | 'RECHAZADO' | 'CONVERTIDO_A_PEDIDO';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

