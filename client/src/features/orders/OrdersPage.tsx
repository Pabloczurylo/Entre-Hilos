import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowRight,
  ChevronRight,
  Clock,
  Banknote,
  Package,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { OrderStatus } from '../../shared/types';
import { orderApi } from './services/orderApi';
import { Order } from './types';

const STATUS_ORDER: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];

function formatARS(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-AR')}`;
}

function formatDateShort(dateStr?: string | null) {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

// ── Status Flow ───────────────────────────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];

const NEXT_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: 'Iniciar tejido',
  TEJIENDO: 'Marcar terminado',
  TERMINADO: 'Marcar entregado',
  ENTREGADO: '',
};

function OrderCard({
  order,
  onAdvance,
  isAdvancing,
}: {
  order: Order;
  onAdvance: (id: string, currentStatus: OrderStatus) => void;
  isAdvancing: boolean;
}) {
  const total = Number(order.totalAmount || 0);
  const deposit = Number(order.depositAmount || 0);
  const balance = Number(order.balanceAmount ?? (total - deposit));
  const paidPercent = total > 0 ? Math.min(100, Math.round((deposit / total) * 100)) : 0;
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const hasNext = order.status !== 'ENTREGADO';
  const clientName = order.customer?.name || 'Cliente';
  const firstItem = order.items?.[0]?.name || 'Amigurumi';
  const initials = clientName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      to={`/pedidos/${order.id}`}
      className="card-craft p-4 flex flex-col gap-3 hover:-translate-y-0.5 cursor-pointer group"
      aria-label={`Pedido de ${clientName}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-peony flex-shrink-0 flex items-center justify-center text-xs font-bold text-evergreen">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-evergreen truncate">{clientName}</p>
            <p className="text-xs text-text-muted truncate">
              {firstItem}
              {order.items?.length > 1 ? ` (+${order.items.length - 1})` : ''}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} className="flex-shrink-0" />
      </div>

      {/* Date */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {formatDateShort(order.deliveryDate)}
        </span>
        {order.orderNumber && (
          <span className="font-mono text-[10px] bg-surface-container px-1.5 py-0.5 rounded">
            {order.orderNumber}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Seña abonada</span>
          <span className="font-semibold text-evergreen">{paidPercent}%</span>
        </div>
        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${paidPercent}%`,
              backgroundColor: paidPercent >= 100 ? '#829672' : '#d8959b',
            }}
          />
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#eedddb]/60">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Banknote size={12} />
          <span>
            Total: <span className="font-semibold text-evergreen">{formatARS(total)}</span>
          </span>
        </div>
        <div className="text-xs font-bold" style={{ color: balance > 0 ? '#d8959b' : '#829672' }}>
          {balance > 0 ? `Saldo: ${formatARS(balance)}` : '✓ Pagado'}
        </div>
      </div>

      {/* Quick-advance button */}
      {hasNext && (
        <button
          type="button"
          disabled={isAdvancing}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdvance(order.id, order.status);
          }}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 border
            ${
              currentIdx === STATUS_FLOW.length - 2
                ? 'bg-sage/10 border-sage/30 text-sage hover:bg-sage/20'
                : 'bg-mauve/10 border-mauve/30 text-mauve hover:bg-mauve/20'
            }`}
          id={`btn-advance-${order.id}`}
        >
          <ChevronRight size={13} />
          {NEXT_LABEL[order.status]}
        </button>
      )}

      <div className="flex items-center justify-end text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
        Ver detalle <ArrowRight size={11} className="ml-1" />
      </div>
    </Link>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  orders,
  onAdvance,
  isAdvancing,
}: {
  status: OrderStatus;
  orders: Order[];
  onAdvance: (id: string, currentStatus: OrderStatus) => void;
  isAdvancing: boolean;
}) {
  const COLUMN_META: Record<OrderStatus, { dotColor: string }> = {
    PENDIENTE: { dotColor: '#f2d1d4' },
    TEJIENDO: { dotColor: '#d8959b' },
    TERMINADO: { dotColor: '#829672' },
    ENTREGADO: { dotColor: '#344c3d' },
  };

  const { dotColor } = COLUMN_META[status];

  return (
    <div className="flex flex-col gap-3 min-w-[280px] xl:min-w-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
          <StatusBadge status={status} />
        </div>
        <span className="text-xs font-semibold text-text-muted bg-surface-container px-2 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="card-craft p-6 text-center text-xs text-text-muted opacity-60">
            Sin pedidos en este estado
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={onAdvance}
              isAdvancing={isAdvancing}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'fecha' | 'saldo'>('fecha');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: OrderStatus }) =>
      orderApi.updateStatus(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
    },
  });

  const handleAdvance = (id: string, currentStatus: OrderStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    advanceMutation.mutate({ id, nextStatus });
  };

  // Filter
  const filtered = orders.filter((o) => {
    const clientMatch = (o.customer?.name || '').toLowerCase().includes(search.toLowerCase());
    const itemMatch = (o.items || []).some((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    const notesMatch = (o.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = clientMatch || itemMatch || notesMatch;

    return matchesSearch;
  });

  // Group by status
  const byStatus = STATUS_ORDER.reduce<Record<OrderStatus, Order[]>>((acc, s) => {
    acc[s] = filtered.filter((o) => o.status === s);
    if (sortBy === 'saldo') {
      acc[s].sort((a, b) => Number(b.balanceAmount || 0) - Number(a.balanceAmount || 0));
    }
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  const activeCount = filtered.filter((o) => o.status !== 'ENTREGADO').length;

  return (
    <div className="py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
            Taller Artesanal • Producción & Despachos
          </p>
          <div className="flex items-center gap-3">
            <h1 className="section-title">Tablero de Pedidos</h1>
            <span className="badge badge-tejiendo">{activeCount} activos</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/pedidos/nuevo" className="btn-primary" id="btn-nuevo-pedido">
            <Plus size={16} />
            Nuevo Pedido
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card-craft p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente o amigurumi..."
            className="input-craft pl-9 py-2 text-sm"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted whitespace-nowrap">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'fecha' | 'saldo')}
            className="input-craft py-2 text-xs cursor-pointer w-auto"
          >
            <option value="fecha">Fecha de Entrega</option>
            <option value="saldo">Mayor Saldo Pendiente</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-muted text-sm gap-3">
          <svg className="animate-spin w-6 h-6 text-mauve" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando pedidos...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="card-craft p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-peony flex items-center justify-center text-evergreen mb-4">
            <Package size={28} />
          </div>
          <h2 className="text-lg font-bold text-evergreen mb-2">No hay pedidos registrados aún</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            Comenzá a registrar tus encargos para hacer seguimiento de los estados de tejido, señas y saldos restantes.
          </p>
          <Link to="/pedidos/nuevo" className="btn-primary">
            <Plus size={16} />
            Crear Primer Pedido
          </Link>
        </div>
      ) : (
        /* Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              orders={byStatus[status] || []}
              onAdvance={handleAdvance}
              isAdvancing={advanceMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
