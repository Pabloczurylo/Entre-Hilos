import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Phone,
  Clock,
  Banknote,
  CreditCard,
  ChevronRight,
  Check,
  Edit2,
  Package,
  PlusCircle,
  Calculator,
  CheckCircle2,
  X,
} from 'lucide-react';
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { OrderStatus, PaymentMethod } from '../../shared/types';
import { orderApi } from './services/orderApi';
import { Order } from './types';

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const STATUS_FLOW: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];

function formatARS(n: number) {
  return `$${Math.round(n || 0).toLocaleString('es-AR')}`;
}

function formatDateFull(dateStr?: string | null) {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('EFECTIVO');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Precio propuesto desde el cotizador
  const appliedPriceParam = searchParams.get('appliedPrice');
  const appliedPriceRaw = appliedPriceParam ? parseInt(appliedPriceParam, 10) : null;
  const [priceAccepted, setPriceAccepted] = useState(false);

  function acceptPrice() {
    if (!appliedPriceRaw) return;
    setPriceAccepted(true);
    setSearchParams({}, { replace: true });
  }

  function dismissPrice() {
    setSearchParams({}, { replace: true });
  }

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id!),
    enabled: Boolean(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => orderApi.updateStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
    },
  });

  const payBalanceMutation = useMutation({
    mutationFn: (payload: { amount: number; paymentMethod: PaymentMethod; notes?: string }) =>
      orderApi.payBalance(id!, payload),
    onSuccess: () => {
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      setPayError('');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finances-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
    },
    onError: (err: Error) => {
      setPayError(err.message || 'Error al registrar el pago');
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 page-enter max-w-3xl mx-auto text-center flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-mauve" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-text-muted text-sm">Cargando detalle del pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 page-enter max-w-3xl mx-auto text-center">
        <p className="text-text-muted text-sm mb-4">Pedido no encontrado o hubo un error al cargarlo.</p>
        <Link to="/pedidos" className="btn-secondary text-xs">
          ← Volver al tablero
        </Link>
      </div>
    );
  }

  const clientName = order.customer?.name || 'Cliente';
  const initials = clientName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const total = Number(order.totalAmount || 0);
  const deposit = Number(order.depositAmount || 0);
  const balance = Number(order.balanceAmount ?? (total - deposit));
  const hasPriceDefined = total > 0;
  const paidPercent = hasPriceDefined ? Math.min(100, Math.round(((total - balance) / total) * 100)) : 0;

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const nextLabel: Record<OrderStatus, string> = {
    PENDIENTE: 'Iniciar Tejido',
    TEJIENDO: 'Marcar como Terminado',
    TERMINADO: 'Marcar como Entregado',
    ENTREGADO: '',
  };

  const transactions = (order as any).transactions || [];

  // URL para ir al cotizador con contexto pre-cargado
  const firstItemName = order.items?.[0]?.name || '';
  const quoteUrl = `/cotizador?orderId=${order.id}&orderName=${encodeURIComponent(firstItemName)}&orderClient=${encodeURIComponent(clientName)}`;

  const handleOpenPayModal = () => {
    setPayAmount(balance.toString());
    setPayError('');
    setShowPayModal(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(payAmount);
    if (!num || num <= 0) {
      setPayError('Ingresá un monto válido');
      return;
    }
    payBalanceMutation.mutate({
      amount: num,
      paymentMethod: payMethod,
      notes: payNotes.trim() || undefined,
    });
  };

  return (
    <div className="py-8 page-enter max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to="/pedidos"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-evergreen font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al Tablero
      </Link>

      {/* Card principal */}
      <div className="card-craft p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-peony flex items-center justify-center text-lg font-bold text-evergreen">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-evergreen">{clientName}</h1>
                {order.orderNumber && (
                  <span className="text-xs bg-surface-container text-text-muted px-2 py-0.5 rounded font-mono">
                    {order.orderNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {order.customer?.instagram && (
                  <a
                    href={`https://instagram.com/${order.customer.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-mauve transition-colors"
                  >
                    <InstagramIcon size={12} />
                    {order.customer.instagram}
                  </a>
                )}
                {order.customer?.whatsapp && (
                  <a
                    href={`https://wa.me/54${order.customer.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-sage transition-colors"
                  >
                    <Phone size={12} />
                    {order.customer.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Status stepper */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Estado del pedido
          </p>
          <div className="flex items-center gap-0">
            {STATUS_FLOW.map((s, i) => {
              const done = STATUS_FLOW.indexOf(order.status) >= i;
              const isCurrent = s === order.status;
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div
                    className={`flex flex-col items-center gap-1 flex-shrink-0 ${
                      isCurrent ? 'scale-110' : ''
                    } transition-transform`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done
                          ? 'border-mauve bg-mauve text-white'
                          : 'border-[#eedddb] bg-white text-text-muted'
                      }`}
                    >
                      {done && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:block ${
                        isCurrent ? 'text-evergreen' : 'text-text-muted'
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${
                        done ? 'bg-mauve' : 'bg-[#eedddb]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Ítems del Encargo
          </p>
          <div className="flex flex-col gap-2">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-mauve" />
                  <div>
                    <span className="text-sm font-semibold text-evergreen">{item.name}</span>
                    <span className="text-xs text-text-muted ml-2">x{item.quantity}</span>
                    {item.customizationDetails && (
                      <p className="text-xs text-text-muted mt-0.5 italic">
                        {item.customizationDetails}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-evergreen">
                  {formatARS(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Date */}
        <div className="p-4 bg-surface-container-low rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-evergreen">
            <Clock size={16} className="text-mauve" />
            <span>Fecha de Entrega Prometida</span>
          </div>
          <span className="text-sm font-bold text-evergreen">
            {formatDateFull(order.deliveryDate)}
          </span>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6 p-4 bg-peony/30 rounded-xl border border-peony/50">
            <p className="text-xs font-semibold text-evergreen uppercase tracking-wider mb-2 flex items-center gap-1">
              <Edit2 size={11} />
              Notas Generales
            </p>
            <p className="text-sm text-evergreen leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Advance to next status */}
        {nextStatus && (
          <button
            onClick={() => updateStatusMutation.mutate(nextStatus)}
            disabled={updateStatusMutation.isPending}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all
              ${nextStatus === 'ENTREGADO' ? 'btn-success' : 'btn-primary'}`}
            id={`btn-advance-${nextStatus}`}
          >
            {updateStatusMutation.isPending ? 'Actualizando...' : nextLabel[order.status]}
            <ChevronRight size={16} />
          </button>
        )}
        {order.status === 'ENTREGADO' && (
          <div className="text-center py-3 text-sm font-semibold text-sage flex items-center justify-center gap-2">
            <Check size={16} />
            Pedido completado y entregado
          </div>
        )}
      </div>

      {/* Banner: precio propuesto por el cotizador */}
      {appliedPriceRaw && !priceAccepted && (
        <div className="card-craft p-5 mb-6 border-2 border-mauve/40 bg-peony/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-peony flex items-center justify-center flex-shrink-0">
              <Calculator size={18} className="text-mauve" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">Precio calculado por el Cotizador</p>
              <p className="text-2xl font-black text-evergreen">{formatARS(appliedPriceRaw)}</p>
              <p className="text-xs text-text-muted mt-1">¿Querés aplicar este precio al pedido?</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={acceptPrice}
              id="btn-confirmar-precio-cotizador"
              className="btn-primary flex-1 justify-center text-sm"
            >
              <CheckCircle2 size={14} />
              Confirmar precio
            </button>
            <button
              type="button"
              onClick={dismissPrice}
              className="btn-secondary text-sm"
              id="btn-descartar-precio-cotizador"
            >
              <X size={14} />
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Banner: precio aceptado exitosamente */}
      {priceAccepted && appliedPriceRaw && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-secondary-container/60 border border-sage/30">
          <CheckCircle2 size={16} className="text-sage flex-shrink-0" />
          <p className="text-sm text-evergreen">
            <span className="font-bold">Precio actualizado:</span>{' '}
            <span className="font-semibold text-sage">{formatARS(appliedPriceRaw)}</span>{' '}
            aplicado desde el Cotizador
          </p>
        </div>
      )}

      {/* Finance card */}
      <div className="card-craft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-evergreen">Detalle Financiero</h2>
          {hasPriceDefined && balance > 0 && (
            <button
              onClick={handleOpenPayModal}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <PlusCircle size={13} />
              Registrar Cobro de Saldo
            </button>
          )}
        </div>

        {!hasPriceDefined ? (
          /* Estado: Precio a confirmar */
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-peony flex items-center justify-center">
              <Calculator size={24} className="text-mauve" />
            </div>
            <div>
              <p className="text-sm font-bold text-evergreen mb-1">Precio a confirmar</p>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                El precio de este pedido aún no fue definido. Usá el Cotizador para calcular el presupuesto y vincularlo a este pedido.
              </p>
            </div>
            <Link
              to={quoteUrl}
              className="btn-primary text-sm px-5 py-2.5"
            >
              <Calculator size={14} />
              Cotizar este pedido
            </Link>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Abonado</span>
                <span className="font-bold text-evergreen">
                  {formatARS(total - balance)} / {formatARS(total)}
                </span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${paidPercent}%`,
                    backgroundColor: paidPercent >= 100 ? '#829672' : '#d8959b',
                  }}
                />
              </div>
              <p className="text-xs text-text-muted mt-1 text-right">{paidPercent}% abonado</p>
            </div>

            {/* Balance highlight */}
            <div
              className={`p-4 rounded-xl flex items-center justify-between mb-5 ${
                balance > 0 ? 'bg-primary-fixed' : 'bg-[#d1e7be]'
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-evergreen">
                  {balance > 0 ? 'Saldo restante' : 'Total pagado'}
                </p>
                <p className="text-2xl font-bold text-evergreen">
                  {formatARS(balance > 0 ? balance : total)}
                </p>
              </div>
              {balance > 0 ? (
                <Banknote size={28} className="text-mauve opacity-60" />
              ) : (
                <Check size={28} className="text-sage opacity-80" />
              )}
            </div>

            {/* Payment history */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Historial de pagos registrados
              </p>
              {transactions.length === 0 ? (
                <p className="text-xs text-text-muted italic">Sin transacciones registradas</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                        {p.paymentMethod === 'TRANSFERENCIA' ? (
                          <CreditCard size={14} className="text-sage" />
                        ) : (
                          <Banknote size={14} className="text-sage" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-evergreen">{p.description}</p>
                        <p className="text-xs text-text-muted">
                          {formatDateFull(p.date)} · {p.paymentMethod || 'Efectivo'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-sage">+{formatARS(Number(p.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pay balance modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-evergreen/30 backdrop-blur-sm"
            onClick={() => setShowPayModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-evergreen">Registrar Pago de Saldo</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-text-muted hover:text-evergreen"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="flex flex-col gap-4">
              <div>
                <label className="label-craft">Monto a cobrar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={balance}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="input-craft pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-craft">Método de pago (Obligatorio)</label>
                <div className="flex gap-3">
                  {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        payMethod === m
                          ? 'border-mauve bg-peony text-evergreen'
                          : 'border-[#eedddb] bg-white text-text-muted'
                      }`}
                    >
                      {m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Transferencia'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-craft">Notas adicionales (opcional)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Ej: Pago contra entrega..."
                  className="input-craft"
                />
              </div>

              {payError && <p className="text-xs text-red-500">{payError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={payBalanceMutation.isPending}
                  className="btn-primary flex-1 justify-center"
                >
                  {payBalanceMutation.isPending ? 'Guardando...' : 'Confirmar Cobro'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
