import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 flex items-center justify-center bg-gray-900 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
        <span className="bg-indigo-600 text-white p-2 rounded-lg">AI</span>
        <span>Image Generator Pro</span>
      </h1>
    </header>
  );
};