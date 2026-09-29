import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutGrid,
  ReceiptText,
  Wallet,
  Calculator,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4 page-enter flex flex-col items-center justify-center min-h-[75vh]">
      <div className="card-craft max-w-xl w-full p-8 md:p-10 text-center flex flex-col items-center relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-peony/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary-container/40 rounded-full blur-2xl pointer-events-none" />

        {/* ── Custom Animated Yarn / Crochet Illustration ── */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-peony/50 flex items-center justify-center shadow-inner border border-mauve/30 transition-transform duration-300 hover:scale-105">
            <svg
              className="w-16 h-16 text-evergreen animate-pulse"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ball of yarn SVG */}
              <circle cx="32" cy="32" r="24" fill="#f2d1d4" stroke="#344c3d" strokeWidth="2.5" />
              {/* Yarn threads */}
              <path
                d="M16 24C22 18 36 18 44 26"
                stroke="#d8959b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M12 34C20 28 42 28 50 36"
                stroke="#344c3d"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M18 42C26 36 38 38 46 44"
                stroke="#829672"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M26 12C32 20 34 38 28 52"
                stroke="#d8959b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M38 14C42 22 42 40 36 50"
                stroke="#344c3d"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Loose thread hanging */}
              <path
                d="M50 38C58 44 60 52 52 58C46 62 40 56 46 52"
                stroke="#d8959b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-evergreen text-white shadow-md">
            404
          </span>
        </div>

        {/* ── Badge & Titles ── */}
        <span className="badge badge-pendiente mb-3 flex items-center gap-1">
          <Sparkles size={12} className="text-evergreen" />
          Puntada perdida
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-evergreen tracking-tight mb-2">
          ¡Se nos enredó el ovillo!
        </h1>

        <p className="text-sm text-text-muted leading-relaxed max-w-md mb-8">
          La página o encargo que estás buscando no existe, cambió de lugar o se escapó del telar.
          ¡Volvamos a tejer el camino correcto!
        </p>

        {/* ── Primary Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-6">
          <Link to="/" className="btn-primary w-full sm:w-auto justify-center text-sm py-2.5 px-6">
            <LayoutGrid size={16} />
            Volver al Dashboard
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary w-full sm:w-auto justify-center text-sm py-2.5 px-6"
          >
            <ArrowLeft size={16} />
            Página anterior
          </button>
        </div>

        {/* ── Quick Links ── */}
        <div className="w-full pt-6 border-t border-[#eedddb]/60">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Otras secciones del taller
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              to="/pedidos"
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-peony/30 transition-colors flex flex-col items-center gap-1 text-xs font-semibold text-evergreen"
            >
              <ReceiptText size={16} className="text-mauve" />
              <span>Pedidos</span>
            </Link>
            <Link
              to="/cotizador"
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-peony/30 transition-colors flex flex-col items-center gap-1 text-xs font-semibold text-evergreen"
            >
              <Calculator size={16} className="text-mauve" />
              <span>Cotizador</span>
            </Link>
            <Link
              to="/finanzas"
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-peony/30 transition-colors flex flex-col items-center gap-1 text-xs font-semibold text-evergreen"
            >
              <Wallet size={16} className="text-sage" />
              <span>Finanzas</span>
            </Link>
            <Link
              to="/venta-rapida"
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-peony/30 transition-colors flex flex-col items-center gap-1 text-xs font-semibold text-evergreen"
            >
              <ShoppingBag size={16} className="text-evergreen" />
              <span>Venta Rápida</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
