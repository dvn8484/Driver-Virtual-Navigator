import React from 'react';
import { Spinner } from './Spinner';

interface PromptEnhancerProps {
  onEnhance: () => void;
  isEnhancing: boolean;
  disabled?: boolean;
  onRevert?: () => void;
  canRevert?: boolean;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({ onEnhance, isEnhancing, disabled, onRevert, canRevert }) => {
  return (
    <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-indigo-400">Seu Prompt</h3>
        <div className="flex items-center gap-2">
            {canRevert && (
                <button
                    onClick={onRevert}
                    disabled={disabled}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reverter para o prompt original"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    <span>Reverter</span>
                </button>
            )}
            <button
              onClick={onEnhance}
              disabled={isEnhancing || disabled}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Use IA e a Pesquisa Google para criar um prompt mais detalhado"
            >
              {isEnhancing ? <Spinner /> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              <span>Melhorar com IA</span>
            </button>
        </div>
    </div>
  );
};
