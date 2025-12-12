
import React from 'react';
import { Spinner } from './Spinner';

type EditTool = 'magic' | 'crop' | 'filters';

interface FilterValues {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
}
interface ResizeDimensions {
  width: number;
  height: number;
}

interface EditorToolbarProps {
  tool: EditTool;
  onToolChange: (tool: EditTool) => void;
  // Magic Brush props
  magicBrushMode: 'remove' | 'add';
  onMagicBrushModeChange: (mode: 'remove' | 'add') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  addPrompt: string;
  onAddPromptChange: (prompt: string) => void;
  // Filter props
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  // Crop & Resize props
  resizeDimensions: ResizeDimensions | null;
  onResizeChange: (dimensions: ResizeDimensions | null) => void;
  originalImageAspectRatio: number;
  // General props
  onApply: () => void;
  onCancel: () => void;
  isApplying: boolean;
  error: string | null;
}

const ToolButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, icon, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors w-24 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const FilterSlider: React.FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onReset: () => void;
  disabled: boolean;
}> = ({ label, value, min = 0, max = 200, step = 1, onChange, onReset, disabled }) => (
  <div className="flex items-center gap-2 text-white">
    <label className="text-xs text-gray-400 w-20">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      aria-label={label}
    />
    <span className="text-xs w-8 text-right">{value}</span>
    <button onClick={onReset} disabled={disabled} className="text-xs text-gray-400 hover:text-white" title={`Reset ${label}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-6.364M20 15a9 9 0 01-14.13 6.364" />
      </svg>
    </button>
  </div>
);

const MagicToolOptions: React.FC<Omit<EditorToolbarProps, 'tool' | 'onToolChange' | 'filters' | 'onFilterChange' | 'onApply' | 'onCancel' | 'error' | 'resizeDimensions' | 'onResizeChange' | 'originalImageAspectRatio'>> = (props) => (
  <>
    <div className="flex rounded-lg bg-gray-700 p-1">
      <button
        onClick={() => props.onMagicBrushModeChange('remove')}
        disabled={props.isApplying}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${props.magicBrushMode === 'remove' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
      >
        Remover
      </button>
      <button
        onClick={() => props.onMagicBrushModeChange('add')}
        disabled={props.isApplying}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${props.magicBrushMode === 'add' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
      >
        Adicionar
      </button>
    </div>
    <div className="flex items-center gap-2 text-white flex-grow min-w-[150px]">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
      </svg>
      <input type="range" min="5" max="100" value={props.brushSize} onChange={(e) => props.onBrushSizeChange(Number(e.target.value))} disabled={props.isApplying} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" aria-label="Brush size" />
    </div>
    {props.magicBrushMode === 'add' && (
      <input type="text" spellCheck="true" value={props.addPrompt} onChange={(e) => props.onAddPromptChange(e.target.value)} disabled={props.isApplying} placeholder="Descreva o que adicionar..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500" />
    )}
  </>
);

const FilterToolOptions: React.FC<Omit<EditorToolbarProps, 'tool' | 'onToolChange' | 'onApply' | 'onCancel' | 'error' | 'magicBrushMode' | 'onMagicBrushModeChange' | 'brushSize' | 'onBrushSizeChange' | 'addPrompt' | 'onAddPromptChange' | 'resizeDimensions' | 'onResizeChange' | 'originalImageAspectRatio'>> = ({ filters, onFilterChange, isApplying }) => {
    const handleFilterChange = (key: keyof FilterValues, value: number) => {
        onFilterChange({ ...filters, [key]: value });
    };
    const resetFilter = (key: keyof FilterValues, defaultValue: number) => {
        onFilterChange({ ...filters, [key]: defaultValue });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 w-full">
            <FilterSlider label="Brilho" value={filters.brightness} onChange={(v) => handleFilterChange('brightness', v)} onReset={() => resetFilter('brightness', 100)} disabled={isApplying} />
            <FilterSlider label="Contraste" value={filters.contrast} onChange={(v) => handleFilterChange('contrast', v)} onReset={() => resetFilter('contrast', 100)} disabled={isApplying} />
            <FilterSlider label="Escala de Cinza" max={100} value={filters.grayscale} onChange={(v) => handleFilterChange('grayscale', v)} onReset={() => resetFilter('grayscale', 0)} disabled={isApplying} />
            <FilterSlider label="Sépia" max={100} value={filters.sepia} onChange={(v) => handleFilterChange('sepia', v)} onReset={() => resetFilter('sepia', 0)} disabled={isApplying} />
        </div>
    );
};

const CropToolOptions: React.FC<Omit<EditorToolbarProps, 'tool' | 'onToolChange' | 'filters' | 'onFilterChange' | 'onApply' | 'onCancel' | 'error' | 'magicBrushMode' | 'onMagicBrushModeChange' | 'brushSize' | 'onBrushSizeChange' | 'addPrompt' | 'onAddPromptChange'>> = ({ resizeDimensions, onResizeChange, originalImageAspectRatio, isApplying }) => {
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth)) {
      onResizeChange({ width: newWidth, height: Math.round(newWidth / originalImageAspectRatio) });
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10);
    if (!isNaN(newHeight)) {
      onResizeChange({ width: Math.round(newHeight * originalImageAspectRatio), height: newHeight });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm font-semibold text-gray-300">Desenhe na imagem para cortar.</p>
      <div className="flex items-center gap-2">
        <label htmlFor="width" className="text-sm text-gray-400">Redimensionar:</label>
        <input type="number" id="width" value={resizeDimensions?.width || ''} onChange={handleWidthChange} disabled={isApplying} className="w-20 p-1 bg-gray-700 border border-gray-600 rounded-md text-sm" placeholder="Largura" />
        <span className="text-gray-400">x</span>
        <input type="number" id="height" value={resizeDimensions?.height || ''} onChange={handleHeightChange} disabled={isApplying} className="w-20 p-1 bg-gray-700 border border-gray-600 rounded-md text-sm" placeholder="Altura" />
      </div>
    </div>
  );
};

export const EditorToolbar: React.FC<EditorToolbarProps> = (props) => {
  const { tool, onToolChange, onApply, onCancel, isApplying, error } = props;
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-20 border-t border-gray-700/50">
      <div className="flex flex-col gap-4">
        {/* Top Row: Tool Selection & Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
            <ToolButton label="Pincel Mágico" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>} isActive={tool === 'magic'} onClick={() => onToolChange('magic')} disabled={isApplying} />
            <ToolButton label="Cortar/Redim." icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>} isActive={tool === 'crop'} onClick={() => onToolChange('crop')} disabled={isApplying} />
            <ToolButton label="Filtros" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5zm10 10a1 1 0 01-1-1V6a1 1 0 112 0v8a1 1 0 01-1 1z" clipRule="evenodd" /></svg>} isActive={tool === 'filters'} onClick={() => onToolChange('filters')} disabled={isApplying} />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onCancel} disabled={isApplying} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-colors">Cancelar</button>
            <button onClick={onApply} disabled={isApplying} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {isApplying && <Spinner />}
              Aplicar Alterações
            </button>
          </div>
        </div>
        
        {/* Bottom Row: Tool-specific options */}
        <div className="p-3 bg-gray-800/70 rounded-lg flex flex-wrap items-center gap-4">
          {tool === 'magic' && <MagicToolOptions {...props} />}
          {tool === 'filters' && <FilterToolOptions {...props} />}
          {tool === 'crop' && <CropToolOptions {...props} />}
        </div>

        {error && <p className="text-red-400 text-sm text-center -mt-2">{error}</p>}
      </div>
    </div>
  );
};