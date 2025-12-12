
import React, { useRef } from 'react';

interface ImageUploadProps {
    label: string;
    onImageUpload: (file: File) => void;
    onImageRemove: () => void;
    imagePreviewUrl?: string;
    disabled: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, onImageUpload, onImageRemove, imagePreviewUrl, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={disabled}
            />
            {imagePreviewUrl ? (
                <div className="relative group">
                    <img src={imagePreviewUrl} alt="Image preview" className="w-full h-auto rounded-md object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                        <button
                            onClick={onImageRemove}
                            disabled={disabled}
                            className="flex items-center justify-center p-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleButtonClick}
                    disabled={disabled}
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">{label}</span>
                    <span className="text-xs text-gray-500 mt-1">(Opcional)</span>
                </button>
            )}
        </div>
    );
};
