import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Banknote,
  CreditCard,
  ChevronDown,
  Filter,
  X,
  Wallet,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from './services/financeApi';
import { PaymentMethod, TransactionCategory, TransactionType } from '@/shared/types';
import { Transaction } from './types';

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  SENA_PEDIDO: 'Seña de pedido',
  SALDO_PEDIDO: 'Saldo de pedido',
  VENTA_RAPIDA: 'Venta rápida',
  OTRO_INGRESO: 'Otro ingreso',
  INSUMOS: 'Insumos',
  PACKAGING: 'Packaging',
  FERIA_STAND: 'Stand de feria',
  OTRO_EGRESO: 'Otro gasto',
};

const INCOME_CATEGORIES: TransactionCategory[] = [
  'SENA_PEDIDO',
  'SALDO_PEDIDO',
  'VENTA_RAPIDA',
  'OTRO_INGRESO',
];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'INSUMOS',
  'PACKAGING',
  'FERIA_STAND',
  'OTRO_EGRESO',
];

function formatARS(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-AR')}`;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ── New Transaction Modal ─────────────────────────────────────────────────
interface NewTxModalProps {
  type: TransactionType;
  onClose: () => void;
}

function NewTxModal({ type, onClose }: NewTxModalProps) {
  const queryClient = useQueryClient();
  const cats = type === 'INGRESO' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [form, setForm] = useState({
    category: cats[0],
    description: '',
    amount: '',
    method: 'EFECTIVO' as PaymentMethod,
  });
  const [error, setError] = useState('');

  const incomeMutation = useMutation({
    mutationFn: (dto: any) => financeApi.createIncome(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finances-transactions'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message || 'Error al registrar ingreso'),
  });

  const expenseMutation = useMutation({
    mutationFn: (dto: any) => financeApi.createExpense(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finances-transactions'] });
      onClose();
    },
    onError: (err: Error) => setError(err.message || 'Error al registrar egreso'),
  });

  const isPending = incomeMutation.isPending || expenseMutation.isPending;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) {
      setError('Ingresá un monto mayor a 0');
      return;
    }

    if (type === 'INGRESO') {
      incomeMutation.mutate({
        category: form.category,
        description: form.description.trim(),
        amount: amountNum,
        paymentMethod: form.method,
      });
    } else {
      expenseMutation.mutate({
        category: form.category,
        description: form.description.trim(),
        amount: amountNum,
        paymentMethod: form.method,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-evergreen/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-evergreen">
            {type === 'INGRESO' ? '💚 Registrar Ingreso' : '🔴 Registrar Egreso'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-evergreen">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="label-craft">Categoría</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value as TransactionCategory }))
                }
                className="input-craft appearance-none pr-9"
              >
                {cats.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="label-craft">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={
                type === 'INGRESO' ? 'Ej: Seña de pedido especial...' : 'Ej: Compra de hilos...'
              }
              className="input-craft"
              required
            />
          </div>

          <div>
            <label className="label-craft">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">
                $
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="input-craft pl-7"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-craft">
              Método de pago {type === 'INGRESO' && '(Obligatorio)'}
            </label>
            <div className="flex gap-3">
              {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, method: m }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.method === m
                      ? 'border-mauve bg-peony text-evergreen'
                      : 'border-[#eedddb] bg-white text-text-muted'
                  }`}
                >
                  {m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 justify-center text-sm py-2.5"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2.5">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export function FinancesPage() {
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  const [modal, setModal] = useState<TransactionType | null>(null);

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['finances-dashboard'],
    queryFn: () => financeApi.getDashboard(),
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery<Transaction[]>({
    queryKey: ['finances-transactions', filter],
    queryFn: () => financeApi.getTransactions(filter !== 'ALL' ? { type: filter } : undefined),
  });

  const isLoading = loadingDash || loadingTx;

  const totalIncome = Number(dashboard?.income?.total || 0);
  const incomeEfectivo = Number(dashboard?.income?.cash || 0);
  const incomeTrans = Number(dashboard?.income?.transfer || 0);
  const totalExpense = Number(dashboard?.expenses?.total || 0);
  const netProfit = Number(dashboard?.netProfit ?? (totalIncome - totalExpense));

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div className="py-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1 capitalize">
            Contabilidad ·{' '}
            {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
          <h1 className="section-title">Finanzas</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('INGRESO')}
            className="btn-success text-xs py-2 px-4 gap-1.5"
            id="btn-nuevo-ingreso"
          >
            <Plus size={14} />
            Registrar Ingreso
          </button>
          <button
            onClick={() => setModal('EGRESO')}
            className="btn-secondary text-xs py-2 px-4 gap-1.5"
            id="btn-nuevo-egreso"
          >
            <Plus size={14} />
            Registrar Egreso
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Ingresos del Mes
            </p>
            <p className="text-2xl font-bold text-evergreen mt-0.5">{formatARS(totalIncome)}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
              <span>💵 {formatARS(incomeEfectivo)}</span>
              <span>·</span>
              <span>💳 {formatARS(incomeTrans)}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
            <TrendingUp size={18} className="text-sage" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Egresos Totales
            </p>
            <p className="text-2xl font-bold text-evergreen mt-0.5">{formatARS(totalExpense)}</p>
            <p className="text-xs text-text-muted mt-1">Costos de materiales y stand</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center">
            <TrendingDown size={18} className="text-[#93000a]" />
          </div>
        </div>
        <div
          className={`stat-card ${
            netProfit >= 0 ? 'border-secondary-container' : 'border-[#ffdad6]'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Ganancia Neta
            </p>
            <p
              className={`text-2xl font-bold mt-0.5 ${
                netProfit >= 0 ? 'text-sage' : 'text-[#ba1a1a]'
              }`}
            >
              {netProfit >= 0 ? '' : '-'}
              {formatARS(Math.abs(netProfit))}
            </p>
            <p className="text-xs text-text-muted mt-1">Margen real del mes</p>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              netProfit >= 0 ? 'bg-secondary-container' : 'bg-[#ffdad6]'
            }`}
          >
            <span className="text-xl">{netProfit >= 0 ? '📈' : '📉'}</span>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="card-craft p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-evergreen">Movimientos Registrados</h2>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <div className="flex rounded-full overflow-hidden border border-[#eedddb] bg-white">
              {(['ALL', 'INGRESO', 'EGRESO'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-mauve text-white' : 'text-text-muted hover:text-evergreen'
                  }`}
                >
                  {f === 'ALL' ? 'Todos' : f === 'INGRESO' ? 'Ingresos' : 'Egresos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
            <svg className="animate-spin w-6 h-6 text-mauve" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Cargando transacciones...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-text-muted mb-3">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-semibold text-evergreen mb-1">Sin movimientos registrados</p>
            <p className="text-xs text-text-muted mb-4 max-w-sm">
              Podés asentar ingresos de señas, ventas rápidas o registrar egresos por compra de lanas y packaging.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModal('INGRESO')}
                className="btn-success text-xs py-2 px-3"
              >
                + Cargar Ingreso
              </button>
              <button
                onClick={() => setModal('EGRESO')}
                className="btn-secondary text-xs py-2 px-3"
              >
                + Cargar Egreso
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#eedddb]/60">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'INGRESO';
              const catLabel = CATEGORY_LABELS[tx.category] || tx.category;

              return (
                <div key={tx.id} className="flex items-center gap-4 py-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isIncome ? 'bg-secondary-container' : 'bg-[#ffdad6]'
                    }`}
                  >
                    {tx.paymentMethod === 'TRANSFERENCIA' ? (
                      <CreditCard
                        size={14}
                        className={isIncome ? 'text-sage' : 'text-[#93000a]'}
                      />
                    ) : (
                      <Banknote
                        size={14}
                        className={isIncome ? 'text-sage' : 'text-[#93000a]'}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-evergreen truncate">{tx.description}</p>
                    <p className="text-xs text-text-muted">
                      {formatDate(tx.date)} · {catLabel}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isIncome ? 'text-sage' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatARS(Number(tx.amount))}
                    </span>
                    {tx.paymentMethod && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          tx.paymentMethod === 'EFECTIVO'
                            ? 'bg-surface-container text-text-muted'
                            : 'bg-primary-fixed text-evergreen'
                        }`}
                      >
                        {tx.paymentMethod === 'EFECTIVO' ? '💵 Ef.' : '💳 Trans.'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <NewTxModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
