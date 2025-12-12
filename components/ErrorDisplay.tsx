
import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mt-4" role="alert">
      <strong className="font-bold">Erro: </strong>
      <span className="block sm:inline">{error}</span>
    </div>
  );
};