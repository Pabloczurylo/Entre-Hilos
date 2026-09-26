import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronDown, Calculator, Info } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../shared/types';

const CATEGORIES = PRODUCT_CATEGORIES;

interface OrderFormState {
  clientName: string;
  instagram: string;
  whatsapp: string;
  item: string;
  category: string;
  notes: string;
  dueDate: string;
  totalPrice: string;
  advancePayment: string;
  advanceMethod: 'EFECTIVO' | 'TRANSFERENCIA';
  hasAdvance: boolean;
}

export function NewOrderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderFormState>({
    clientName: '',
    instagram: '',
    whatsapp: '',
    item: '',
    category: CATEGORIES[0],
    notes: '',
    dueDate: '',
    totalPrice: '',
    advancePayment: '',
    advanceMethod: 'TRANSFERENCIA',
    hasAdvance: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof OrderFormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.clientName.trim()) e.clientName = 'El nombre del cliente es obligatorio';
    if (!form.item.trim()) e.item = 'El nombre del amigurumi es obligatorio';
    if (!form.dueDate) e.dueDate = 'La fecha de entrega es obligatoria';
    // totalPrice es opcional: si se ingresa, debe ser un número válido
    if (form.totalPrice && (isNaN(+form.totalPrice) || +form.totalPrice < 0))
      e.totalPrice = 'Ingresá un precio válido';
    if (form.hasAdvance && (!form.advancePayment || isNaN(+form.advancePayment) || +form.advancePayment <= 0))
      e.advancePayment = 'Ingresá el monto de la seña';
    if (form.hasAdvance && form.totalPrice && +form.advancePayment > +form.totalPrice)
      e.advancePayment = 'La seña no puede superar el total';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setSubmitting(true);
    // TODO: call API
    await new Promise(r => setTimeout(r, 600));
    setSubmitting(false);
    navigate('/pedidos');
  }

  const balance = form.totalPrice && form.advancePayment
    ? (+form.totalPrice - +form.advancePayment)
    : null;

  return (
    <div className="py-8 page-enter max-w-2xl mx-auto">
      <Link to="/pedidos" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-evergreen font-semibold mb-6 transition-colors">
        <ArrowLeft size={16} />
        Volver al Tablero
      </Link>

      <div className="mb-6">
        <h1 className="section-title">Nuevo Pedido por Encargo</h1>
        <p className="text-sm text-text-muted mt-1">Completá los datos para registrar el encargo</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Cliente ── */}
        <div className="card-craft p-6 mb-5">
          <h2 className="text-base font-bold text-evergreen mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">1</span>
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="clientName" className="label-craft">
                Nombre <span className="text-mauve">*</span>
              </label>
              <input
                id="clientName"
                type="text"
                value={form.clientName}
                onChange={e => update('clientName', e.target.value)}
                placeholder="Ej: Sol Ramírez"
                className={`input-craft ${errors.clientName ? 'border-red-400 focus:border-red-400' : ''}`}
              />
              {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
            </div>
            <div>
              <label htmlFor="instagram" className="label-craft">Instagram <span className="text-text-muted font-normal text-xs">(opcional)</span></label>
              <input
                id="instagram"
                type="text"
                value={form.instagram}
                onChange={e => update('instagram', e.target.value)}
                placeholder="@usuario"
                className="input-craft"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="label-craft">WhatsApp <span className="text-text-muted font-normal text-xs">(opcional)</span></label>
              <input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={e => update('whatsapp', e.target.value)}
                placeholder="1155667788"
                className="input-craft"
              />
            </div>
          </div>
        </div>

        {/* ── Amigurumi ── */}
        <div className="card-craft p-6 mb-5">
          <h2 className="text-base font-bold text-evergreen mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">2</span>
            Detalle del Amigurumi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="item" className="label-craft">
                Nombre del encargo <span className="text-mauve">*</span>
              </label>
              <input
                id="item"
                type="text"
                value={form.item}
                onChange={e => update('item', e.target.value)}
                placeholder="Ej: Osito Apego XL, Pikachu con auriculares..."
                className={`input-craft ${errors.item ? 'border-red-400' : ''}`}
              />
              {errors.item && <p className="text-xs text-red-500 mt-1">{errors.item}</p>}
            </div>
            <div>
              <label htmlFor="category" className="label-craft">Categoría</label>
              <div className="relative">
                <select
                  id="category"
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="input-craft appearance-none pr-9 cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="dueDate" className="label-craft">
                Fecha de entrega <span className="text-mauve">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={e => update('dueDate', e.target.value)}
                className={`input-craft ${errors.dueDate ? 'border-red-400' : ''}`}
              />
              {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label-craft">Notas de personalización</label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Colores, tamaño, detalles especiales..."
                rows={3}
                className="input-craft resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Precio ── */}
        <div className="card-craft p-6 mb-5">
          <h2 className="text-base font-bold text-evergreen mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">3</span>
            Precio y Seña
          </h2>

          {/* Banner informativo cotizador */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary-container/50 border border-[#eedddb] mb-4">
            <Calculator size={16} className="text-mauve mt-0.5 flex-shrink-0" />
            <p className="text-xs text-evergreen leading-relaxed">
              <span className="font-semibold">El precio es opcional al registrar.</span>{' '}
              Podés dejarlo en blanco y calcularlo después usando el{' '}
              <Link to="/cotizador" className="font-semibold text-mauve underline underline-offset-2 hover:text-evergreen transition-colors">
                Cotizador
              </Link>
              , que calculará el presupuesto y lo vinculará al pedido.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalPrice" className="label-craft">
                Precio total{' '}
                <span className="text-text-muted font-normal text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-sm">$</span>
                <input
                  id="totalPrice"
                  type="number"
                  min="0"
                  value={form.totalPrice}
                  onChange={e => update('totalPrice', e.target.value)}
                  placeholder="A definir con el cotizador"
                  className={`input-craft pl-7 ${errors.totalPrice ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.totalPrice && <p className="text-xs text-red-500 mt-1">{errors.totalPrice}</p>}
              {!form.totalPrice && (
                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                  <Info size={10} />
                  Se registrará como "Precio a confirmar"
                </p>
              )}
            </div>

            {/* Has advance toggle — solo disponible si hay precio */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                id="toggle-advance"
                onClick={() => form.totalPrice ? update('hasAdvance', !form.hasAdvance) : undefined}
                disabled={!form.totalPrice}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200
                  ${form.hasAdvance && form.totalPrice ? 'bg-mauve' : 'bg-surface-container-high'}
                  ${!form.totalPrice ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.hasAdvance && form.totalPrice ? 'translate-x-5' : ''}`} />
              </button>
              <div>
                <label
                  htmlFor="toggle-advance"
                  className={`text-sm font-semibold text-evergreen ${form.totalPrice ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  Registrar seña
                </label>
                {!form.totalPrice && (
                  <p className="text-xs text-text-muted">Ingresá el precio total primero</p>
                )}
              </div>
            </div>

            {form.hasAdvance && form.totalPrice && (
              <>
                <div>
                  <label htmlFor="advancePayment" className="label-craft">Monto de seña <span className="text-mauve">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-sm">$</span>
                    <input
                      id="advancePayment"
                      type="number"
                      min="0"
                      value={form.advancePayment}
                      onChange={e => update('advancePayment', e.target.value)}
                      placeholder="0"
                      className={`input-craft pl-7 ${errors.advancePayment ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.advancePayment && <p className="text-xs text-red-500 mt-1">{errors.advancePayment}</p>}
                </div>
                <div>
                  <label htmlFor="advanceMethod" className="label-craft">Método de pago</label>
                  <div className="flex gap-3">
                    {(['EFECTIVO', 'TRANSFERENCIA'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => update('advanceMethod', m)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${form.advanceMethod === m ? 'border-mauve bg-peony text-evergreen' : 'border-[#eedddb] bg-white text-text-muted'}`}
                      >
                        {m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Transferencia'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Balance preview */}
          {balance !== null && balance >= 0 && (
            <div className="mt-4 p-3 bg-primary-fixed rounded-xl flex items-center justify-between">
              <span className="text-sm text-on-primary-fixed font-semibold">Saldo a cobrar al entregar</span>
              <span className="text-lg font-bold text-evergreen">${balance.toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            id="btn-guardar-pedido"
            className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                Guardando...
              </span>
            ) : (
              <>
                <Plus size={16} />
                Guardar Pedido
              </>
            )}
          </button>
          <Link to="/pedidos" className="btn-secondary">
            <Trash2 size={14} />
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
