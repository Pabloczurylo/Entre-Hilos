import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, RotateCcw, Hash, ChevronUp, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'entre-hilos-counter';

interface CounterState {
  rows: number;
  stitches: number;
  target: number;
  note: string;
}

function loadState(): CounterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CounterState;
  } catch {}
  return { rows: 0, stitches: 0, target: 0, note: '' };
}

function saveState(state: CounterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function CounterPage() {
  const [state, setState] = useState<CounterState>(loadState);
  const [showSettings, setShowSettings] = useState(false);
  const [flashRows, setFlashRows] = useState(false);
  const [flashSt, setFlashSt] = useState(false);

  // Persist on every state change
  useEffect(() => { saveState(state); }, [state]);

  const bump = useCallback((key: 'rows' | 'stitches', delta: number) => {
    setState(p => {
      const next = Math.max(0, p[key] + delta);
      return { ...p, [key]: next };
    });
    if (key === 'rows') {
      setFlashRows(true);
      setTimeout(() => setFlashRows(false), 150);
    } else {
      setFlashSt(true);
      setTimeout(() => setFlashSt(false), 150);
    }
  }, []);

  function reset() {
    setState(p => ({ ...p, rows: 0, stitches: 0 }));
  }

  const progress = state.target > 0 ? Math.min((state.rows / state.target) * 100, 100) : 0;

  return (
    <div className="py-8 page-enter flex flex-col items-center">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Herramienta · Tejido
        </p>
        <h1 className="section-title flex items-center justify-center gap-3">
          <Hash size={26} className="text-mauve" />
          Contador de Vueltas
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Registrado en el dispositivo — persiste al cambiar de sección
        </p>
      </div>

      <div className="w-full max-w-sm">
        {/* Rows counter (main) */}
        <div className="card-craft p-8 mb-5 text-center">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Vueltas / Rondas</p>

          <div className={`text-8xl font-bold text-evergreen tracking-tighter transition-all duration-75 mb-6 ${flashRows ? 'scale-110 text-mauve' : ''}`}>
            {state.rows}
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => bump('rows', -1)}
              className="w-16 h-16 rounded-full bg-peony text-evergreen flex items-center justify-center hover:bg-mauve hover:text-white transition-all shadow-card active:scale-95"
              aria-label="Restar vuelta"
            >
              <Minus size={24} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => bump('rows', 1)}
              className="w-20 h-20 rounded-full bg-mauve text-white flex items-center justify-center hover:shadow-button transition-all shadow-card-hover active:scale-95"
              aria-label="Sumar vuelta"
              id="btn-sumar-vuelta"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => bump('rows', -1)}
              className="w-16 h-16 rounded-full bg-peony text-evergreen flex items-center justify-center hover:bg-mauve hover:text-white transition-all shadow-card active:scale-95 opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              <Minus size={24} />
            </button>
          </div>

          {/* Quick step buttons */}
          <div className="flex justify-center gap-2 mt-5">
            {[5, 10, -5].map(step => (
              <button
                key={step}
                type="button"
                onClick={() => bump('rows', step)}
                className="px-3 py-1 rounded-full border border-[#eedddb] text-xs font-semibold text-text-muted hover:border-mauve hover:text-mauve transition-colors"
              >
                {step > 0 ? `+${step}` : step}
              </button>
            ))}
          </div>
        </div>

        {/* Stitches counter (secondary) */}
        <div className="card-craft p-6 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Puntos</p>
              <span className={`text-4xl font-bold text-evergreen tracking-tight transition-all duration-75 ${flashSt ? 'text-mauve scale-110' : ''}`}>
                {state.stitches}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => bump('stitches', 1)}
                className="w-10 h-10 rounded-full bg-peony text-evergreen flex items-center justify-center hover:bg-mauve hover:text-white transition-all active:scale-90"
                aria-label="Sumar punto"
              >
                <ChevronUp size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => bump('stitches', -1)}
                className="w-10 h-10 rounded-full bg-surface-container text-text-muted flex items-center justify-center hover:bg-peony hover:text-evergreen transition-all active:scale-90"
                aria-label="Restar punto"
              >
                <ChevronDown size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Target progress */}
        {state.target > 0 && (
          <div className="card-craft p-5 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted font-semibold">Progreso</span>
              <span className="text-evergreen font-bold">{state.rows} / {state.target} vueltas</span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#829672' : '#d8959b' }}
              />
            </div>
            <p className="text-xs text-text-muted text-right mt-1">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Settings toggle */}
        <button
          type="button"
          onClick={() => setShowSettings(p => !p)}
          className="w-full text-xs font-semibold text-text-muted flex items-center justify-center gap-1 py-2 hover:text-evergreen transition-colors mb-3"
        >
          ⚙️ {showSettings ? 'Ocultar' : 'Configurar'} meta y nota
        </button>

        {showSettings && (
          <div className="card-craft p-5 mb-5 flex flex-col gap-4">
            <div>
              <label htmlFor="target" className="label-craft">Meta de vueltas</label>
              <input
                id="target"
                type="number"
                min="0"
                value={state.target || ''}
                onChange={e => setState(p => ({ ...p, target: +e.target.value }))}
                placeholder="Ej: 30"
                className="input-craft"
              />
            </div>
            <div>
              <label htmlFor="note" className="label-craft">Nota del patrón</label>
              <textarea
                id="note"
                value={state.note}
                onChange={e => setState(p => ({ ...p, note: e.target.value }))}
                placeholder="Paso del patrón, referencia de color..."
                rows={2}
                className="input-craft resize-none"
              />
            </div>
          </div>
        )}

        {state.note && !showSettings && (
          <div className="p-4 bg-peony/30 rounded-xl mb-5">
            <p className="text-xs font-semibold text-evergreen mb-1">📝 Nota del patrón</p>
            <p className="text-sm text-evergreen">{state.note}</p>
          </div>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-text-muted hover:text-evergreen border border-[#eedddb] rounded-full hover:border-mauve/50 transition-colors"
          id="btn-reset-contador"
        >
          <RotateCcw size={14} />
          Reiniciar Contadores
        </button>
      </div>
    </div>
  );
}
