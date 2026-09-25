import { cn } from '../../lib/utils';
import type { OrderStatus } from '../types';

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  PENDIENTE:  { label: 'Pendiente',  className: 'badge-pendiente' },
  TEJIENDO:   { label: 'Tejiendo',   className: 'badge-tejiendo' },
  TERMINADO:  { label: 'Terminado',  className: 'badge-terminado' },
  ENTREGADO:  { label: 'Entregado',  className: 'badge-entregado' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClass } = STATUS_MAP[status];
  return (
    <span className={cn('badge', badgeClass, className)}>
      {label}
    </span>
  );
}
