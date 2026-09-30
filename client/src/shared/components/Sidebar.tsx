import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  ReceiptText,
  Calculator,
  Wallet,
  Hash,
  ShoppingBag,
  Tag,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import logoImg from '../../assets/logo.jpg';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/pedidos', label: 'Pedidos', icon: ReceiptText },
  { to: '/cotizador', label: 'Cotizador', icon: Calculator },
  { to: '/lista-precios', label: 'Lista de Precios', icon: Tag },
  { to: '/finanzas', label: 'Finanzas', icon: Wallet },
  { to: '/venta-rapida', label: 'Venta Rápida', icon: ShoppingBag },
  { to: '/contador', label: 'Contador', icon: Hash },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

export function Sidebar({ isOpen, onClose, isDesktopCollapsed, onToggleDesktop }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-evergreen/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between pt-6 pb-6 transition-transform duration-300 ease-in-out',
          'shadow-[0_1px_8px_rgba(52,76,61,0.04)] border-r border-[#eedddb]/50',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isDesktopCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col">
          {/* Brand & Collapse Header */}
          <div className="px-5 mb-8 flex items-center justify-between">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group transition-transform duration-200 active:scale-98"
              title="Ir al Dashboard"
            >
              <div className="w-9 h-9 rounded-full bg-peony flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                <img src={logoImg} alt="Logo Entre Hilos" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-bold text-evergreen tracking-tight group-hover:text-mauve transition-colors">Entre Hilos</span>
            </Link>

            {/* Desktop collapse button */}
            {onToggleDesktop && (
              <button
                type="button"
                onClick={onToggleDesktop}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-evergreen hover:bg-surface-container transition-all duration-200"
                title="Ocultar menú lateral"
                aria-label="Ocultar menú lateral"
              >
                <PanelLeftClose size={18} />
              </button>
            )}

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-evergreen hover:bg-surface-container transition-all"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section label */}
          <div className="px-6 mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Gestión Principal
            </span>
          </div>

          {/* Navigation */}
          <nav className="px-4 flex flex-col gap-1" aria-label="Menú principal">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn('nav-item', isActive && 'active')
                }
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Profile footer */}
        <div className="px-4">
          <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mauve/30 flex items-center justify-center text-sm font-bold text-evergreen flex-shrink-0">
              G
            </div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-sm font-semibold text-evergreen truncate">Guada</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
