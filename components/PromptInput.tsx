
import React from 'react';

// FIX: Add an optional placeholder prop to allow customization from parent components.
interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      // FIX: Use the provided placeholder prop or fall back to a default value.
      placeholder={placeholder || "ex: Um leão majestoso usando uma coroa, iluminação cinematográfica..."}
      rows={12}
      spellCheck="true"
      className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed resize-y"
    />
  );
};