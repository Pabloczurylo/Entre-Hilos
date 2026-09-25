import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  ArrowRight,
  Banknote,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { OrderStatus } from '../../shared/types';

// ── Mock data (will be replaced with API calls) ──────────────────────────
const STATS = {
  incomeMonth: 148500,
  incomeEfectivo: 95000,
  incomeTransferencia: 53500,
  expenses: 42300,
  netProfit: 106200,
  pendingBalance: 85900,
};

const UPCOMING_DELIVERIES: {
  id: string;
  client: string;
  item: string;
  status: OrderStatus;
  dueDate: string;
  balance: number;
}[] = [
  { id: '1', client: 'Sol Ramírez',    item: 'Osito Apego XL',      status: 'TERMINADO',  dueDate: '28 Sep', balance: 3500  },
  { id: '2', client: 'Dani Fonseca',   item: 'Set Llaveros x3',     status: 'TEJIENDO',   dueDate: '01 Oct', balance: 1800  },
  { id: '3', client: 'Caro Méndez',    item: 'Pikachu Personalizado',status: 'TEJIENDO',   dueDate: '03 Oct', balance: 4200  },
  { id: '4', client: 'Lu Castillo',    item: 'Unicornio Bebé',       status: 'PENDIENTE',  dueDate: '08 Oct', balance: 6000  },
];

const RECENT_ACTIVITY = [
  { id: 'a1', desc: 'Seña recibida de Sol Ramírez', amount: 1500,  type: 'in',  method: 'TRANSFERENCIA', time: 'Hace 2h'  },
  { id: 'a2', desc: 'Compra de hilos (Rosa + Beige)', amount: 3200, type: 'out', method: 'EFECTIVO',     time: 'Ayer'      },
  { id: 'a3', desc: 'Pago final - Dani Fonseca',     amount: 1800,  type: 'in',  method: 'TRANSFERENCIA', time: 'Ayer'      },
  { id: 'a4', desc: 'Venta rápida feria - Set x2',   amount: 2400,  type: 'in',  method: 'EFECTIVO',     time: '23 Sep'    },
];

// ── Formatting helpers ────────────────────────────────────────────────────
function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="stat-card">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-2xl font-bold text-evergreen tracking-tight">{value}</span>
        {sub && <span className="text-xs text-text-muted">{sub}</span>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent}`}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-sage' : 'text-destructive'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend === 'up' ? '+12%' : '-5%'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function DashboardPage() {
  return (
    <div className="py-8 page-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Taller Artesanal • Resumen General
        </p>
        <h1 className="section-title">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Stats row ── */}
      <section aria-label="Métricas del mes" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Ingresos del Mes"
          value={formatARS(STATS.incomeMonth)}
          sub={`Ef. ${formatARS(STATS.incomeEfectivo)} · Trans. ${formatARS(STATS.incomeTransferencia)}`}
          icon={TrendingUp}
          accent="bg-peony text-evergreen"
          trend="up"
        />
        <StatCard
          label="Egresos Totales"
          value={formatARS(STATS.expenses)}
          icon={TrendingDown}
          accent="bg-[#ffdad6] text-[#93000a]"
          trend="down"
        />
        <StatCard
          label="Ganancia Neta"
          value={formatARS(STATS.netProfit)}
          sub="Septiembre 2026"
          icon={TrendingUp}
          accent="bg-secondary-container text-on-secondary-container"
          trend="up"
        />
        <StatCard
          label="Saldos Pendientes"
          value={formatARS(STATS.pendingBalance)}
          sub="Por cobrar al entregar"
          icon={AlertCircle}
          accent="bg-primary-fixed text-on-primary-fixed"
        />
      </section>

      {/* ── Two columns: upcoming + activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Próximas entregas */}
        <section
          className="xl:col-span-3 card-craft p-6"
          aria-label="Próximas entregas"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-evergreen">Próximas Entregas</h2>
              <p className="text-xs text-text-muted">Ordenadas por fecha</p>
            </div>
            <Link
              to="/pedidos"
              className="flex items-center gap-1 text-xs font-semibold text-mauve hover:underline"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-[#eedddb]/60">
            {UPCOMING_DELIVERIES.map((order) => (
              <Link
                key={order.id}
                to={`/pedidos/${order.id}`}
                className="flex items-center gap-4 py-3.5 hover:bg-surface-container-low rounded-xl px-2 -mx-2 transition-colors group"
              >
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen flex-shrink-0">
                  {order.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-evergreen truncate">{order.client}</p>
                  <p className="text-xs text-text-muted truncate">{order.item}</p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock size={10} />
                    {order.dueDate}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                  <span className="text-sm font-bold text-evergreen">{formatARS(order.balance)}</span>
                  <span className="text-xs text-text-muted">saldo</span>
                </div>

                <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Actividad reciente */}
        <section
          className="xl:col-span-2 card-craft p-6"
          aria-label="Actividad reciente"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-evergreen">Actividad Reciente</h2>
              <p className="text-xs text-text-muted">Últimos movimientos</p>
            </div>
            <Link
              to="/finanzas"
              className="flex items-center gap-1 text-xs font-semibold text-mauve hover:underline"
            >
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {RECENT_ACTIVITY.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'in' ? 'bg-secondary-container' : 'bg-[#ffdad6]'}`}>
                  {act.method === 'TRANSFERENCIA'
                    ? <CreditCard size={14} className={act.type === 'in' ? 'text-sage' : 'text-[#93000a]'} />
                    : <Banknote size={14} className={act.type === 'in' ? 'text-sage' : 'text-[#93000a]'} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-evergreen truncate">{act.desc}</p>
                  <p className="text-xs text-text-muted">{act.time}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${act.type === 'in' ? 'text-sage' : 'text-[#93000a]'}`}>
                  {act.type === 'in' ? '+' : '-'}{formatARS(act.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-5 pt-5 border-t border-[#eedddb]/60">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Acciones rápidas</p>
            <div className="flex flex-col gap-2">
              <Link to="/pedidos/nuevo" className="btn-primary justify-center text-xs py-2.5">
                <Package size={14} />
                Nuevo Pedido por Encargo
              </Link>
              <Link to="/venta-rapida" className="btn-secondary justify-center text-xs py-2.5">
                <TrendingUp size={14} />
                Registrar Venta Rápida
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
