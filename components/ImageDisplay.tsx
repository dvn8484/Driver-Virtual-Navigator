import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DownloadButton } from './DownloadButton';
import { EditorToolbar } from './EditorToolbar';
import { generateImage } from '../services/geminiService';
import { Spinner } from './Spinner';
// FIX: Import AspectRatio from the new types.ts file.
import { AspectRatio } from '../types';
import { GenerateButton } from './GenerateButton';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  prompt: string;
  onImageUpdate: (newImageUrl: string, editPrompt: string) => void;
  aspectRatio: AspectRatio;
  onGenerateVariations: () => void;
}

type EditTool = 'magic' | 'crop' | 'filters';

const aspectRatioClasses: Record<AspectRatio, string> = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

const loadingMessages = [
    { percent: 0, message: "Conectando à IA criativa..." },
    { percent: 15, message: "Analisando seu prompt..." },
    { percent: 30, message: "Coletando inspiração cósmica..." },
    { percent: 50, message: "Pintando com pixels e luz..." },
    { percent: 75, message: "Aplicando texturas artísticas..." },
    { percent: 90, message: "Finalizando a composição..." },
    { percent: 95, message: "Quase lá, só mais um momento." },
];

const LoadingSkeleton: React.FC<{ aspectRatio: AspectRatio }> = ({ aspectRatio }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(loadingMessages[0].message);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress >= 99) {
                    clearInterval(interval);
                    return 98; 
                }
                
                const currentMessageInfo = loadingMessages.slice().reverse().find(m => newProgress >= m.percent);
                if (currentMessageInfo) {
                    setMessage(currentMessageInfo.message);
                }

                return newProgress;
            });
        }, 180); 

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`w-full max-w-xl ${aspectRatioClasses[aspectRatio]} bg-gray-800 rounded-xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700`}>
             <svg className="w-16 h-16 text-indigo-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="text-gray-300 font-semibold text-lg mb-4">Gerando sua obra-prima...</p>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden border-2 border-gray-600 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2 text-center h-5 tabular-nums">{message} ({progress}%)</p>
        </div>
    );
};

const EditProgressOverlay: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 99) return 99;
                // Increase progress: faster at start, slower as it gets higher to simulate waiting
                const increment = prev < 40 ? 3 : prev < 70 ? 2 : 1;
                return Math.min(prev + increment, 99);
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col items-center max-w-sm w-full mx-4">
                <Spinner />
                <p className="text-white mt-4 font-semibold text-lg">Processando Edição...</p>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-4 overflow-hidden border border-gray-600 shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-200 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <div className="flex justify-between w-full mt-2 px-1">
                    <p className="text-gray-400 text-xs">Otimizando pixels</p>
                    <p className="text-indigo-300 font-mono text-sm font-bold">{progress}%</p>
                </div>
            </div>
        </div>
    );
};


const EditButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
        aria-label="Edit Image with advanced tools"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
        Edição Avançada
    </button>
);

const VariationsButton: React.FC<{ onClick: () => void; isLoading: boolean }> = ({ onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        title="Gerar variações desta imagem"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.657 48.657 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>
        Variações
    </button>
);


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, prompt, onImageUpdate, aspectRatio, onGenerateVariations }) => {
  const [editTool, setEditTool] = useState<EditTool | null>(null);
  const [magicBrushMode, setMagicBrushMode] = useState<'remove' | 'add'>('remove');
  const [brushSize, setBrushSize] = useState(40);
  const [addPrompt, setAddPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Text-based editing state
  const [editText, setEditText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0 });
  const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;

  // Crop state
  const [cropArea, setCropArea] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const cropStartPos = useRef<{ x: number, y: number } | null>(null);
  const [resizeDimensions, setResizeDimensions] = useState<{ width: number, height: number} | null>(null);


  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const originalImage = useRef<HTMLImageElement | null>(null);

  const dataUrlToInputImage = (dataUrl: string): { data: string; mimeType: string } | null => {
    const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) return null;
    return { mimeType: match[1], data: match[2] };
  };

  const handleTextEdit = async () => {
    if (!editText.trim() || !imageUrl) return;
    setIsEditing(true);
    setEditError(null);
    try {
        const imageInput = dataUrlToInputImage(imageUrl);
        if (!imageInput) {
            throw new Error("Could not process the current image.");
        }
        
        const results = await generateImage(
            editText, 
            [imageInput],
            aspectRatio // Fix: pass the aspect ratio
        );

        if (results && results.length > 0) {
            const { data, mimeType } = results[0];
            const newImageUrl = `data:${mimeType};base64,${data}`;
            onImageUpdate(newImageUrl, `Edited with: "${editText}"`);
            setEditText(''); // Clear prompt on success
        } else {
            throw new Error("The API did not return an edited image. The prompt may have been blocked by safety filters.");
        }
    } catch (err) {
        let errorMessage = "Ocorreu um erro desconhecido durante a edição.";
        if (err instanceof Error) {
            const msg = err.message.toLowerCase();
            if (msg.includes("blocked") || msg.includes("bloqueado") || msg.includes("safety") || msg.includes("segurança")) {
                errorMessage = "Solicitação bloqueada por segurança. Tente ajustar seu prompt.";
            } else {
                errorMessage = err.message.replace('Gemini API Error: ', '');
            }
        }
        setEditError(errorMessage);
    } finally {
        setIsEditing(false);
    }
  };


  const clearOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (overlayCanvas) {
      const ctx = overlayCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
    }
  }, []);
  
  const resetAllEditingState = useCallback(() => {
    setEditTool(null);
    setMagicBrushMode('remove');
    setAddPrompt('');
    setIsApplying(false);
    setError(null);
    clearOverlay();
    setCropArea(null);
    cropStartPos.current = null;
    setFilters({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0 });
  }, [clearOverlay]);

  useEffect(() => {
    if (editTool && imageUrl && imageCanvasRef.current && overlayCanvasRef.current) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageUrl;
        image.onload = () => {
            originalImage.current = image;
            const imageCanvas = imageCanvasRef.current!;
            const overlayCanvas = overlayCanvasRef.current!;
            const container = imageCanvas.parentElement!;
            
            const aspect = image.width / image.height;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            let canvasWidth = containerWidth;
            let canvasHeight = containerWidth / aspect;

            if (canvasHeight > containerHeight) {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * aspect;
            }

            imageCanvas.width = canvasWidth;
            imageCanvas.height = canvasHeight;
            overlayCanvas.width = canvasWidth;
            overlayCanvas.height = canvasHeight;

            setResizeDimensions({ width: image.width, height: image.height });

            const ctx = imageCanvas.getContext('2d');
            ctx?.drawImage(image, 0, 0, canvasWidth, canvasHeight);
            clearOverlay();
        };
    }
  }, [editTool, imageUrl, clearOverlay]);
  
  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent | MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  const drawMagicMask = useCallback((e: MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getMousePos(canvas, e);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    ctx.lineWidth = brushSize;
    
    if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
    lastPos.current = pos;
  }, [brushSize]);

  const drawCropArea = useCallback((e: MouseEvent) => {
      if (!isDrawing.current || !cropStartPos.current) return;
      const canvas = overlayCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const currentPos = getMousePos(canvas, e);

      const x = Math.min(cropStartPos.current.x, currentPos.x);
      const y = Math.min(cropStartPos.current.y, currentPos.y);
      const width = Math.abs(currentPos.x - cropStartPos.current.x);
      const height = Math.abs(currentPos.y - cropStartPos.current.y);

      setCropArea({ x, y, width, height });

      clearOverlay();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(x, y, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
  }, [clearOverlay]);

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    if (editTool === 'magic') drawMagicMask(e);
    if (editTool === 'crop') drawCropArea(e);
  }, [editTool, drawMagicMask, drawCropArea]);

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
    cropStartPos.current = null;
    window.removeEventListener('mousemove', mouseMoveHandler);
    window.removeEventListener('mouseup', stopDrawing);
  }, [mouseMoveHandler]);
  
  const startDrawing = useCallback((e: React.MouseEvent) => {
    isDrawing.current = true;
    const canvas = overlayCanvasRef.current!;
    const pos = getMousePos(canvas, e);

    if (editTool === 'magic') {
      lastPos.current = pos;
      // Draw a dot for single clicks and to start the brush stroke immediately
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.7)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (editTool === 'crop') {
      cropStartPos.current = pos;
      setCropArea(null);
    }
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', stopDrawing);
  }, [editTool, mouseMoveHandler, stopDrawing, brushSize]);
  
  const handleApplyEdit = async () => {
      setError(null);
      setIsApplying(true);

      try {
          let finalImageUrl: string | null = null;
          let finalPrompt = prompt;

          switch(editTool) {
              case 'magic': {
                  if (magicBrushMode === 'add' && !addPrompt.trim()) {
                      throw new Error("Please describe what you want to add.");
                  }
                  const imageCanvas = imageCanvasRef.current!;
                  const overlayCanvas = overlayCanvasRef.current!;

                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = imageCanvas.width;
                  tempCanvas.height = imageCanvas.height;
                  const tempCtx = tempCanvas.getContext('2d')!;
                  
                  tempCtx.drawImage(imageCanvas, 0, 0);
                  tempCtx.globalCompositeOperation = 'destination-out';
                  tempCtx.drawImage(overlayCanvas, 0, 0);
                  
                  const imageWithMaskDataUrl = tempCanvas.toDataURL('image/png');
                  const base64Data = imageWithMaskDataUrl.split(',')[1];

                  finalPrompt = magicBrushMode === 'remove'
                      ? "Fill in the transparent area, matching the surrounding style, texture, and lighting seamlessly."
                      : `${addPrompt} in the transparent area.`;

                  const results = await generateImage(
                      finalPrompt, 
                      [{ data: base64Data, mimeType: 'image/png' }], 
                      aspectRatio // Fix: use prop
                    );

                  if (results && results.length > 0) {
                      const { data, mimeType } = results[0];
                      finalImageUrl = `data:${mimeType};base64,${data}`;
                  } else {
                      throw new Error("Editing failed: The API did not return an image.");
                  }
                  break;
              }
              case 'filters': {
                  const canvas = imageCanvasRef.current!;
                  const ctx = canvas.getContext('2d')!;
                  ctx.filter = filterString;
                  ctx.drawImage(originalImage.current!, 0, 0, canvas.width, canvas.height);
                  ctx.filter = 'none'; // Reset filter
                  finalImageUrl = canvas.toDataURL('image/png');
                  finalPrompt = 'Applied image filters.';
                  break;
              }
              case 'crop': {
                  const sourceCanvas = imageCanvasRef.current!;
                  const destCanvas = document.createElement('canvas');
                  
                  const sourceImage = originalImage.current!;
                  const scaleX = sourceImage.width / sourceCanvas.width;
                  const scaleY = sourceImage.height / sourceCanvas.height;

                  let sourceX = 0, sourceY = 0, sourceWidth = sourceImage.width, sourceHeight = sourceImage.height;

                  if (cropArea) {
                      sourceX = cropArea.x * scaleX;
                      sourceY = cropArea.y * scaleY;
                      sourceWidth = cropArea.width * scaleX;
                      sourceHeight = cropArea.height * scaleY;
                  }

                  destCanvas.width = resizeDimensions?.width || sourceWidth;
                  destCanvas.height = resizeDimensions?.height || sourceHeight;
                  
                  const destCtx = destCanvas.getContext('2d')!;
                  destCtx.drawImage(sourceImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destCanvas.width, destCanvas.height);
                  finalImageUrl = destCanvas.toDataURL('image/png');
                  finalPrompt = 'Cropped or resized image.';
                  break;
              }
          }

          if (finalImageUrl) {
              onImageUpdate(finalImageUrl, finalPrompt);
              resetAllEditingState();
          }

      } catch (err) {
            let friendlyMessage = "Ocorreu um erro inesperado. Por favor, tente novamente.";
            if (err instanceof Error) {
                const msg = err.message.toLowerCase();
                // Improved check for localized safety error messages
                if (msg.includes("blocked") || msg.includes("bloqueado") || msg.includes("safety") || msg.includes("segurança")) {
                    friendlyMessage = "Solicitação bloqueada por segurança. Tente ajustar seu prompt ou a área selecionada.";
                } else if (msg.includes("text response")) {
                    friendlyMessage = "A IA não conseguiu realizar esta edição. Tente um prompt diferente.";
                } else {
                    friendlyMessage = `Falha na edição: ${err.message.replace('Gemini API Error: ', '')}`;
                }
            }
            setError(friendlyMessage);
      } finally {
          setIsApplying(false);
      }
  };

  const handleCancel = () => {
    resetAllEditingState();
  };

  if (isLoading) {
    return <LoadingSkeleton aspectRatio={aspectRatio} />;
  }

  if (!imageUrl) {
    return (
        <div className={`w-full max-w-xl ${aspectRatioClasses[aspectRatio]} bg-gray-800/50 rounded-xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700`}>
            <svg className="w-16 h-16 text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <p className="text-gray-400 font-semibold text-lg">Geração Falhou</p>
            <p className="text-gray-500 text-sm mt-2 text-center">Algo deu errado. Por favor, verifique a mensagem de erro e tente novamente.</p>
        </div>
    )
  }

  return (
    <div className={`relative w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-indigo-900/20 transition-all duration-500 ease-in-out flex items-center justify-center ${aspectRatioClasses[aspectRatio]}`}>
      {editTool ? (
        <div className="absolute inset-0 flex flex-col">
            <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden" style={{ filter: editTool === 'filters' ? filterString : 'none'}}>
                <canvas ref={imageCanvasRef} className="absolute top-0 left-0 right-0 bottom-0 m-auto" style={{ zIndex: 1 }} />
                <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 right-0 bottom-0 m-auto cursor-crosshair" style={{ zIndex: 2 }} onMouseDown={startDrawing} />
                {isApplying && <EditProgressOverlay />}
            </div>
            <EditorToolbar
                tool={editTool}
                onToolChange={setEditTool}
                magicBrushMode={magicBrushMode}
                onMagicBrushModeChange={setMagicBrushMode}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                addPrompt={addPrompt}
                onAddPromptChange={setAddPrompt}
                filters={filters}
                onFilterChange={setFilters}
                resizeDimensions={resizeDimensions}
                onResizeChange={setResizeDimensions}
                originalImageAspectRatio={originalImage.current ? originalImage.current.width / originalImage.current.height : 1}
                onApply={handleApplyEdit}
                onCancel={handleCancel}
                isApplying={isApplying}
                error={error}
            />
        </div>
      ) : (
        <>
            <img
                src={imageUrl}
                alt={prompt}
                className="w-full h-full object-contain"
            />
            {isEditing && <EditProgressOverlay />}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  disabled={isEditing}
                  placeholder="Descreva uma edição, ex: 'adicione um filtro retrô'"
                  rows={2}
                  spellCheck="true"
                  className="w-full p-2 bg-gray-800/80 border-2 border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out disabled:opacity-50 resize-y"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editText.trim()) handleTextEdit();
                    }
                  }}
                />
                <GenerateButton 
                  onClick={handleTextEdit} 
                  isLoading={isEditing} 
                  disabled={!editText.trim()}
                  loadingText="Aplicando..."
                >
                  Aplicar
                </GenerateButton>
              </div>
              {editError && <p className="text-red-400 text-sm text-center">{editError}</p>}
                        
              <div className="flex items-center justify-between gap-2 pt-2">
                   <p className="text-gray-400 text-xs truncate flex-1" title={prompt}>
                      {prompt}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                      <DownloadButton imageUrl={imageUrl} />
                      <VariationsButton onClick={onGenerateVariations} isLoading={isEditing || isApplying} />
                      <EditButton onClick={() => setEditTool('magic')} />
                  </div>
              </div>
            </div>
        </>
      )}
    </div>
  );
};