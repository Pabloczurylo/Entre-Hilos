import { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ListOrdered,
  LayoutGrid,
  RotateCcw,
  Database,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PRODUCT_CATEGORIES } from '../../shared/types';
import {
  priceListApi,
  PriceItem,
  CreatePriceItemDTO,
  UpdatePriceItemDTO,
} from './services/priceListApi';

// ── Helpers ───────────────────────────────────────────────────────────────
function formatARS(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`;
}

// ── Category color map ────────────────────────────────────────────────────
type CategoryStyle = { bg: string; text: string; dot: string };

const CATEGORY_COLORS: Record<string, CategoryStyle> = {
  'Llaveros':           { bg: 'bg-sky-50',    text: 'text-sky-700',    dot: 'bg-sky-400' },
  'Flores':             { bg: 'bg-pink-50',   text: 'text-pink-700',   dot: 'bg-pink-400' },
  'Amigurumis General': { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  'Personajes':         { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
  'Mascotas':           { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  'Otras':              { bg: 'bg-slate-50',  text: 'text-slate-600',  dot: 'bg-slate-400' },
};

function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_COLORS[cat] ?? { bg: 'bg-peony/30', text: 'text-evergreen', dot: 'bg-mauve' };
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────
interface ConfirmDeleteModalProps {
  item: PriceItem;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteModal({
  item,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-evergreen/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-red-100 text-center relative transform transition-all animate-scaleUp">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Trash2 size={26} className="animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-evergreen mb-1">
          ¿Eliminar precio de la lista?
        </h3>
        
        <p className="text-xs text-text-muted mb-4">
          Esta acción eliminará el producto permanentemente de la base de datos.
        </p>

        {/* Item Preview Card */}
        <div className="bg-surface-container/60 rounded-2xl p-3.5 mb-5 border border-[#eedddb]/60 text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-bold text-evergreen truncate">
              {item.name}
            </span>
            <span className="text-xs font-bold text-mauve whitespace-nowrap">
              {item.maxPrice > item.minPrice
                ? `${formatARS(item.minPrice)} - ${formatARS(item.maxPrice)}`
                : formatARS(item.minPrice)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
            Categoría: <span className="font-semibold text-evergreen">{item.category}</span>
          </span>
          {item.notes && (
            <p className="text-[11px] text-text-muted italic mt-1 line-clamp-1">
              {item.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="btn-secondary text-xs py-2.5 px-4 flex-1 justify-center disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-200 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Sí, eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Confirmation Modal ──────────────────────────────────────────────
interface ConfirmResetModalProps {
  isOpen: boolean;
  isResetting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmResetModal({
  isOpen,
  isResetting,
  onConfirm,
  onCancel,
}: ConfirmResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-evergreen/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#eedddb] text-center relative transform transition-all">
        <div className="w-14 h-14 rounded-2xl bg-peony/50 border border-mauve/20 text-mauve flex items-center justify-center mx-auto mb-4 shadow-sm">
          <RotateCcw size={26} />
        </div>

        <h3 className="text-lg font-bold text-evergreen mb-1">
          ¿Restablecer precios por defecto?
        </h3>
        
        <p className="text-xs text-text-muted mb-5 leading-relaxed">
          Esto reemplazará los precios actuales en la base de datos por los <strong>11 productos y rangos predeterminados</strong> de EntreHilos.
        </p>

        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={isResetting}
            onClick={onCancel}
            className="btn-secondary text-xs py-2.5 px-4 flex-1 justify-center disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={onConfirm}
            className="btn-primary text-xs py-2.5 px-4 flex-1 justify-center disabled:opacity-60"
          >
            {isResetting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Restableciendo...</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                <span>Restablecer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PriceItemModal ─────────────────────────────────────────────────────────
interface ModalProps {
  item: Partial<PriceItem> | null;
  isLoading: boolean;
  onSave: (data: CreatePriceItemDTO | UpdatePriceItemDTO) => void;
  onRequestDelete?: () => void;
  onClose: () => void;
}

function PriceItemModal({ item, isLoading, onSave, onRequestDelete, onClose }: ModalProps) {
  const isEdit = Boolean(item?.id);

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? 'Llaveros');
  const [minPrice, setMinPrice] = useState(item?.minPrice != null ? String(item.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(item?.maxPrice != null ? String(item.maxPrice) : '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Ingresá el nombre del producto'); return; }
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (isNaN(min) || min <= 0) { setError('Ingresá un precio mínimo válido'); return; }
    if (isNaN(max) || max <= 0) { setError('Ingresá un precio máximo válido'); return; }
    if (max < min) { setError('El precio máximo debe ser mayor o igual al mínimo'); return; }

    onSave({
      name: name.trim(),
      category: category.trim() || 'Otras',
      minPrice: min,
      maxPrice: max,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-evergreen/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#eedddb]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#eedddb]/60">
          <h3 className="text-base font-bold text-evergreen flex items-center gap-2">
            <Tag size={18} className="text-mauve" />
            {isEdit ? 'Editar Precio' : 'Nuevo Precio'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-evergreen hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label-craft">Nombre del producto *</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Ej. Amigurumi Pikachu, Llavero gatito..."
              className="input-craft w-full"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="label-craft">Categoría</label>
            <input
              type="text"
              list="price-categories-list"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Llaveros, Flores, Amigurumis..."
              className="input-craft w-full"
            />
            <datalist id="price-categories-list">
              {PRODUCT_CATEGORIES.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Price range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-craft">Precio mínimo (ARS) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); setError(''); }}
                  placeholder="0"
                  className="input-craft pl-7 w-full font-semibold text-evergreen"
                />
              </div>
            </div>
            <div>
              <label className="label-craft">Precio máximo (ARS) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); setError(''); }}
                  placeholder="0"
                  className="input-craft pl-7 w-full font-semibold text-evergreen"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label-craft">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. Incluye personalización, depende del tamaño..."
              rows={2}
              className="input-craft w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#eedddb]/60 flex items-center justify-between gap-3">
            {isEdit && onRequestDelete ? (
              <button
                type="button"
                onClick={onRequestDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-xs py-2 px-5 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>{isEdit ? 'Guardar cambios' : 'Crear precio'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sort Icon helper ───────────────────────────────────────────────────────
type SortField = 'name' | 'minPrice' | 'category';

function SortIcon({ field, sortField, sortAsc }: { field: SortField; sortField: SortField; sortAsc: boolean }) {
  if (sortField !== field) return <ChevronDown size={12} className="text-text-muted opacity-40" />;
  return sortAsc
    ? <ChevronUp size={12} className="text-mauve" />
    : <ChevronDown size={12} className="text-mauve" />;
}

// ── Main Page ─────────────────────────────────────────────────────────────
export function PriceListPage() {
  const queryClient = useQueryClient();

  // Queries & Mutations
  const {
    data: prices = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['price-list'],
    queryFn: () => priceListApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePriceItemDTO) => priceListApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-list'] });
      closeModal();
      showToast('Precio creado y guardado en la base de datos');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Error al crear el precio', true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePriceItemDTO }) =>
      priceListApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-list'] });
      closeModal();
      showToast('Precio actualizado en la base de datos');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Error al actualizar el precio', true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priceListApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-list'] });
      setDeleteModalItem(null);
      closeModal();
      showToast('Precio eliminado correctamente');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Error al eliminar el precio', true);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => priceListApi.resetDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-list'] });
      setIsResetModalOpen(false);
      showToast('Lista de precios restablecida a valores por defecto');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Error al restablecer precios', true);
    },
  });

  // Local UI State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [sortField, setSortField] = useState<SortField>('category');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Modals state
  const [modalItem, setModalItem] = useState<Partial<PriceItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Delete Modal State
  const [deleteModalItem, setDeleteModalItem] = useState<PriceItem | null>(null);

  // Custom Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  function showToast(msg: string, isErr = false) {
    setToastMessage(msg);
    setToastIsError(isErr);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // All categories derived from data
  const allCategories = useMemo(() => {
    const cats = new Set<string>([...PRODUCT_CATEGORIES, ...prices.map(p => p.category)]);
    return ['TODAS', ...Array.from(cats).sort()];
  }, [prices]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    return prices
      .filter(p => {
        const matchCat =
          selectedCategory === 'TODAS' || p.category === selectedCategory;
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'es');
        else if (sortField === 'minPrice') cmp = a.minPrice - b.minPrice;
        else cmp = a.category.localeCompare(b.category, 'es');
        return sortAsc ? cmp : -cmp;
      });
  }, [prices, search, selectedCategory, sortField, sortAsc]);

  // Grouped by category (for list view)
  const grouped = useMemo(() => {
    const map = new Map<string, PriceItem[]>();
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [filtered]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(s => !s);
    else { setSortField(field); setSortAsc(true); }
  }

  function openCreate() {
    setModalItem({});
    setIsModalOpen(true);
  }

  function openEdit(item: PriceItem) {
    setModalItem(item);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalItem(null);
  }

  function handleSave(data: CreatePriceItemDTO | UpdatePriceItemDTO) {
    if (modalItem?.id) {
      updateMutation.mutate({ id: modalItem.id, dto: data });
    } else {
      createMutation.mutate(data as CreatePriceItemDTO);
    }
  }

  function handleRequestDeleteFromModal() {
    if (modalItem && modalItem.id) {
      setDeleteModalItem(modalItem as PriceItem);
    }
  }

  function handleConfirmDelete() {
    if (deleteModalItem) {
      deleteMutation.mutate(deleteModalItem.id);
    }
  }

  function handleExport() {
    const lines = ['Producto,Categoría,"Precio Mínimo","Precio Máximo",Notas'];
    for (const p of filtered) {
      lines.push(`"${p.name}","${p.category}","${p.minPrice}","${p.maxPrice}","${p.notes || ''}"`);
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-precios-entrehilos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleCategory(cat: string) {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const minOfAll = prices.length > 0 ? Math.min(...prices.map(p => p.minPrice)) : 0;
  const maxOfAll = prices.length > 0 ? Math.max(...prices.map(p => p.maxPrice)) : 0;

  return (
    <div className="py-8 page-enter relative">
      {/* ── Toast Feedback Notification ── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-fadeIn ${
            toastIsError
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-evergreen text-white border-evergreen/20'
          }`}
        >
          {toastIsError ? (
            <AlertTriangle size={16} className="text-red-600" />
          ) : (
            <Check size={16} className="text-sage" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Gestión · Precios de Referencia
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-peony/50 text-[10px] font-bold text-evergreen border border-[#eedddb]">
              <Database size={10} className="text-mauve" />
              Base de Datos
            </span>
          </div>
          <h1 className="section-title flex items-center gap-3">
            <Tag size={26} className="text-mauve" />
            Lista de Precios
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Consultá y gestioná los precios de tus productos con rangos mín–máx sincronizados en la nube.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => refetch()}
          title="Recargar datos de la base de datos"
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#eedddb] bg-white text-xs font-semibold text-text-muted hover:text-evergreen hover:border-mauve/40 transition-colors shadow-sm"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin text-mauve' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* ── Loading Skeleton / State ── */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-craft p-6 text-center animate-pulse bg-surface-container/40">
                <div className="h-6 w-16 bg-[#eedddb]/60 rounded-md mx-auto mb-2" />
                <div className="h-3 w-24 bg-[#eedddb]/40 rounded-md mx-auto" />
              </div>
            ))}
          </div>
          <div className="card-craft p-12 text-center">
            <Loader2 size={32} className="animate-spin text-mauve mx-auto mb-3" />
            <p className="text-sm font-bold text-evergreen">Cargando lista de precios desde la base de datos...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="card-craft p-8 text-center border-red-200 bg-red-50/40">
          <AlertTriangle size={36} className="mx-auto mb-3 text-red-600" />
          <p className="text-base font-bold text-red-800">Error al conectar con la base de datos</p>
          <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'No se pudo cargar la lista de precios.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-primary mt-4 text-xs py-2 px-5"
          >
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* ── Controls Bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto o categoría..."
                className="input-craft pl-9 text-sm w-full py-2.5"
                id="price-list-search"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-evergreen"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View mode toggle */}
              <div className="flex items-center rounded-xl border border-[#eedddb] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Vista en grilla"
                  aria-label="Vista en grilla"
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-peony text-evergreen'
                      : 'bg-white text-text-muted hover:bg-surface-container'
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Vista por categoría"
                  aria-label="Vista por categoría"
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-peony text-evergreen'
                      : 'bg-white text-text-muted hover:bg-surface-container'
                  }`}
                >
                  <ListOrdered size={15} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleExport}
                title="Exportar como CSV"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#eedddb] bg-white text-text-muted hover:text-evergreen hover:border-mauve/40 text-xs font-semibold transition-colors shadow-sm"
                id="btn-exportar-precios"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="btn-primary text-xs px-4 py-2.5 gap-1.5 shadow-sm"
                id="btn-nuevo-precio"
              >
                <Plus size={15} />
                <span>Nuevo Precio</span>
              </button>
            </div>
          </div>

          {/* ── Category pills ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
            {allCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-mauve text-white shadow-sm'
                    : 'bg-white text-text-muted border border-[#eedddb] hover:border-mauve hover:text-evergreen'
                }`}
              >
                {cat}
                {cat !== 'TODAS' && (
                  <span className="ml-1.5 opacity-70 font-normal">
                    ({prices.filter(p => p.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-craft p-4 text-center">
              <p className="text-2xl font-black text-evergreen">{prices.length}</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Productos en BD</p>
            </div>
            <div className="card-craft p-4 text-center">
              <p className="text-xl font-black text-mauve">{formatARS(minOfAll)}</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Precio más bajo</p>
            </div>
            <div className="card-craft p-4 text-center">
              <p className="text-xl font-black text-sage">{formatARS(maxOfAll)}</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Precio más alto</p>
            </div>
          </div>

          {/* ── Content ── */}
          {filtered.length === 0 ? (
            <div className="card-craft p-12 text-center">
              <Tag size={36} className="mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-base font-bold text-evergreen">Sin resultados</p>
              <p className="text-sm text-text-muted mt-1">
                {search
                  ? 'Probá con otro término de búsqueda.'
                  : 'Agregá tu primer precio con el botón "Nuevo Precio".'}
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary mt-4 text-xs py-2 px-5"
              >
                <Plus size={14} /> Agregar precio
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <>
              {/* Sort controls */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-text-muted font-semibold">Ordenar por:</span>
                {(['category', 'name', 'minPrice'] as const).map(f => {
                  const labels: Record<SortField, string> = {
                    category: 'Categoría',
                    name: 'Nombre',
                    minPrice: 'Precio',
                  };
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleSort(f)}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors cursor-pointer ${
                        sortField === f
                          ? 'border-mauve bg-peony/40 text-evergreen'
                          : 'border-[#eedddb] bg-white text-text-muted hover:border-mauve/50'
                      }`}
                    >
                      {labels[f]}
                      <SortIcon field={f} sortField={sortField} sortAsc={sortAsc} />
                    </button>
                  );
                })}
                <span className="ml-auto text-xs text-text-muted">
                  {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(item => {
                  const style = getCategoryStyle(item.category);
                  const isRange = item.maxPrice > item.minPrice;
                  return (
                    <div
                      key={item.id}
                      onClick={() => openEdit(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') openEdit(item);
                      }}
                      className="group relative card-craft p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                      id={`price-item-${item.id}`}
                    >
                      <div>
                        {/* Top row with category and delete shortcut */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                            {item.category}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteModalItem(item);
                              }}
                              title="Eliminar producto"
                              className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                            <span className="p-1 text-text-muted group-hover:text-mauve">
                              <Pencil size={13} />
                            </span>
                          </div>
                        </div>

                        {/* Name */}
                        <p className="text-sm font-bold text-evergreen leading-snug line-clamp-2 mb-3 group-hover:text-mauve transition-colors">
                          {item.name}
                        </p>
                      </div>

                      <div>
                        {/* Price */}
                        <div className="pt-2.5 border-t border-[#eedddb]/50">
                          {isRange ? (
                            <div>
                              <p className="text-[10px] text-text-muted font-semibold mb-0.5">Rango de precio</p>
                              <p className="text-sm font-extrabold text-mauve leading-tight">
                                {formatARS(item.minPrice)}
                                <span className="text-xs text-text-muted font-normal mx-1">—</span>
                                {formatARS(item.maxPrice)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[10px] text-text-muted font-semibold mb-0.5">Precio fijo</p>
                              <p className="text-base font-extrabold text-mauve">{formatARS(item.minPrice)}</p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <p className="mt-2 text-[11px] text-text-muted leading-snug line-clamp-2 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* ── List View (grouped by category) ── */
            <div className="flex flex-col gap-3">
              {Array.from(grouped.entries()).map(([cat, items]) => {
                const style = getCategoryStyle(cat);
                const isCollapsed = collapsedCategories.has(cat);
                return (
                  <div key={cat} className="card-craft overflow-hidden">
                    {/* Category header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-container/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          {cat}
                        </span>
                        <span className="text-xs text-text-muted font-semibold">
                          {items.length} {items.length === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown size={16} className="text-text-muted" />
                      ) : (
                        <ChevronUp size={16} className="text-text-muted" />
                      )}
                    </button>

                    {/* Items table */}
                    {!isCollapsed && (
                      <div className="border-t border-[#eedddb]/60">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-surface-container/50 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          <div className="col-span-5">Producto</div>
                          <div className="col-span-3 text-right">Precio mín.</div>
                          <div className="col-span-3 text-right">Precio máx.</div>
                          <div className="col-span-1 text-right">Acciones</div>
                        </div>

                        {items.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`grid grid-cols-12 gap-2 items-center px-5 py-3 group hover:bg-peony/15 transition-colors cursor-pointer ${
                              idx < items.length - 1 ? 'border-b border-[#eedddb]/40' : ''
                            }`}
                            onClick={() => openEdit(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') openEdit(item);
                            }}
                          >
                            <div className="col-span-5">
                              <p className="text-sm font-semibold text-evergreen truncate group-hover:text-mauve transition-colors">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-[11px] text-text-muted italic truncate">{item.notes}</p>
                              )}
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="text-sm font-bold text-evergreen">{formatARS(item.minPrice)}</span>
                            </div>
                            <div className="col-span-3 text-right">
                              <span
                                className={`text-sm font-bold ${
                                  item.maxPrice > item.minPrice ? 'text-mauve' : 'text-text-muted'
                                }`}
                              >
                                {item.maxPrice > item.minPrice ? formatARS(item.maxPrice) : '—'}
                              </span>
                            </div>
                            <div className="col-span-1 flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeleteModalItem(item);
                                }}
                                title="Eliminar precio"
                                className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={13} />
                              </button>
                              <Pencil
                                size={13}
                                className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted pt-4 border-t border-[#eedddb]/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="flex items-center gap-1.5 font-medium">
                <Database size={13} className="text-evergreen/70" />
                Precios sincronizados con la base de datos PostgreSQL
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-container/80 text-text-muted hover:text-mauve transition-colors font-medium cursor-pointer"
              id="btn-restablecer-precios"
            >
              <RotateCcw size={13} />
              Restablecer valores por defecto
            </button>
          </div>
        </>
      )}

      {/* ── Item Edit / Create Modal ── */}
      {isModalOpen && (
        <PriceItemModal
          item={modalItem}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onSave={handleSave}
          onRequestDelete={handleRequestDeleteFromModal}
          onClose={closeModal}
        />
      )}

      {/* ── Custom Delete Confirmation Modal ── */}
      {deleteModalItem && (
        <ConfirmDeleteModal
          item={deleteModalItem}
          isOpen={Boolean(deleteModalItem)}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModalItem(null)}
        />
      )}

      {/* ── Custom Reset Confirmation Modal ── */}
      {isResetModalOpen && (
        <ConfirmResetModal
          isOpen={isResetModalOpen}
          isResetting={resetMutation.isPending}
          onConfirm={() => resetMutation.mutate()}
          onCancel={() => setIsResetModalOpen(false)}
        />
      )}
    </div>
  );
}
