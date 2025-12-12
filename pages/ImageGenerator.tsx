import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, InputImage, enhancePromptWithSearch, analyzeImageForPrompt } from '../services/geminiService';
import { PromptInput } from '../components/PromptInput';
import { GenerateButton } from '../components/GenerateButton';
import { ImageDisplay } from '../components/ImageDisplay';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { ImageUpload } from '../components/FaceUpload';
import { AspectRatioSelector } from '../components/AspectRatioSelector';
import { AdvancedSettings, StylePreset } from '../components/AdvancedSettings';
import { PromptEnhancer } from '../components/PromptEnhancer';
// FIX: Import AspectRatio from the new types.ts file.
import { AspectRatio } from '../types';
import { Spinner } from '../components/Spinner';


const initialPrompt = "";

const stylePresetSuffixes: Record<StylePreset, string> = {
  none: '',
  photorealistic: 'photorealistic, hyper-detailed, 8k, sharp focus, professional photography',
  cinematic: 'cinematic lighting, dramatic, movie still, film grain',
  cartoon: 'cartoon style, vibrant colors, bold outlines, 2d animation',
  watercolor: 'watercolor painting, soft wash, blended colors, paper texture',
  fantasy: 'fantasy art, epic, magical, glowing, detailed illustration',
  anime: 'anime style, vibrant, Japanese animation, cel-shaded',
};

interface UploadedImage {
  data: string;
  mimeType: string;
  previewUrl: string;
}

const ImageGenerator: React.FC = () => {
  // Common State
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [displayedPrompt, setDisplayedPrompt] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);

  // Image Generation State
  const [faceImage1, setFaceImage1] = useState<UploadedImage | null>(null);
  const [faceImage2, setFaceImage2] = useState<UploadedImage | null>(null);
  const [styleImage, setStyleImage] = useState<UploadedImage | null>(null);
  const [analysisImage, setAnalysisImage] = useState<UploadedImage | null>(null);
  
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [alternativeImages, setAlternativeImages] = useState<string[]>([]);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>('9:16');
  
  // Persisted state from localStorage
  const [stylePreset, setStylePreset] = useState<StylePreset>(() => {
    return (localStorage.getItem('gemini-image-gen-stylePreset') as StylePreset) || 'none';
  });
  const [negativePrompt, setNegativePrompt] = useState<string>(() => {
    return localStorage.getItem('gemini-image-gen-negativePrompt') || '';
  });
  
  // Persist advanced settings to localStorage
  useEffect(() => {
    localStorage.setItem('gemini-image-gen-stylePreset', stylePreset);
  }, [stylePreset]);

  useEffect(() => {
    localStorage.setItem('gemini-image-gen-negativePrompt', negativePrompt);
  }, [negativePrompt]);
  
  const handleImageUpload = (file: File, setter: React.Dispatch<React.SetStateAction<UploadedImage | null>>) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1];
          setter({
              data: base64String,
              mimeType: file.type,
              previewUrl: URL.createObjectURL(file)
          });
        }
      };
      reader.readAsDataURL(file);
  }

  const handleImageUpload1 = (file: File) => handleImageUpload(file, setFaceImage1);
  const handleImageUpload2 = (file: File) => handleImageUpload(file, setFaceImage2);
  const handleImageUpload3 = (file: File) => handleImageUpload(file, setStyleImage);
  const handleAnalysisUpload = (file: File) => handleImageUpload(file, setAnalysisImage);

  const handleImageRemove1 = () => { if (faceImage1) URL.revokeObjectURL(faceImage1.previewUrl); setFaceImage1(null); };
  const handleImageRemove2 = () => { if (faceImage2) URL.revokeObjectURL(faceImage2.previewUrl); setFaceImage2(null); };
  const handleImageRemove3 = () => { if (styleImage) URL.revokeObjectURL(styleImage.previewUrl); setStyleImage(null); };
  const handleAnalysisRemove = () => { if (analysisImage) URL.revokeObjectURL(analysisImage.previewUrl); setAnalysisImage(null); };
  
  const isAdvancedDisabled = !!(faceImage1 || faceImage2 || styleImage);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) {
        setImageError("Por favor, insira um prompt antes de aprimorar.");
        return;
    }
    if (isAdvancedDisabled) return;
    
    setIsEnhancing(true);
    setImageError(null);
    try {
        setOriginalPrompt(prompt);
        const enhancedPrompt = await enhancePromptWithSearch(prompt);
        setPrompt(enhancedPrompt);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message.replace('Gemini API Error: ', '') : "Ocorreu um erro desconhecido.";
        setImageError(`Falha ao aprimorar o prompt: ${errorMessage}`);
    } finally {
        setIsEnhancing(false);
    }
  }, [prompt, isAdvancedDisabled]);

  const handleAnalyzeImage = async () => {
      if (!analysisImage) return;

      setIsAnalyzing(true);
      setImageError(null);
      try {
          const generatedPrompt = await analyzeImageForPrompt({
              data: analysisImage.data,
              mimeType: analysisImage.mimeType
          });
          setPrompt(generatedPrompt);
          // Optional: Open the main prompt area if needed, or scroll to it
          setIsAnalysisOpen(false); // Close accordion to show results in prompt box
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to analyze image.";
          setImageError(errorMessage);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleRevertPrompt = () => {
      if (originalPrompt) {
          setPrompt(originalPrompt);
          setOriginalPrompt('');
      }
  };


  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setImageError("O prompt não pode estar vazio.");
      return;
    }
    setIsImageLoading(true);
    setImageError(null);
    setHasGenerated(true);
    setOriginalPrompt(''); // Clear revert state on new generation

    const isEditingMode = !!(faceImage1 || faceImage2 || styleImage);
    let workingPrompt = prompt;

    try {
      if (stylePreset !== 'none' && !isEditingMode) {
        workingPrompt = `${workingPrompt}, ${stylePresetSuffixes[stylePreset]}`;
      }

      const finalPrompt = workingPrompt;

      const imagesToProcess: InputImage[] = [];
      if (styleImage) imagesToProcess.push({ data: styleImage.data, mimeType: styleImage.mimeType });
      if (faceImage1) imagesToProcess.push({ data: faceImage1.data, mimeType: faceImage1.mimeType });
      if (faceImage2) imagesToProcess.push({ data: faceImage2.data, mimeType: faceImage2.mimeType });

      const finalNegativePrompt = !isEditingMode && negativePrompt.trim() ? negativePrompt : undefined;

      const generatedImages = await generateImage(
        finalPrompt,
        imagesToProcess,
        imageAspectRatio,
        finalNegativePrompt
      );

      if (generatedImages && generatedImages.length > 0) {
        const mainImageData = generatedImages[0];
        const newMainImageUrl = `data:${mainImageData.mimeType};base64,${mainImageData.data}`;
        setMainImageUrl(newMainImageUrl);
        
        const newAlternativeUrls = generatedImages.slice(1).map(img => `data:${img.mimeType};base64,${img.data}`);
        setAlternativeImages(newAlternativeUrls);

        setDisplayedPrompt(finalPrompt);
      } else {
        throw new Error("A API não retornou uma imagem.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setImageError(`Falha ao gerar imagem: ${errorMessage}`);
      setMainImageUrl(null);
      setAlternativeImages([]);
    } finally {
      setIsImageLoading(false);
    }
  }, [prompt, faceImage1, faceImage2, styleImage, imageAspectRatio, stylePreset, negativePrompt]);
  
  const handleGenerateVariations = useCallback(async () => {
      if (!mainImageUrl || !displayedPrompt) return;
      
      setIsImageLoading(true);
      setImageError(null);
      
      try {
          const match = mainImageUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
          if (!match) throw new Error("Dados de imagem inválidos");
          const mimeType = match[1];
          const data = match[2];
          const inputImage: InputImage = { mimeType, data };
          
          const generatedImages = await generateImage(
              displayedPrompt,
              [inputImage],
              imageAspectRatio,
              negativePrompt
          );

          if (generatedImages && generatedImages.length > 0) {
               const mainImageData = generatedImages[0];
               const newMainImageUrl = `data:${mainImageData.mimeType};base64,${mainImageData.data}`;
               setMainImageUrl(newMainImageUrl);
               
               const newAlternativeUrls = generatedImages.slice(1).map(img => `data:${img.mimeType};base64,${img.data}`);
               setAlternativeImages(newAlternativeUrls);
          } else {
               throw new Error("A API não retornou variações.");
          }

      } catch (err) {
           const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
           setImageError(`Falha ao gerar variações: ${errorMessage}`);
      } finally {
           setIsImageLoading(false);
      }
  }, [mainImageUrl, displayedPrompt, imageAspectRatio, negativePrompt]);

  const handleImageUpdate = useCallback((newImageUrl: string, editPrompt: string) => {
      setMainImageUrl(newImageUrl);
      setAlternativeImages([]);
      setDisplayedPrompt(editPrompt);
  }, []);

  const handleSelectAlternative = (selectedUrl: string) => {
    if (!mainImageUrl) return;

    const newAlternatives = alternativeImages.filter(url => url !== selectedUrl);
    newAlternatives.push(mainImageUrl);

    setMainImageUrl(selectedUrl);
    setAlternativeImages(newAlternatives);
  };

  return (
    <div>
      <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="w-full lg:w-1/3 lg:max-w-md flex flex-col gap-4 sticky top-8">
            <h2 className="text-3xl font-bold text-indigo-400">Gerador de Imagens Pro</h2>
            
            {/* Analysis / Reverse Prompt Section */}
            <div className={`bg-gray-800 border-2 ${isAnalysisOpen ? 'border-indigo-500' : 'border-gray-700'} rounded-lg transition-all`}>
                <button
                    onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                    disabled={isImageLoading}
                    className="w-full flex items-center justify-between p-3 font-semibold text-gray-300 hover:bg-gray-700/50 focus:outline-none rounded-lg"
                >
                    <div className="flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <span>Analisar Imagem (Reverse Prompt)</span>
                    </div>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isAnalysisOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                
                {isAnalysisOpen && (
                    <div className="p-4 border-t border-gray-700 flex flex-col gap-3">
                        <p className="text-xs text-gray-400">
                            Envie uma imagem para extrair um prompt detalhado (pose, câmera, luz) e recriá-la.
                        </p>
                        <ImageUpload 
                            label="Enviar para Análise"
                            onImageUpload={handleAnalysisUpload} 
                            onImageRemove={handleAnalysisRemove} 
                            imagePreviewUrl={analysisImage?.previewUrl} 
                            disabled={isAnalyzing || isImageLoading} 
                        />
                        <button
                            onClick={handleAnalyzeImage}
                            disabled={!analysisImage || isAnalyzing}
                            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? <Spinner /> : null}
                            {isAnalyzing ? "Analisando..." : "Extrair Prompt & Preparar"}
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-indigo-400 mt-4">
                Edição & Combinação
            </h3>
            
            <ImageUpload 
              label="Imagem Principal"
              onImageUpload={handleImageUpload1} 
              onImageRemove={handleImageRemove1} 
              imagePreviewUrl={faceImage1?.previewUrl} 
              disabled={isImageLoading} 
            />
            {/* Collapsible secondary inputs to save vertical space if needed, keeping them visible for now per request */}
            <ImageUpload 
              label="Segunda Imagem (Opcional)"
              onImageUpload={handleImageUpload2} 
              onImageRemove={handleImageRemove2} 
              imagePreviewUrl={faceImage2?.previewUrl} 
              disabled={isImageLoading} 
            />
             <ImageUpload 
              label="Imagem de Estilo (Referência)"
              onImageUpload={handleImageUpload3} 
              onImageRemove={handleImageRemove3} 
              imagePreviewUrl={styleImage?.previewUrl} 
              disabled={isImageLoading} 
            />

            <div className="flex flex-col gap-4 border-t border-gray-700 pt-4 mt-2">
                <PromptEnhancer 
                  onEnhance={handleEnhancePrompt} 
                  isEnhancing={isEnhancing} 
                  disabled={isAdvancedDisabled || isImageLoading} 
                  canRevert={!!originalPrompt}
                  onRevert={handleRevertPrompt}
                />
                <p className="text-gray-500 text-xs -mt-2">
                  Use a Pesquisa Google para adicionar detalhes ao seu prompt.
                </p>
                
                <PromptInput 
                    value={prompt} 
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        setOriginalPrompt('');
                    }} 
                    disabled={isImageLoading || isEnhancing || isAnalyzing} 
                    placeholder={
                        isAdvancedDisabled 
                        ? "Descreva como você quer combinar ou editar a(s) imagem(ns)..."
                        : "ex: Um leão majestoso usando uma coroa, iluminação cinematográfica..."
                    }
                />
                <AspectRatioSelector
                  selectedRatio={imageAspectRatio}
                  onRatioChange={setImageAspectRatio}
                  disabled={isAdvancedDisabled}
                />
                <AdvancedSettings
                  style={stylePreset}
                  onStyleChange={setStylePreset}
                  negativePrompt={negativePrompt}
                  onNegativePromptChange={setNegativePrompt}
                  disabled={isAdvancedDisabled}
                />
                <GenerateButton onClick={handleGenerateImage} isLoading={isImageLoading} disabled={isEnhancing || isAnalyzing}>
                  Gerar Imagem
                </GenerateButton>
                <ErrorDisplay error={imageError} />
            </div>

          </div>
          <div className="w-full lg:w-2/3 flex flex-col md:flex-row items-start gap-6">
            <div className="flex-grow w-full flex items-center justify-center">
              {hasGenerated ? (
                <ImageDisplay 
                    imageUrl={mainImageUrl} 
                    isLoading={isImageLoading} 
                    prompt={displayedPrompt} 
                    onImageUpdate={handleImageUpdate}
                    aspectRatio={imageAspectRatio}
                    onGenerateVariations={handleGenerateVariations}
                  />
              ) : (
                <WelcomeScreen />
              )}
            </div>

            {!isImageLoading && alternativeImages.length > 0 && (
              <div className="w-full md:w-40 flex-shrink-0">
                <h3 className="text-lg font-bold text-indigo-400 mb-4 text-center md:text-left">Outras Opções</h3>
                <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-x-visible pb-2">
                  {alternativeImages.map((altUrl, index) => (
                    <div
                      key={`${altUrl.slice(-20)}-${index}`}
                      className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 flex-shrink-0 w-32 h-32 md:w-full md:h-auto"
                      onClick={() => handleSelectAlternative(altUrl)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleSelectAlternative(altUrl); }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select alternative image ${index + 1}`}
                    >
                      <img src={altUrl} alt={`Alternative ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-sm font-semibold text-center">Escolher esta</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
         </div>
    </div>
  );
};

export default ImageGenerator;