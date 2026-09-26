import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowRight,
  ChevronRight,
  Clock,
  Banknote,
  ChevronDown,
} from 'lucide-react';
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { OrderStatus } from '../../shared/types';
import { PRODUCT_CATEGORIES } from '../../shared/types';

// ── Types ─────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  client: string;
  instagram?: string;
  whatsapp?: string;
  item: string;
  category: string;
  status: OrderStatus;
  dueDate: string;
  totalPrice: number;
  advancePayment: number;
  notes?: string;
  createdAt: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  { id: '1', client: 'Sol Ramírez',    item: 'Osito Apego XL',        category: 'Amigurumis General', status: 'TERMINADO',  dueDate: '28 Sep 2026', totalPrice: 5000,  advancePayment: 1500, instagram: '@sol.amis',    createdAt: '10 Sep 2026' },
  { id: '2', client: 'Dani Fonseca',   item: 'Set Llaveros x3',       category: 'Llaveros',           status: 'TEJIENDO',   dueDate: '01 Oct 2026', totalPrice: 2400,  advancePayment: 600,  whatsapp: '1155667788',    createdAt: '12 Sep 2026' },
  { id: '3', client: 'Caro Méndez',    item: 'Pikachu Personalizado', category: 'Personajes',         status: 'TEJIENDO',   dueDate: '03 Oct 2026', totalPrice: 6500,  advancePayment: 2300, instagram: '@caro_m',      createdAt: '14 Sep 2026' },
  { id: '4', client: 'Lu Castillo',    item: 'Unicornio Bebé',        category: 'Amigurumis General', status: 'PENDIENTE',  dueDate: '08 Oct 2026', totalPrice: 8000,  advancePayment: 2000, whatsapp: '1133445566',    createdAt: '20 Sep 2026' },
  { id: '5', client: 'Mica Torres',    item: 'Stitch Grande',         category: 'Personajes',         status: 'PENDIENTE',  dueDate: '12 Oct 2026', totalPrice: 7200,  advancePayment: 3000, instagram: '@mica.crochet', createdAt: '21 Sep 2026' },
  { id: '6', client: 'Fer Rodríguez',  item: 'Ramo Flores Tejidas',   category: 'Flores',             status: 'ENTREGADO',  dueDate: '15 Sep 2026', totalPrice: 3500,  advancePayment: 3500,                             createdAt: '01 Sep 2026' },
  { id: '7', client: 'Juli Vega',      item: 'Axolote Rosa',          category: 'Personajes',         status: 'ENTREGADO',  dueDate: '18 Sep 2026', totalPrice: 4800,  advancePayment: 4800, instagram: '@juliv',       createdAt: '05 Sep 2026' },
  { id: '8', client: 'Vale Sánchez',   item: 'Dragonón Personalizado', category: 'Personajes',        status: 'PENDIENTE',  dueDate: '20 Oct 2026', totalPrice: 0,     advancePayment: 0,    instagram: '@vale.tejidos', createdAt: '25 Sep 2026' },
];

const STATUS_ORDER: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];
const CATEGORIES = ['Todas las Categorías', ...PRODUCT_CATEGORIES];

function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

// ── Order card ────────────────────────────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];

const NEXT_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: 'Iniciar tejido',
  TEJIENDO:  'Marcar terminado',
  TERMINADO: 'Marcar entregado',
  ENTREGADO: '',
};

function OrderCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance: (id: string) => void;
}) {
  const hasPriceDefined = order.totalPrice > 0;
  const balance = hasPriceDefined ? order.totalPrice - order.advancePayment : 0;
  const paidPercent = hasPriceDefined ? Math.round((order.advancePayment / order.totalPrice) * 100) : 0;
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const hasNext = order.status !== 'ENTREGADO';

  return (
    <Link
      to={`/pedidos/${order.id}`}
      className="card-craft p-4 flex flex-col gap-3 hover:-translate-y-0.5 cursor-pointer group"
      aria-label={`Pedido de ${order.client}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-peony flex-shrink-0 flex items-center justify-center text-xs font-bold text-evergreen">
            {order.client.split(' ').map(w => w[0]).join('').slice(0,2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-evergreen truncate">{order.client}</p>
            <p className="text-xs text-text-muted truncate">{order.item}</p>
          </div>
        </div>
        <StatusBadge status={order.status} className="flex-shrink-0" />
      </div>

      {/* Category pill + date */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 bg-surface-container rounded-md text-text-muted">
          {order.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
          <Clock size={10} />
          {order.dueDate}
        </span>
      </div>

      {/* Progress bar — solo si hay precio */}
      {hasPriceDefined ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Seña pagada</span>
            <span className="font-semibold text-evergreen">{paidPercent}%</span>
          </div>
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${paidPercent}%`,
                backgroundColor: paidPercent === 100 ? '#829672' : '#d8959b',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-mauve font-semibold py-0.5">
          <span className="w-4 h-4 rounded-full bg-peony flex items-center justify-center text-[10px]">$</span>
          Precio a confirmar con el Cotizador
        </div>
      )}

      {/* Price row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#eedddb]/60">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Banknote size={12} />
          {hasPriceDefined ? (
            <span>Total: <span className="font-semibold text-evergreen">{formatARS(order.totalPrice)}</span></span>
          ) : (
            <span className="italic">Sin precio asignado</span>
          )}
        </div>
        {hasPriceDefined && (
          <div className="text-xs font-bold" style={{ color: balance > 0 ? '#d8959b' : '#829672' }}>
            {balance > 0 ? `Saldo: ${formatARS(balance)}` : '✓ Pagado'}
          </div>
        )}
      </div>

      {/* Quick-advance button */}
      {hasNext && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onAdvance(order.id);
          }}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 border
            ${currentIdx === STATUS_FLOW.length - 2
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
}: {
  status: OrderStatus;
  orders: Order[];
  onAdvance: (id: string) => void;
}) {
  const COLUMN_META: Record<OrderStatus, { dotColor: string }> = {
    PENDIENTE: { dotColor: '#f2d1d4' },
    TEJIENDO:  { dotColor: '#d8959b' },
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
          <div className="card-craft p-6 text-center text-sm text-text-muted opacity-60">
            Sin pedidos
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} onAdvance={onAdvance} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas las Categorías');
  const [sortBy, setSortBy] = useState<'fecha' | 'saldo'>('fecha');

  const handleAdvance = (id: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        const idx = STATUS_FLOW.indexOf(o.status);
        if (idx >= STATUS_FLOW.length - 1) return o;
        return { ...o, status: STATUS_FLOW[idx + 1] };
      })
    );
  };

  // Filter
  const filtered = orders.filter(o => {
    const matchSearch = o.client.toLowerCase().includes(search.toLowerCase()) ||
                        o.item.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todas las Categorías' || o.category === category;
    return matchSearch && matchCat;
  });

  // Group by status
  const byStatus = STATUS_ORDER.reduce<Record<OrderStatus, Order[]>>((acc, s) => {
    acc[s] = filtered.filter(o => o.status === s);
    if (sortBy === 'saldo') {
      acc[s].sort((a, b) => (b.totalPrice - b.advancePayment) - (a.totalPrice - a.advancePayment));
    }
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  const activeCount = filtered.filter(o => o.status !== 'ENTREGADO').length;

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
            <span className="text-xs px-2.5 py-0.5 bg-surface-container rounded-full text-text-muted font-semibold">
              {activeCount} en curso
            </span>
          </div>
        </div>

        <Link
          to="/pedidos/nuevo"
          className="btn-primary self-start md:self-auto"
          id="btn-nuevo-pedido"
        >
          <Plus size={16} />
          Nuevo Pedido
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATUS_ORDER.map(s => {
          const count = byStatus[s].length;
          const labels: Record<OrderStatus, string> = {
            PENDIENTE: 'Por Iniciar',
            TEJIENDO:  'Tejiendo',
            TERMINADO: 'Para Entregar',
            ENTREGADO: 'Finalizados',
          };
          const icons: Record<OrderStatus, string> = {
            PENDIENTE: '⏳',
            TEJIENDO:  '🪡',
            TERMINADO: '✅',
            ENTREGADO: '📦',
          };
          return (
            <div key={s} className="card-craft p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">{labels[s]}</p>
                <p className="text-xl font-bold text-evergreen mt-0.5">{count}</p>
              </div>
              <span className="text-2xl">{icons[s]}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#eedddb] flex-1 min-w-[220px] max-w-xs">
          <Search size={14} className="text-text-muted flex-shrink-0" />
          <input
            id="search-orders"
            type="text"
            placeholder="Buscar cliente o amigurumi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-evergreen placeholder-text-muted/60 w-full"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            id="filter-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="appearance-none bg-white px-4 py-2 pr-8 rounded-full border border-[#eedddb] text-sm font-semibold text-evergreen outline-none cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            id="sort-orders"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'fecha' | 'saldo')}
            className="appearance-none bg-white px-4 py-2 pr-8 rounded-full border border-[#eedddb] text-sm font-semibold text-evergreen outline-none cursor-pointer"
          >
            <option value="fecha">Fecha: Más próximos</option>
            <option value="saldo">Mayor saldo pendiente</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Kanban grid */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-w-[280px]">
          {STATUS_ORDER.map(s => (
            <KanbanColumn key={s} status={s} orders={byStatus[s]} onAdvance={handleAdvance} />
          ))}
        </div>
      </div>
    </div>
  );
}
