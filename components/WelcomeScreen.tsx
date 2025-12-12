
import React from 'react';

export const WelcomeScreen: React.FC = () => {
    return (
        <div className="w-full h-full max-w-2xl bg-gray-800/50 rounded-xl flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-700">
             <svg className="w-20 h-20 text-indigo-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Gerador de Imagens</h2>
            <p className="text-gray-400 max-w-md">
                Seu parceiro criativo para visuais deslumbrantes. Use o painel à esquerda para escrever um prompt e clique em 'Gerar Imagem' para dar vida às suas ideias.
            </p>
        </div>
    );
}