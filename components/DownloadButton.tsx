
import React from 'react';

interface DownloadButtonProps {
    imageUrl: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        // Extract extension from mime type, default to png
        const extension = imageUrl.split(';')[0].split('/')[1] || 'png';
        link.download = `generated-image-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
            aria-label="Download Image"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Baixar
        </button>
    );
};