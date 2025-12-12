
import React from 'react';
import { Spinner } from './Spinner';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, isLoading, disabled = false, loadingText = "Gerando...", children }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
    >
      {isLoading ? (
        <>
          <Spinner />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};