import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calculator, ArrowRight, Save, TrendingUp, Sliders } from 'lucide-react';

// ── Catalog presets ───────────────────────────────────────────────────────
const CATALOG = [
  { id: 'c1', name: 'Llavero mini',          category: 'Llaveros',            baseHours: 1,   baseMaterials: 300  },
  { id: 'c2', name: 'Amigurumi pequeño',     category: 'Amigurumis General',  baseHours: 3,   baseMaterials: 800  },
  { id: 'c3', name: 'Amigurumi mediano',     category: 'Amigurumis General',  baseHours: 6,   baseMaterials: 1500 },
  { id: 'c4', name: 'Amigurumi grande',      category: 'Amigurumis General',  baseHours: 10,  baseMaterials: 2500 },
  { id: 'c5', name: 'Set flores x5',         category: 'Flores',              baseHours: 4,   baseMaterials: 900  },
  { id: 'c6', name: 'Personaje custom',      category: 'Personajes',          baseHours: 8,   baseMaterials: 2000 },
  { id: 'c7', name: 'Mascota personalizada', category: 'Mascotas',            baseHours: 9,   baseMaterials: 2200 },
  { id: 'c8', name: 'Accesorio especial',    category: 'Otras',               baseHours: 4,   baseMaterials: 1200 },
];

// ── Complexity levels with default margin % ───────────────────────────────
interface ComplexityLevel {
  id: string;
  label: string;
  emoji: string;
  margin: number;       // default margin % for this level
  description: string;
}

const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  {
    id: 'simple',
    label: 'Simple',
    emoji: '🟢',
    margin: 20,
    description: 'Llaveros, flores, items de pocas horas sin detalles complejos',
  },
  {
    id: 'medio',
    label: 'Intermedio',
    emoji: '🟡',
    margin: 30,
    description: 'Amigurumis pequeños/medianos, sets, personajes estándar',
  },
  {
    id: 'complejo',
    label: 'Complejo',
    emoji: '🟠',
    margin: 45,
    description: 'Amigurumis grandes, personajes con muchos detalles o articulaciones',
  },
  {
    id: 'premium',
    label: 'Premium',
    emoji: '🔴',
    margin: 60,
    description: 'Muñecos de apego, piezas únicas, personalización extrema',
  },
];

interface MaterialLine {
  id: string;
  desc: string;
  cost: string;
}

function genId() {
  return Math.random().toString(36).slice(2, 8);
}

function formatARS(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`;
}

export function QuotePage() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('2500');
  const [materials, setMaterials] = useState<MaterialLine[]>([
    { id: genId(), desc: 'Lana principal', cost: '' },
  ]);

  // Complexity & margin state
  const [selectedComplexity, setSelectedComplexity] = useState<string>('medio');
  const [customMarginStr, setCustomMarginStr] = useState('');
  const [useCustomMargin, setUseCustomMargin] = useState(false);

  // Computed totals
  const totalMaterials = materials.reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
  const laborCost = (parseFloat(hours) || 0) * (parseFloat(hourlyRate) || 0);
  const subtotal = totalMaterials + laborCost;

  // Active margin
  const defaultMargin = COMPLEXITY_LEVELS.find(c => c.id === selectedComplexity)?.margin ?? 30;
  const activeMarginPct = useCustomMargin
    ? Math.max(0, Math.min(200, parseFloat(customMarginStr) || 0))
    : defaultMargin;
  const marginAmount = subtotal * (activeMarginPct / 100);
  const suggested = subtotal + marginAmount;

  function addMaterial() {
    setMaterials(p => [...p, { id: genId(), desc: '', cost: '' }]);
  }

  function removeMaterial(id: string) {
    setMaterials(p => p.filter(m => m.id !== id));
  }

  function updateMaterial(id: string, key: 'desc' | 'cost', val: string) {
    setMaterials(p => p.map(m => m.id === id ? { ...m, [key]: val } : m));
  }

  const applyPreset = useCallback((id: string) => {
    const preset = CATALOG.find(c => c.id === id);
    if (!preset) return;
    setSelectedPreset(id);
    setProjectName(preset.name);
    setHours(String(preset.baseHours));
    setMaterials([{ id: genId(), desc: 'Materiales estimados', cost: String(preset.baseMaterials) }]);
  }, []);

  function handleSelectComplexity(complexityId: string) {
    setSelectedComplexity(complexityId);
    setUseCustomMargin(false);
    setCustomMarginStr('');
  }

  function handleCustomMarginChange(val: string) {
    setCustomMarginStr(val);
    setUseCustomMargin(true);
  }

  function handleSave() {
    // TODO: call API to save quote
    alert(`Presupuesto guardado: ${formatARS(suggested)}`);
  }

  function handleCreateOrder() {
    navigate('/pedidos/nuevo');
  }

  const activeLevel = COMPLEXITY_LEVELS.find(c => c.id === selectedComplexity)!;

  return (
    <div className="py-8 page-enter">
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Herramientas · Presupuestación
        </p>
        <h1 className="section-title flex items-center gap-3">
          <Calculator size={26} className="text-mauve" />
          Cotizador Inteligente
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Calculá el precio sugerido: materiales + (horas × valor hora) + % de ganancia por complejidad
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── Form ── */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Catalog presets */}
          <div className="card-craft p-6">
            <h2 className="text-sm font-bold text-evergreen mb-3">Empezar desde el catálogo</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATALOG.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => applyPreset(c.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all
                    ${selectedPreset === c.id
                      ? 'border-mauve bg-peony/40'
                      : 'border-[#eedddb] bg-white hover:border-mauve/40 hover:bg-peony/20'
                    }`}
                >
                  <p className="text-xs font-bold text-evergreen truncate">{c.name}</p>
                  <p className="text-xs text-text-muted">{c.baseHours}h · {formatARS(c.baseMaterials)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Project name */}
          <div className="card-craft p-6">
            <h2 className="text-sm font-bold text-evergreen mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">1</span>
              Nombre del Proyecto
            </h2>
            <input
              id="quote-project-name"
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Ej: Pikachu custom para Caro"
              className="input-craft"
            />
          </div>

          {/* Materials */}
          <div className="card-craft p-6">
            <h2 className="text-sm font-bold text-evergreen mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">2</span>
              Costo de Materiales
            </h2>
            <div className="flex flex-col gap-3">
              {materials.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.desc}
                    onChange={e => updateMaterial(m.id, 'desc', e.target.value)}
                    placeholder={`Material ${i + 1}`}
                    className="input-craft flex-1"
                    aria-label={`Descripción material ${i + 1}`}
                  />
                  <div className="relative w-32 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      value={m.cost}
                      onChange={e => updateMaterial(m.id, 'cost', e.target.value)}
                      placeholder="0"
                      className="input-craft pl-7"
                      aria-label={`Costo material ${i + 1}`}
                    />
                  </div>
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(m.id)}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="Eliminar material"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                className="flex items-center gap-2 text-sm font-semibold text-mauve hover:text-evergreen transition-colors py-2"
              >
                <Plus size={14} />
                Agregar material
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-[#eedddb]/60 flex justify-between items-center">
              <span className="text-sm text-text-muted">Subtotal materiales</span>
              <span className="text-sm font-bold text-evergreen">{formatARS(totalMaterials)}</span>
            </div>
          </div>

          {/* Labor */}
          <div className="card-craft p-6">
            <h2 className="text-sm font-bold text-evergreen mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">3</span>
              Costo de Mano de Obra
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hours" className="label-craft">Horas estimadas</label>
                <input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="0"
                  className="input-craft"
                />
              </div>
              <div>
                <label htmlFor="hourly-rate" className="label-craft">Valor por hora</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    id="hourly-rate"
                    type="number"
                    min="0"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    placeholder="2500"
                    className="input-craft pl-7"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#eedddb]/60 flex justify-between items-center">
              <span className="text-sm text-text-muted">Subtotal mano de obra</span>
              <span className="text-sm font-bold text-evergreen">{formatARS(laborCost)}</span>
            </div>
          </div>

          {/* ── NEW: Complexity & Profit Margin ── */}
          <div className="card-craft p-6">
            <h2 className="text-sm font-bold text-evergreen mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-peony flex items-center justify-center text-xs font-bold text-evergreen">4</span>
              Complejidad y % de Ganancia
            </h2>
            <p className="text-xs text-text-muted mb-4 ml-7">
              El margen de ganancia varía según el nivel de dificultad del producto
            </p>

            {/* Complexity level selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {COMPLEXITY_LEVELS.map(level => {
                const isSelected = selectedComplexity === level.id && !useCustomMargin;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSelectComplexity(level.id)}
                    title={level.description}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? 'border-mauve bg-peony/40 shadow-sm'
                        : 'border-[#eedddb] bg-white hover:border-mauve/50 hover:bg-peony/15'
                    }`}
                  >
                    <span className="text-xl">{level.emoji}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-evergreen' : 'text-text-muted'}`}>
                      {level.label}
                    </span>
                    <span className={`text-sm font-extrabold ${isSelected ? 'text-mauve' : 'text-text-muted'}`}>
                      +{level.margin}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Description of selected level */}
            {!useCustomMargin && (
              <div className="mb-4 px-3 py-2.5 bg-peony/20 rounded-lg border border-peony/50 text-xs text-evergreen flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{activeLevel.emoji}</span>
                <div>
                  <span className="font-bold">{activeLevel.label}:</span>{' '}
                  <span className="text-text-muted">{activeLevel.description}</span>
                </div>
              </div>
            )}

            {/* Custom margin override */}
            <div className="pt-4 border-t border-[#eedddb]/60">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={14} className="text-text-muted" />
                <span className="text-xs font-bold text-evergreen">Personalizar % de ganancia</span>
                <span className="text-xs text-text-muted">(override manual)</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={useCustomMargin ? (parseFloat(customMarginStr) || 0) : defaultMargin}
                  onChange={e => handleCustomMarginChange(e.target.value)}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #d8959b ${(useCustomMargin ? (parseFloat(customMarginStr) || 0) : defaultMargin) / 1.5}%, #eedddb ${(useCustomMargin ? (parseFloat(customMarginStr) || 0) : defaultMargin) / 1.5}%)`,
                  }}
                  id="margin-slider"
                />

                {/* Numeric input */}
                <div className="relative w-24 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={useCustomMargin ? customMarginStr : defaultMargin}
                    onChange={e => handleCustomMarginChange(e.target.value)}
                    className="input-craft pr-7 text-sm font-bold text-right text-evergreen"
                    placeholder="30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">%</span>
                </div>

                {/* Reset to preset */}
                {useCustomMargin && (
                  <button
                    type="button"
                    onClick={() => { setUseCustomMargin(false); setCustomMarginStr(''); }}
                    className="text-xs text-mauve hover:text-evergreen font-semibold whitespace-nowrap transition-colors"
                  >
                    ↺ Resetear
                  </button>
                )}
              </div>

              {/* Range labels */}
              <div className="flex justify-between text-[10px] text-text-muted mt-1.5 px-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
              </div>

              {useCustomMargin && (
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <TrendingUp size={11} className="text-sage" />
                  Usando margen personalizado de{' '}
                  <strong className="text-evergreen">{activeMarginPct}%</strong>
                  {' '}(antes: {defaultMargin}% para nivel {activeLevel.label})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Result panel ── */}
        <div className="xl:col-span-2 xl:sticky xl:top-24 h-fit flex flex-col gap-4">
          <div className="card-craft p-6">
            <h2 className="text-base font-bold text-evergreen mb-5">Resumen del Presupuesto</h2>

            {/* Breakdown */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Materiales</span>
                <span className="font-semibold text-evergreen">{formatARS(totalMaterials)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">{hours || 0}h × {formatARS(+hourlyRate)}</span>
                <span className="font-semibold text-evergreen">{formatARS(laborCost)}</span>
              </div>
              <div className="h-px bg-[#eedddb] my-1" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Costo total</span>
                <span className="font-semibold text-evergreen">{formatARS(subtotal)}</span>
              </div>
              {/* Margin line — shows complexity badge + % */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Ganancia</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    useCustomMargin
                      ? 'bg-peony/40 border-mauve/40 text-evergreen'
                      : 'bg-secondary-container/60 border-sage/30 text-sage'
                  }`}>
                    {useCustomMargin ? '✏️' : activeLevel.emoji}
                    {useCustomMargin ? 'Manual' : activeLevel.label}
                    · {activeMarginPct}%
                  </span>
                </div>
                <span className="text-sage font-bold">+{formatARS(marginAmount)}</span>
              </div>
            </div>

            {/* Suggested price */}
            <div className="p-4 bg-peony/40 rounded-2xl text-center mb-5 border border-peony/40">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Precio sugerido</p>
              <p className="text-4xl font-black text-evergreen tracking-tight">{formatARS(suggested)}</p>
              {subtotal > 0 && (
                <p className="text-xs text-text-muted mt-1.5">
                  <span className="font-semibold text-sage">+{activeMarginPct}%</span> sobre costo de{' '}
                  <span className="font-semibold">{formatARS(subtotal)}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="btn-secondary justify-center"
                id="btn-guardar-presupuesto"
              >
                <Save size={14} />
                Guardar Presupuesto
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="btn-primary justify-center"
                id="btn-iniciar-pedido-desde-cotizador"
              >
                Iniciar Pedido con este precio
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Formula reference */}
          <div className="p-4 bg-surface-container rounded-xl">
            <p className="text-xs font-semibold text-evergreen mb-2">📐 Fórmula utilizada</p>
            <p className="text-xs text-text-muted leading-relaxed mb-2">
              <code className="bg-white px-1.5 py-0.5 rounded text-evergreen text-xs">
                (Materiales + Mano de obra) × (1 + {activeMarginPct}/100)
              </code>
            </p>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {COMPLEXITY_LEVELS.map(l => (
                <div key={l.id} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <span>{l.emoji}</span>
                  <span className="font-semibold">{l.label}:</span>
                  <span className="text-evergreen font-bold">+{l.margin}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
