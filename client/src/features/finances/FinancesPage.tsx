import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Banknote,
  CreditCard,
  ChevronDown,
  Filter,
} from 'lucide-react';

type TransactionType = 'INGRESO' | 'EGRESO';
type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';
type TransactionCategory =
  | 'SENA_PEDIDO' | 'SALDO_PEDIDO' | 'VENTA_RAPIDA' | 'OTRO_INGRESO'
  | 'INSUMOS' | 'PACKAGING' | 'FERIA_STAND' | 'OTRO_EGRESO';

interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  method: PaymentMethod;
  date: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INGRESO',  category: 'SENA_PEDIDO',   description: 'Seña – Caro Méndez (Pikachu)',    amount: 2300, method: 'TRANSFERENCIA', date: '14 Sep 2026' },
  { id: 't2', type: 'EGRESO',   category: 'INSUMOS',       description: 'Compra hilos Crochet Rosa + Beige', amount: 3200, method: 'EFECTIVO',     date: '15 Sep 2026' },
  { id: 't3', type: 'INGRESO',  category: 'SALDO_PEDIDO',  description: 'Saldo final – Sol Ramírez',        amount: 3500, method: 'TRANSFERENCIA', date: '16 Sep 2026' },
  { id: 't4', type: 'INGRESO',  category: 'VENTA_RAPIDA',  description: 'Feria Parque Avellaneda – Set x2', amount: 2400, method: 'EFECTIVO',     date: '17 Sep 2026' },
  { id: 't5', type: 'EGRESO',   category: 'FERIA_STAND',   description: 'Pago stand feria',                 amount: 1500, method: 'EFECTIVO',     date: '17 Sep 2026' },
  { id: 't6', type: 'EGRESO',   category: 'PACKAGING',     description: 'Bolsas biodegradables x50',        amount: 800,  method: 'TRANSFERENCIA', date: '18 Sep 2026' },
  { id: 't7', type: 'INGRESO',  category: 'SENA_PEDIDO',   description: 'Seña – Lu Castillo (Unicornio)',   amount: 2000, method: 'TRANSFERENCIA', date: '20 Sep 2026' },
  { id: 't8', type: 'EGRESO',   category: 'INSUMOS',       description: 'Vellón relleno 1kg',               amount: 2400, method: 'EFECTIVO',     date: '22 Sep 2026' },
  { id: 't9', type: 'INGRESO',  category: 'VENTA_RAPIDA',  description: 'Feria Parque Avellaneda – Varios', amount: 5600, method: 'EFECTIVO',     date: '23 Sep 2026' },
];

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  SENA_PEDIDO:  'Seña de pedido',
  SALDO_PEDIDO: 'Saldo de pedido',
  VENTA_RAPIDA: 'Venta rápida',
  OTRO_INGRESO: 'Otro ingreso',
  INSUMOS:      'Insumos',
  PACKAGING:    'Packaging',
  FERIA_STAND:  'Stand de feria',
  OTRO_EGRESO:  'Otro gasto',
};

const INCOME_CATEGORIES: TransactionCategory[] = ['SENA_PEDIDO', 'SALDO_PEDIDO', 'VENTA_RAPIDA', 'OTRO_INGRESO'];
const EXPENSE_CATEGORIES: TransactionCategory[] = ['INSUMOS', 'PACKAGING', 'FERIA_STAND', 'OTRO_EGRESO'];

function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

// ── New Transaction Modal ─────────────────────────────────────────────────
interface NewTxModalProps {
  type: TransactionType;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
}

function NewTxModal({ type, onClose, onSave }: NewTxModalProps) {
  const cats = type === 'INGRESO' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [form, setForm] = useState({
    category: cats[0],
    description: '',
    amount: '',
    method: 'EFECTIVO' as PaymentMethod,
  });

  function handleSave() {
    if (!form.description || !form.amount) return;
    onSave({
      type,
      category: form.category as TransactionCategory,
      description: form.description,
      amount: parseFloat(form.amount),
      method: form.method,
      date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-evergreen/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-bold text-evergreen mb-5">
          {type === 'INGRESO' ? '💚 Registrar Ingreso' : '🔴 Registrar Egreso'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="label-craft">Categoría</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as TransactionCategory }))}
                className="input-craft appearance-none pr-9"
              >
                {cats.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="label-craft">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Ej: Compra de hilos..."
              className="input-craft"
            />
          </div>

          <div>
            <label className="label-craft">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="input-craft pl-7"
              />
            </div>
          </div>

          <div>
            <label className="label-craft">Método de pago</label>
            <div className="flex gap-3">
              {(['EFECTIVO', 'TRANSFERENCIA'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, method: m }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${form.method === m ? 'border-mauve bg-peony text-evergreen' : 'border-[#eedddb] bg-white text-text-muted'}`}
                >
                  {m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Transferencia'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSave} className="btn-primary flex-1 justify-center text-sm py-2.5">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2.5">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  const [modal, setModal] = useState<TransactionType | null>(null);

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);

  const totalIncome = transactions.filter(t => t.type === 'INGRESO').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EGRESO').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const incomeEfectivo = transactions.filter(t => t.type === 'INGRESO' && t.method === 'EFECTIVO').reduce((s, t) => s + t.amount, 0);
  const incomeTrans = transactions.filter(t => t.type === 'INGRESO' && t.method === 'TRANSFERENCIA').reduce((s, t) => s + t.amount, 0);

  function handleAdd(tx: Omit<Transaction, 'id'>) {
    setTransactions(p => [{ ...tx, id: 'new-' + Date.now() }, ...p]);
  }

  return (
    <div className="py-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
            Contabilidad · Septiembre 2026
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
            Ingreso
          </button>
          <button
            onClick={() => setModal('EGRESO')}
            className="btn-secondary text-xs py-2 px-4 gap-1.5"
            id="btn-nuevo-egreso"
          >
            <Plus size={14} />
            Egreso
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Ingresos del Mes</p>
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
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Egresos Totales</p>
            <p className="text-2xl font-bold text-evergreen mt-0.5">{formatARS(totalExpense)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center">
            <TrendingDown size={18} className="text-[#93000a]" />
          </div>
        </div>
        <div className={`stat-card ${netProfit >= 0 ? 'border-secondary-container' : 'border-[#ffdad6]'}`}>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Ganancia Neta</p>
            <p className={`text-2xl font-bold mt-0.5 ${netProfit >= 0 ? 'text-sage' : 'text-[#ba1a1a]'}`}>
              {netProfit >= 0 ? '' : '-'}{formatARS(Math.abs(netProfit))}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netProfit >= 0 ? 'bg-secondary-container' : 'bg-[#ffdad6]'}`}>
            <span className="text-xl">{netProfit >= 0 ? '📈' : '📉'}</span>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="card-craft p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-evergreen">Movimientos</h2>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <div className="flex rounded-full overflow-hidden border border-[#eedddb] bg-white">
              {(['ALL', 'INGRESO', 'EGRESO'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${filter === f ? 'bg-mauve text-white' : 'text-text-muted hover:text-evergreen'}`}
                >
                  {f === 'ALL' ? 'Todos' : f === 'INGRESO' ? 'Ingresos' : 'Egresos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-[#eedddb]/60">
          {filtered.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 py-3.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'INGRESO' ? 'bg-secondary-container' : 'bg-[#ffdad6]'}`}>
                {tx.method === 'TRANSFERENCIA'
                  ? <CreditCard size={14} className={tx.type === 'INGRESO' ? 'text-sage' : 'text-[#93000a]'} />
                  : <Banknote size={14} className={tx.type === 'INGRESO' ? 'text-sage' : 'text-[#93000a]'} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-evergreen truncate">{tx.description}</p>
                <p className="text-xs text-text-muted">{tx.date} · {CATEGORY_LABELS[tx.category]}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-sm font-bold ${tx.type === 'INGRESO' ? 'text-sage' : 'text-[#ba1a1a]'}`}>
                  {tx.type === 'INGRESO' ? '+' : '-'}{formatARS(tx.amount)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tx.method === 'EFECTIVO' ? 'bg-surface-container text-text-muted' : 'bg-primary-fixed text-on-primary-fixed'}`}>
                  {tx.method === 'EFECTIVO' ? '💵 Ef.' : '💳 Trans.'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <NewTxModal
          type={modal}
          onClose={() => setModal(null)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}
