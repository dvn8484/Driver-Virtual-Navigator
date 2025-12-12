
import React from 'react';

// Define style presets
export const stylePresets = {
  none: 'Nenhum',
  photorealistic: 'Fotorrealista',
  cinematic: 'Cinematográfico',
  cartoon: 'Desenho Animado',
  watercolor: 'Aquarela',
  fantasy: 'Arte de Fantasia',
  anime: 'Anime',
};

export type StylePreset = keyof typeof stylePresets;

interface AdvancedSettingsProps {
  style: StylePreset;
  onStyleChange: (style: StylePreset) => void;
  negativePrompt: string;
  onNegativePromptChange: (prompt: string) => void;
  disabled: boolean;
}

const AccordionIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);


export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  style,
  onStyleChange,
  negativePrompt,
  onNegativePromptChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className={`mt-2 bg-gray-800 border-2 border-gray-700 rounded-lg transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full flex items-center justify-between p-3 font-semibold text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            aria-expanded={isOpen}
            aria-controls="advanced-settings-panel"
        >
            <span>Configurações Avançadas</span>
            <AccordionIcon open={isOpen} />
        </button>
        {isOpen && (
            <div id="advanced-settings-panel" className="p-4 border-t border-gray-700 flex flex-col gap-4">
                {/* Style Preset */}
                <div>
                    <label htmlFor="style-preset" className="block text-sm font-medium text-gray-400 mb-1">
                        Estilo Predefinido
                    </label>
                    <select
                        id="style-preset"
                        value={style}
                        onChange={(e) => onStyleChange(e.target.value as StylePreset)}
                        disabled={disabled}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {Object.entries(stylePresets).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Negative Prompt */}
                <div>
                    <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-400 mb-1">
                        Prompt Negativo
                    </label>
                    <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => onNegativePromptChange(e.target.value)}
                        disabled={disabled}
                        placeholder="ex: embaçado, feio, texto, marca d'água"
                        rows={3}
                        spellCheck="true"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                    />
                </div>
                {disabled && <p className="text-xs text-gray-500 mt-2 text-center">Não disponível para fusão/edição de rostos.</p>}
            </div>
        )}
    </div>
  );
};