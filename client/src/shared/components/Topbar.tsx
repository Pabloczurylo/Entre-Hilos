import { Menu, Plus, PanelLeftOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import logoImg from '../../assets/logo.jpg';

interface TopbarProps {
  onMenuClick: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

export function Topbar({ onMenuClick, isDesktopCollapsed, onToggleDesktop }: TopbarProps) {
  const now = new Date();
  const formatted = now.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-[#eedddb]/50 z-40 px-4 lg:px-8 flex items-center justify-between gap-4 transition-[left] duration-300 ease-in-out',
        isDesktopCollapsed ? 'left-0' : 'left-0 lg:left-64'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Left: hamburger (mobile) */}
        <button
          type="button"
          className="lg:hidden p-2 text-text-muted hover:text-evergreen rounded-lg hover:bg-surface-container transition-colors"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Desktop expand button + brand (Gemini style) */}
        {isDesktopCollapsed && (
          <div className="hidden lg:flex items-center gap-3 animate-fade-slide-in">
            <button
              type="button"
              onClick={onToggleDesktop}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-text-muted hover:text-evergreen hover:bg-surface-container border border-transparent hover:border-[#eedddb]/60 transition-all duration-200 group"
              title="Mostrar menú lateral"
              aria-label="Mostrar menú lateral"
            >
              <PanelLeftOpen size={20} className="transition-transform group-hover:scale-110 text-evergreen/80" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-surface-container-low hover:bg-peony/30 rounded-full border border-[#eedddb]/50 shadow-xs transition-all duration-200 cursor-pointer"
              title="Ir a Inicio"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={logoImg} alt="Entre Hilos" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-evergreen tracking-tight">Entre Hilos</span>
            </Link>
          </div>
        )}
      </div>

      {/* Right: date + actions */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="hidden md:block text-xs text-text-muted capitalize">{formatted}</span>
        <div className="w-px h-4 bg-[#eedddb] hidden md:block" />

        <Link
          to="/pedidos/nuevo"
          className="btn-primary text-xs px-4 py-2 gap-1.5"
          aria-label="Crear nuevo pedido"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Nuevo Pedido</span>
        </Link>
      </div>
    </header>
  );
}
