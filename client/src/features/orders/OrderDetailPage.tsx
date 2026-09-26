import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Clock,
  Banknote,
  CreditCard,
  ChevronRight,
  Check,
  Edit2,
  Calculator,
  CheckCircle2,
  X,
} from 'lucide-react';

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
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { OrderStatus } from '../../shared/types';

// ── Shared mock data (matches OrdersPage) ────────────────────────────────
const ALL_ORDERS = [
  { id: '1', client: 'Sol Ramírez',    instagram: '@sol.amis',       whatsapp: undefined,      item: 'Osito Apego XL',        category: 'Amigurumis General', status: 'TERMINADO' as OrderStatus, dueDate: '28 Sep 2026', totalPrice: 5000,  advancePayment: 1500, createdAt: '10 Sep 2026', notes: '' },
  { id: '2', client: 'Dani Fonseca',   instagram: undefined,          whatsapp: '1155667788',   item: 'Set Llaveros x3',       category: 'Llaveros',           status: 'TEJIENDO'  as OrderStatus, dueDate: '01 Oct 2026', totalPrice: 2400,  advancePayment: 600,  createdAt: '12 Sep 2026', notes: '' },
  { id: '3', client: 'Caro Méndez',    instagram: '@caro_m',          whatsapp: undefined,      item: 'Pikachu Personalizado', category: 'Personajes',         status: 'TEJIENDO'  as OrderStatus, dueDate: '03 Oct 2026', totalPrice: 6500,  advancePayment: 2300, createdAt: '14 Sep 2026', notes: 'Pikachu con auriculares negros, fondo amarillo pastel. Tamaño mediano (25cm aprox). La clienta quiere que tenga bolsillo en la panza.' },
  { id: '4', client: 'Lu Castillo',    instagram: undefined,          whatsapp: '1133445566',   item: 'Unicornio Bebé',        category: 'Amigurumis General', status: 'PENDIENTE' as OrderStatus, dueDate: '08 Oct 2026', totalPrice: 8000,  advancePayment: 2000, createdAt: '20 Sep 2026', notes: '' },
  { id: '5', client: 'Mica Torres',    instagram: '@mica.crochet',    whatsapp: undefined,      item: 'Stitch Grande',         category: 'Personajes',         status: 'PENDIENTE' as OrderStatus, dueDate: '12 Oct 2026', totalPrice: 7200,  advancePayment: 3000, createdAt: '21 Sep 2026', notes: '' },
  { id: '6', client: 'Fer Rodríguez',  instagram: undefined,          whatsapp: undefined,      item: 'Ramo Flores Tejidas',   category: 'Flores',             status: 'ENTREGADO' as OrderStatus, dueDate: '15 Sep 2026', totalPrice: 3500,  advancePayment: 3500, createdAt: '01 Sep 2026', notes: '' },
  { id: '7', client: 'Juli Vega',      item: 'Axolote Rosa',          category: 'Personajes',         status: 'ENTREGADO' as OrderStatus, dueDate: '18 Sep 2026', totalPrice: 4800,  advancePayment: 4800, instagram: '@juliv',      createdAt: '05 Sep 2026', notes: '' },
  { id: '8', client: 'Vale Sánchez',   instagram: '@vale.tejidos',    whatsapp: '1177889900',   item: 'Dragonón Personalizado', category: 'Personajes',         status: 'PENDIENTE' as OrderStatus, dueDate: '20 Oct 2026', totalPrice: 0,     advancePayment: 0,    createdAt: '25 Sep 2026', notes: 'Dragón tipo How to Train Your Dragon, color azul oscuro, tamaño grande. Precio a confirmar con cotizador.' },
];

const STATUS_FLOW: OrderStatus[] = ['PENDIENTE', 'TEJIENDO', 'TERMINADO', 'ENTREGADO'];

function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const foundOrder = ALL_ORDERS.find(o => o.id === id);

  const [status, setStatus] = useState<OrderStatus>(
    foundOrder?.status ?? 'PENDIENTE'
  );

  // Precio propuesto desde el cotizador
  const appliedPriceParam = searchParams.get('appliedPrice');
  const appliedPriceRaw = appliedPriceParam ? parseInt(appliedPriceParam, 10) : null;

  // Estado local del precio (simula el apply antes de tener API)
  const [localPrice, setLocalPrice] = useState<number | null>(null);
  const [priceAccepted, setPriceAccepted] = useState(false);

  function acceptPrice() {
    if (!appliedPriceRaw) return;
    setLocalPrice(appliedPriceRaw);
    setPriceAccepted(true);
    // Limpiar el query param sin recargar
    setSearchParams({}, { replace: true });
  }

  function dismissPrice() {
    setSearchParams({}, { replace: true });
  }

  if (!foundOrder) {
    return (
      <div className="py-8 page-enter max-w-3xl mx-auto text-center">
        <p className="text-text-muted text-sm mb-4">Pedido no encontrado.</p>
        <Link to="/pedidos" className="btn-secondary text-xs">← Volver al tablero</Link>
      </div>
    );
  }

  const order = foundOrder;
  // El precio efectivo: el local aplicado, o el original del pedido
  const effectivePrice = localPrice ?? order.totalPrice;

  const payments = [
    { id: 'p1', amount: order.advancePayment, method: 'TRANSFERENCIA' as const, date: order.createdAt, note: 'Seña inicial' },
  ];

  const currentIdx = STATUS_FLOW.indexOf(status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const hasPriceDefined = effectivePrice > 0;
  const balance = hasPriceDefined ? effectivePrice - order.advancePayment : 0;
  const paidPercent = hasPriceDefined ? Math.round((order.advancePayment / effectivePrice) * 100) : 0;

  // URL para ir al cotizador con contexto pre-cargado
  const quoteUrl = `/cotizador?orderId=${order.id}&orderName=${encodeURIComponent(order.item)}&orderClient=${encodeURIComponent(order.client)}`;

  const nextLabel: Record<OrderStatus, string> = {
    PENDIENTE: 'Iniciar Tejido',
    TEJIENDO:  'Marcar como Terminado',
    TERMINADO: 'Marcar como Entregado',
    ENTREGADO: '',
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
              {order.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-evergreen">{order.client}</h1>
              <div className="flex items-center gap-3 mt-1">
                {order.instagram && (
                  <a
                    href={`https://instagram.com/${order.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-mauve transition-colors"
                  >
                    <InstagramIcon size={12} />
                    {order.instagram}
                  </a>
                )}
                {order.whatsapp && (
                  <a
                    href={`https://wa.me/54${order.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-sage transition-colors"
                  >
                    <Phone size={12} />
                    {order.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Status stepper */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Estado del pedido</p>
          <div className="flex items-center gap-0">
            {STATUS_FLOW.map((s, i) => {
              const done = STATUS_FLOW.indexOf(status) >= i;
              const isCurrent = s === status;
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${isCurrent ? 'scale-110' : ''} transition-transform`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors
                      ${done
                        ? 'border-mauve bg-mauve text-white'
                        : 'border-[#eedddb] bg-white text-text-muted'
                      }`}
                    >
                      {done && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${isCurrent ? 'text-evergreen' : 'text-text-muted'}`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${done ? 'bg-mauve' : 'bg-[#eedddb]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Item details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-surface-container-low rounded-xl">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Amigurumi</p>
            <p className="text-sm font-bold text-evergreen">{order.item}</p>
            <span className="text-xs px-2 py-0.5 bg-surface-container rounded-md text-text-muted mt-1 inline-block">
              {order.category}
            </span>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Fecha de Entrega</p>
            <p className="text-sm font-bold text-evergreen flex items-center gap-2">
              <Clock size={14} className="text-mauve" />
              {order.dueDate}
            </p>
            <p className="text-xs text-text-muted mt-1">Creado: {order.createdAt}</p>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6 p-4 bg-peony/30 rounded-xl border border-peony/50">
            <p className="text-xs font-semibold text-evergreen uppercase tracking-wider mb-2 flex items-center gap-1">
              <Edit2 size={11} />
              Notas de personalización
            </p>
            <p className="text-sm text-evergreen leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Advance to next status */}
        {nextStatus && (
          <button
            onClick={() => setStatus(nextStatus)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all
              ${nextStatus === 'ENTREGADO' ? 'btn-success' : 'btn-primary'} hover:shadow-button`}
            id={`btn-advance-${nextStatus}`}
          >
            {nextLabel[status]}
            <ChevronRight size={16} />
          </button>
        )}
        {status === 'ENTREGADO' && (
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
      {priceAccepted && localPrice && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-secondary-container/60 border border-sage/30">
          <CheckCircle2 size={16} className="text-sage flex-shrink-0" />
          <p className="text-sm text-evergreen">
            <span className="font-bold">Precio actualizado:</span>{' '}
            <span className="font-semibold text-sage">{formatARS(localPrice)}</span>{' '}
            aplicado desde el Cotizador
          </p>
        </div>
      )}

      {/* Finance card */}
      <div className="card-craft p-6">
        <h2 className="text-base font-bold text-evergreen mb-4">Detalle Financiero</h2>

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
                <span className="text-text-muted">Seña abonada</span>
                <span className="font-bold text-evergreen">{formatARS(order.advancePayment)} / {formatARS(order.totalPrice)}</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${paidPercent}%`, backgroundColor: '#d8959b' }}
                />
              </div>
              <p className="text-xs text-text-muted mt-1 text-right">{paidPercent}% abonado</p>
            </div>

            {/* Balance highlight */}
            <div className={`p-4 rounded-xl flex items-center justify-between mb-5 ${balance > 0 ? 'bg-primary-fixed' : 'bg-secondary-container'}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-fixed">
                  {balance > 0 ? 'Saldo restante' : 'Total pagado'}
                </p>
                <p className="text-2xl font-bold text-evergreen">{formatARS(balance > 0 ? balance : order.totalPrice)}</p>
              </div>
              {balance > 0
                ? <Banknote size={28} className="text-mauve opacity-60" />
                : <Check size={28} className="text-sage opacity-80" />
              }
            </div>

            {/* Payment history */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Historial de pagos</p>
              <div className="flex flex-col gap-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                      {p.method === 'TRANSFERENCIA'
                        ? <CreditCard size={14} className="text-sage" />
                        : <Banknote size={14} className="text-sage" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-evergreen">{p.note}</p>
                      <p className="text-xs text-text-muted">{p.date} · {p.method.charAt(0) + p.method.slice(1).toLowerCase()}</p>
                    </div>
                    <span className="text-sm font-bold text-sage">+{formatARS(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
