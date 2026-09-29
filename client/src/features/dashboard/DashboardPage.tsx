import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  ArrowRight,
  Banknote,
  CreditCard,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { financeApi } from '../finances/services/financeApi';
import { orderApi } from '../orders/services/orderApi';
import { Order } from '../orders/types';
import { Transaction } from '../finances/types';

// ── Formatting helpers ────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
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
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function DashboardPage() {
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['finances-dashboard'],
    queryFn: () => financeApi.getDashboard(),
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['finances-transactions'],
    queryFn: () => financeApi.getTransactions(),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const isLoading = loadingDashboard || loadingTx || loadingOrders;

  // Compute pending balances from active orders
  const pendingOrders = orders.filter((o: Order) => o.status !== 'ENTREGADO');
  const pendingBalanceTotal = pendingOrders.reduce(
    (sum: number, o: Order) => sum + Number(o.balanceAmount || 0),
    0
  );

  // Filter upcoming deliveries
  const upcomingDeliveries: Order[] = dashboard?.upcomingDeliveries || pendingOrders.slice(0, 5);
  const recentTransactions: Transaction[] = transactions.slice(0, 5);

  const incomeTotal = Number(dashboard?.income?.total || 0);
  const incomeCash = Number(dashboard?.income?.cash || 0);
  const incomeTransfer = Number(dashboard?.income?.transfer || 0);
  const expensesTotal = Number(dashboard?.expenses?.total || 0);
  const netProfit = Number(dashboard?.netProfit || (incomeTotal - expensesTotal));

  return (
    <div className="py-8 page-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Taller Artesanal • Resumen General
        </p>
        <h1 className="section-title">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1 capitalize">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* ── Stats row ── */}
      <section aria-label="Métricas del mes" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Ingresos del Mes"
          value={formatARS(incomeTotal)}
          sub={`Ef. ${formatARS(incomeCash)} · Trans. ${formatARS(incomeTransfer)}`}
          icon={TrendingUp}
          accent="bg-peony text-evergreen"
        />
        <StatCard
          label="Egresos Totales"
          value={formatARS(expensesTotal)}
          sub="Gastos operativos e insumos"
          icon={TrendingDown}
          accent="bg-[#ffdad6] text-[#93000a]"
        />
        <StatCard
          label="Ganancia Neta"
          value={formatARS(netProfit)}
          sub="Balance del mes actual"
          icon={TrendingUp}
          accent="bg-[#d1e7be] text-evergreen"
        />
        <StatCard
          label="Saldos Pendientes"
          value={formatARS(pendingBalanceTotal)}
          sub={`${pendingOrders.length} pedido(s) activos`}
          icon={AlertCircle}
          accent="bg-primary-fixed text-evergreen"
        />
      </section>

      {/* ── Two columns: upcoming + activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Próximas entregas */}
        <section
          className="xl:col-span-3 card-craft p-6 flex flex-col justify-between"
          aria-label="Próximas entregas"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-evergreen">Próximas Entregas</h2>
                <p className="text-xs text-text-muted">Encargos en producción y por entregar</p>
              </div>
              <Link
                to="/pedidos"
                className="flex items-center gap-1 text-xs font-semibold text-mauve hover:underline"
              >
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center items-center text-text-muted text-sm gap-2">
                <svg className="animate-spin w-5 h-5 text-mauve" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Cargando entregas...</span>
              </div>
            ) : upcomingDeliveries.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-text-muted mb-3">
                  <Package size={22} />
                </div>
                <p className="text-sm font-semibold text-evergreen mb-1">Sin entregas pendientes</p>
                <p className="text-xs text-text-muted mb-4 max-w-xs">
                  No hay pedidos activos programados para entrega próxima.
                </p>
                <Link to="/pedidos/nuevo" className="btn-primary text-xs py-2 px-4">
                  <Package size={13} />
                  Crear primer encargo
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#eedddb]/60">
                {upcomingDeliveries.map((order) => {
                  const clientName = order.customer?.name || 'Cliente';
                  const firstItem = order.items?.[0]?.name || 'Amigurumi';
                  const initials = clientName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const balance = Number(order.balanceAmount || 0);

                  return (
                    <Link
                      key={order.id}
                      to={`/pedidos/${order.id}`}
                      className="flex items-center gap-4 py-3.5 hover:bg-surface-container-low rounded-xl px-2 -mx-2 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen flex-shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-evergreen truncate">{clientName}</p>
                        <p className="text-xs text-text-muted truncate">
                          {firstItem}
                          {order.items?.length > 1 ? ` (+${order.items.length - 1})` : ''}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <StatusBadge status={order.status} />
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={10} />
                          {formatDateShort(order.deliveryDate)}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                        <span className="text-sm font-bold text-evergreen">{formatARS(balance)}</span>
                        <span className="text-xs text-text-muted">saldo</span>
                      </div>

                      <ArrowRight
                        size={14}
                        className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Actividad reciente */}
        <section
          className="xl:col-span-2 card-craft p-6 flex flex-col justify-between"
          aria-label="Actividad reciente"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-evergreen">Actividad Reciente</h2>
                <p className="text-xs text-text-muted">Últimos movimientos registrados</p>
              </div>
              <Link
                to="/finanzas"
                className="flex items-center gap-1 text-xs font-semibold text-mauve hover:underline"
              >
                Ver todo <ArrowRight size={12} />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-10 flex justify-center items-center text-text-muted text-sm gap-2">
                <span>Cargando movimientos...</span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-muted mb-2">
                  <Banknote size={18} />
                </div>
                <p className="text-xs font-semibold text-evergreen mb-1">Sin movimientos recientes</p>
                <p className="text-xs text-text-muted mb-3">
                  Los cobros de señas, ventas de feria y compras de insumos aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentTransactions.map((act) => {
                  const isIncome = act.type === 'INGRESO';
                  return (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isIncome ? 'bg-[#d1e7be]' : 'bg-[#ffdad6]'
                        }`}
                      >
                        {act.paymentMethod === 'TRANSFERENCIA' ? (
                          <CreditCard size={14} className={isIncome ? 'text-evergreen' : 'text-[#93000a]'} />
                        ) : (
                          <Banknote size={14} className={isIncome ? 'text-evergreen' : 'text-[#93000a]'} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-evergreen truncate">{act.description}</p>
                        <p className="text-xs text-text-muted">{formatDateShort(act.date)}</p>
                      </div>
                      <span
                        className={`text-sm font-bold flex-shrink-0 ${
                          isIncome ? 'text-evergreen' : 'text-[#93000a]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatARS(Number(act.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="mt-5 pt-5 border-t border-[#eedddb]/60">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Acciones rápidas
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/pedidos/nuevo" className="btn-primary justify-center text-xs py-2.5">
                <Package size={14} />
                Nuevo Pedido por Encargo
              </Link>
              <Link to="/venta-rapida" className="btn-secondary justify-center text-xs py-2.5">
                <ShoppingBag size={14} />
                Registrar Venta Rápida
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
