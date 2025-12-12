
import React from 'react';
// FIX: Import AspectRatio from the new types.ts file.
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
  disabled: boolean;
  availableRatios?: AspectRatio[];
}

const allRatios: { value: AspectRatio; label: string; icon: React.ReactElement }[] = [
  {
    value: '1:1',
    label: 'Quadrado',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"></rect></svg>
  },
  {
    value: '16:9',
    label: 'Paisagem',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"></rect></svg>
  },
  {
    value: '9:16',
    label: 'Retrato',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2"></rect></svg>
  },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, disabled, availableRatios }) => {
    const ratiosToDisplay = availableRatios 
        ? allRatios.filter(r => availableRatios.includes(r.value))
        : allRatios;

    const gridClass = ratiosToDisplay.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="mt-2">
        <label className="block text-sm font-medium text-gray-400 mb-2">Proporção</label>
        <div className={`grid ${gridClass} gap-2 p-1 bg-gray-800 border-2 border-gray-700 rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {ratiosToDisplay.map(({ value, label, icon }) => (
                <button
                    key={value}
                    onClick={() => onRatioChange(value)}
                    disabled={disabled}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${selectedRatio === value ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    aria-label={`Select ${label} aspect ratio`}
                    aria-pressed={selectedRatio === value}
                >
                    {icon}
                    <span className="text-xs mt-1">{label}</span>
                </button>
            ))}
        </div>
        {disabled && <p className="text-xs text-gray-500 mt-1">Não disponível para fusão/edição de rostos.</p>}
    </div>
  );
};
