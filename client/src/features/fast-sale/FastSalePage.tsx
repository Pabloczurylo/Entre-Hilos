import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Tag,
  RotateCcw,
} from 'lucide-react';

import { PRODUCT_CATEGORIES } from '../../shared/types';
import { fastSaleApi } from './services/fastSaleApi';

export interface StockProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

const DEFAULT_PRODUCTS: StockProduct[] = [
  { id: 'p1', name: 'Llavero básico',        price: 800,  category: 'Llaveros' },
  { id: 'p2', name: 'Llavero personalizado',  price: 1200, category: 'Llaveros' },
  { id: 'p3', name: 'Flor tejida',           price: 600,  category: 'Flores'   },
  { id: 'p4', name: 'Ramo x5',              price: 2500, category: 'Flores'   },
  { id: 'p5', name: 'Mini amigurumi',        price: 1800, category: 'Amigurumis General' },
  { id: 'p6', name: 'Pikachu amigurumi',     price: 3200, category: 'Personajes' },
  { id: 'p7', name: 'Perrito llavero',       price: 1500, category: 'Mascotas' },
  { id: 'p8', name: 'Set postal x3',        price: 900,  category: 'Otras' },
];

const STORAGE_KEY = 'entrehilos_stock_products';

function loadInitialProducts(): StockProduct[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stock from localStorage', e);
  }
  return DEFAULT_PRODUCTS;
}

function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function FastSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Stock state
  const [products, setProducts] = useState<StockProduct[]>(loadInitialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Cart & checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');
  const [success, setSuccess] = useState(false);

  // Quick custom one-time item
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [saveCustomToStock, setSaveCustomToStock] = useState(false);

  // Modal for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalPrice, setModalPrice] = useState('');
  const [modalCategory, setModalCategory] = useState('');
  const [modalError, setModalError] = useState('');

  // Persist stock products changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving stock to localStorage', e);
    }
  }, [products]);

  // Derived categories: Standard categories plus any additional custom ones
  const categories = ['TODAS', ...Array.from(new Set([...PRODUCT_CATEGORIES, ...products.map(p => p.category.trim()).filter(Boolean)]))];

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'TODAS' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Modal helpers
  function openCreateModal() {
    setEditingProduct(null);
    setModalName('');
    setModalPrice('');
    setModalCategory(selectedCategory !== 'TODAS' ? selectedCategory : 'Llaveros');
    setModalError('');
    setIsModalOpen(true);
  }

  function openEditModal(product: StockProduct, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setModalName(product.name);
    setModalPrice(String(product.price));
    setModalCategory(product.category);
    setModalError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setModalError('');
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!modalName.trim()) {
      setModalError('Ingresá el nombre del producto');
      return;
    }
    const priceNum = parseFloat(modalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('Ingresá un precio válido mayor a 0');
      return;
    }
    const categoryTrim = modalCategory.trim() || 'Llaveros';

    if (editingProduct) {
      // Update existing
      setProducts(prev => prev.map(p => {
        if (p.id === editingProduct.id) {
          return { ...p, name: modalName.trim(), price: priceNum, category: categoryTrim };
        }
        return p;
      }));

      // Also update any matching item currently in cart with new price/name
      setCart(prev => prev.map(c => {
        if (c.id === editingProduct.id) {
          return { ...c, name: modalName.trim(), price: priceNum };
        }
        return c;
      }));
    } else {
      // Add new
      const newProduct: StockProduct = {
        id: 'p-' + Date.now(),
        name: modalName.trim(),
        price: priceNum,
        category: categoryTrim,
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    closeModal();
  }

  function handleDeleteProduct(productId: string) {
    if (!window.confirm('¿Estás seguro de eliminar este producto del stock?')) return;
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(c => c.id !== productId));
    closeModal();
  }

  function handleResetDefaults() {
    if (window.confirm('¿Restablecer el stock a los productos iniciales por defecto?')) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
  }

  // Cart operations
  function addToCart(product: StockProduct) {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id);
      if (ex) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function addCustom() {
    if (!customName.trim() || !customPrice) return;
    const priceNum = parseFloat(customPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const id = 'custom-' + Date.now();
    const item: CartItem = { id, name: customName.trim(), price: priceNum, qty: 1 };
    setCart(prev => [...prev, item]);

    if (saveCustomToStock) {
      const newProd: StockProduct = {
        id,
        name: customName.trim(),
        price: priceNum,
        category: 'Otras',
      };
      setProducts(prev => [newProd, ...prev]);
    }

    setCustomName('');
    setCustomPrice('');
    setSaveCustomToStock(false);
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => prev
      .map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
      .filter(c => c.qty > 0)
    );
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const [selling, setSelling] = useState(false);
  const [sellError, setSellError] = useState('');

  async function handleSell() {
    if (!cart.length || selling) return;
    setSelling(true);
    setSellError('');

    try {
      const desc = cart.map(c => `${c.name} x${c.qty}`).join(', ');
      await fastSaleApi.create({
        description: desc,
        amount: total,
        paymentMethod: method,
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['finances-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finances-transactions'] });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCart([]);
        navigate('/finanzas');
      }, 1500);
    } catch (err: any) {
      setSellError(err.message || 'Error al registrar la venta rápida');
    } finally {
      setSelling(false);
    }
  }

  return (
    <div className="py-8 page-enter">
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Punto de Venta · Modo Feria
        </p>
        <h1 className="section-title flex items-center gap-3">
          <ShoppingBag size={26} className="text-mauve" />
          Venta Rápida
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Registrá ventas de stock en ferias y gestioná los precios y productos de tu catálogo
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-evergreen/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl border border-peony">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
              <Check size={32} className="text-sage" />
            </div>
            <p className="text-lg font-bold text-evergreen">¡Venta registrada con éxito!</p>
            <p className="text-sm text-text-muted">{formatARS(total)} · {method}</p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left column: Stock management & product catalog */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Stock catalog card */}
          <div className="card-craft p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-evergreen flex items-center gap-2">
                  <span>Productos en Stock</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-peony text-evergreen">
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Hacé clic para sumar al carrito o en el lápiz para editar el precio
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5 shadow-sm"
                  title="Agregar nuevo producto al stock"
                >
                  <Plus size={15} />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar producto por nombre o categoría..."
                  className="input-craft pl-9 text-xs py-2 w-full"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-evergreen"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-mauve text-white shadow-sm'
                        : 'bg-[#faf9f7] text-text-muted border border-[#eedddb] hover:border-mauve hover:text-evergreen'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#eedddb] rounded-xl bg-surface/50">
                <Tag size={28} className="mx-auto mb-2 text-text-muted opacity-40" />
                <p className="text-sm font-semibold text-evergreen">No se encontraron productos</p>
                <p className="text-xs text-text-muted mt-1">
                  {search ? 'Probá con otra búsqueda o ' : ''}
                  creá un nuevo producto para añadirlo al stock
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-mauve hover:underline"
                >
                  <Plus size={14} /> Crear producto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map(p => {
                  const cartItem = cart.find(c => c.id === p.id);
                  const inCartQty = cartItem ? cartItem.qty : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') addToCart(p); }}
                      className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left select-none flex flex-col justify-between ${
                        inCartQty > 0
                          ? 'border-mauve bg-peony/25 shadow-sm'
                          : 'border-[#eedddb] bg-white hover:border-mauve hover:bg-peony/15 hover:shadow-sm'
                      } active:scale-[0.98]`}
                    >
                      {/* Top row: Category tag & Quick edit button */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[11px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-md border border-[#eedddb]/60 truncate max-w-[90px]">
                          {p.category}
                        </span>

                        <div className="flex items-center gap-1">
                          {inCartQty > 0 && (
                            <span className="text-[11px] font-bold bg-mauve text-white px-1.5 py-0.5 rounded-full shadow-xs">
                              x{inCartQty}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => openEditModal(p, e)}
                            title="Modificar precio o producto"
                            className="p-1 rounded-md text-text-muted hover:text-evergreen hover:bg-peony/60 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <p className="text-sm font-bold text-evergreen leading-snug line-clamp-2 my-1">
                        {p.name}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#eedddb]/40">
                        <span className="text-base font-extrabold text-mauve">
                          {formatARS(p.price)}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          + Agregar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer actions for stock */}
            <div className="mt-4 pt-3 border-t border-[#eedddb]/60 flex items-center justify-between text-xs text-text-muted">
              <span>Los precios modificados se guardan automáticamente.</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="hover:text-mauve flex items-center gap-1 transition-colors text-[11px]"
                title="Restablecer productos iniciales"
              >
                <RotateCcw size={12} />
                <span>Restablecer iniciales</span>
              </button>
            </div>
          </div>

          {/* Quick custom product card */}
          <div className="card-craft p-5">
            <h2 className="text-sm font-bold text-evergreen mb-1">Producto Rápido / Personalizado</h2>
            <p className="text-xs text-text-muted mb-3">
              Para cobrar un producto único en el momento o agregar directo al carrito
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Ej. Pulsera personalizada, llavero especial..."
                className="input-craft flex-1 text-sm"
              />
              <div className="relative w-full sm:w-36 flex-shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                  placeholder="0"
                  className="input-craft pl-7 text-sm w-full font-semibold text-evergreen"
                />
              </div>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim() || !customPrice}
                className="btn-primary px-4 py-2.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                + Al Carrito
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveToStockCheck"
                checked={saveCustomToStock}
                onChange={e => setSaveCustomToStock(e.target.checked)}
                className="rounded border-[#eedddb] text-mauve focus:ring-mauve w-3.5 h-3.5"
              />
              <label htmlFor="saveToStockCheck" className="text-xs text-text-muted cursor-pointer select-none">
                Guardar también este producto en el catálogo permanente de stock
              </label>
            </div>
          </div>
        </div>

        {/* Right column: Cart & Checkout */}
        <div className="xl:col-span-2 xl:sticky xl:top-24 h-fit">
          <div className="card-craft p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-evergreen flex items-center gap-2">
                <span>Carrito</span>
                {cart.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-mauve text-white font-bold">
                    {cart.reduce((s, c) => s + c.qty, 0)} ítems
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-text-muted hover:text-destructive transition-colors"
                >
                  Vaciar
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10 text-sm text-text-muted border border-dashed border-[#eedddb] rounded-xl bg-surface/40 mb-4">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30 text-evergreen" />
                <p className="font-semibold text-evergreen">Tu carrito está vacío</p>
                <p className="text-xs text-text-muted mt-1">Seleccioná productos del stock para agregarlos</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#eedddb]/60 mb-5 max-h-[340px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-evergreen truncate">{item.name}</p>
                      <p className="text-xs text-text-muted font-medium">{formatARS(item.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface px-1.5 py-1 rounded-lg border border-[#eedddb]/80">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, -1)}
                        className="w-5 h-5 rounded-full bg-white border border-[#eedddb] flex items-center justify-center text-text-muted hover:border-mauve hover:text-mauve text-xs font-bold transition-colors"
                      >−</button>
                      <span className="w-5 text-center text-xs font-bold text-evergreen">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, 1)}
                        className="w-5 h-5 rounded-full bg-white border border-[#eedddb] flex items-center justify-center text-text-muted hover:border-mauve hover:text-mauve text-xs font-bold transition-colors"
                      >+</button>
                    </div>
                    <span className="text-sm font-extrabold text-evergreen w-20 text-right flex-shrink-0">
                      {formatARS(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="p-4 bg-peony/35 border border-peony rounded-xl flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-evergreen">Total a cobrar</span>
              <span className="text-2xl font-black text-evergreen">{formatARS(total)}</span>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="label-craft mb-2">Método de pago</label>
              <div className="grid grid-cols-2 gap-2">
                {(['EFECTIVO', 'TRANSFERENCIA'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                      method === m
                        ? 'border-mauve bg-peony text-evergreen shadow-sm'
                        : 'border-[#eedddb] bg-white text-text-muted hover:border-mauve/50'
                    }`}
                  >
                    <span>{m === 'EFECTIVO' ? '💵' : '💳'}</span>
                    <span>{m === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</span>
                  </button>
                ))}
              </div>
            </div>

            {sellError && (
              <p className="text-xs text-red-500 mb-3 text-center">{sellError}</p>
            )}

            <button
              type="button"
              onClick={handleSell}
              disabled={cart.length === 0 || selling}
              className="btn-primary w-full justify-center py-3 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              id="btn-confirmar-venta"
            >
              {selling ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Registrando...
                </span>
              ) : (
                <>
                  <Check size={18} />
                  Confirmar Venta · {formatARS(total)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal for Add / Edit Stock Product ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-evergreen/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-peony">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#eedddb]/60">
              <h3 className="text-base font-bold text-evergreen flex items-center gap-2">
                <Tag size={18} className="text-mauve" />
                {editingProduct ? 'Modificar Producto de Stock' : 'Nuevo Producto en Stock'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-text-muted hover:text-evergreen hover:bg-surface"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="label-craft">Nombre del producto *</label>
                <input
                  type="text"
                  value={modalName}
                  onChange={e => setModalName(e.target.value)}
                  placeholder="Ej. Girasol tejido, Llavero Palta..."
                  className="input-craft w-full text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-craft">Precio (ARS) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                    <input
                      type="number"
                      value={modalPrice}
                      onChange={e => setModalPrice(e.target.value)}
                      placeholder="0"
                      className="input-craft pl-7 w-full text-sm font-bold text-evergreen"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-craft">Categoría</label>
                  <input
                    type="text"
                    list="categories-list"
                    value={modalCategory}
                    onChange={e => setModalCategory(e.target.value)}
                    placeholder="Llaveros, Flores..."
                    className="input-craft w-full text-sm"
                  />
                  <datalist id="categories-list">
                    {PRODUCT_CATEGORIES.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[#eedddb]/60 flex items-center justify-between gap-3">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id)}
                    className="btn-destructive text-xs py-2 px-3 flex items-center gap-1.5"
                    title="Eliminar producto del stock"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-outline text-xs py-2 px-3"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs py-2 px-4 font-bold"
                  >
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
