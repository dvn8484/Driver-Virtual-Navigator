import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
// Keep AspectRatio type for ImageGenerator page
// FIX: Import AspectRatio from the new types.ts file.
import { AspectRatio } from "../types";


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Image Gen Types
interface GeneratedImageData {
  data: string;
  mimeType: string;
}

export interface InputImage {
    data: string;
    mimeType: string;
}

const getFriendlyErrorMessage = (response: any): string => {
  const promptBlockReason = response.promptFeedback?.blockReason;
  if (promptBlockReason) {
    switch (promptBlockReason) {
      case 'SAFETY':
        return "Seu prompt foi bloqueado por motivos de segurança. Por favor, modifique seu prompt e tente novamente. Prompts sexualmente sugestivos, odiosos, de assédio ou que retratam violência não são permitidos.";
      case 'OTHER':
        return "Seu prompt foi bloqueado por um motivo não especificado. Por favor, tente modificar seu prompt.";
      default:
        return `Seu prompt foi bloqueado. Motivo: ${promptBlockReason}. Por favor, modifique seu prompt.`;
    }
  }

  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    const finishReason = candidate.finishReason;
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'FINISH_REASON_UNSPECIFIED') {
      switch (finishReason) {
        case 'SAFETY':
        case 'IMAGE_SAFETY':
          return "O conteúdo gerado foi bloqueado pelos filtros de segurança. Isso pode acontecer com prompts que estão no limite de nossa política. Por favor, ajuste seu prompt ou imagem e tente novamente.";
        case 'RECITATION':
          return "A solicitação foi bloqueada porque poderia ter criado conteúdo muito semelhante a material protegido por direitos autorais. Por favor, tente um prompt mais original.";
        case 'MAX_TOKENS':
            return "A solicitação é muito longa para ser processada. Por favor, tente um prompt mais curto.";
        case 'OTHER':
        case 'IMAGE_OTHER':
          return "A geração da imagem falhou por um motivo temporário. Por favor, tente novamente em alguns instantes ou modifique levemente seu prompt.";
        default:
          return `A geração da imagem falhou inesperadamente. (Motivo: ${finishReason})`;
      }
    }
  }

  if (response.candidates) {
    const imagePart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);
    if (!imagePart) {
        const textResponse = response.text;
        if (textResponse) {
            return `A IA não conseguiu gerar uma imagem e retornou texto em vez disso: "${textResponse.trim()}"`;
        }
        return "Nenhum dado de imagem foi retornado. Isso pode acontecer se a solicitação não for clara ou se for bloqueada por motivos não especificados. Por favor, reformule seu prompt.";
    }
  } 
  
  // For older/other model response structures
  if ('generatedImages' in response && (!response.generatedImages || response.generatedImages.length === 0)) {
    return "Nenhum dado de imagem foi retornado. Isso pode acontecer se a solicitação for bloqueada por motivos não especificados. Por favor, reformule seu prompt.";
  }
  
  return "Ocorreu um erro desconhecido durante a geração da imagem.";
};


// EXISTING functions for image generation
export const enhancePromptWithSearch = async (prompt: string): Promise<string> => {
    try {
        const systemInstruction = `Based on the user's query and up-to-date search results, generate a single, highly detailed, and visually descriptive paragraph. This paragraph will be used as a prompt for an AI image generator. Focus on creating a rich scene by describing objects, atmosphere, lighting, composition, and specific visual details. Do not ask questions or offer options; provide a complete, ready-to-use prompt.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: systemInstruction,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The API did not return an enhanced prompt.");
        }
        return text;

    } catch (error) {
        console.error("Error enhancing prompt with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while enhancing the prompt.");
    }
}

export const analyzeImageForPrompt = async (image: InputImage): Promise<string> => {
    try {
        const systemInstruction = `
            Você é um especialista em Engenharia de Prompt para IA e Análise de Imagens.
            Sua tarefa é analisar a imagem fornecida e escrever um prompt de texto altamente detalhado EM PORTUGUÊS que possa ser usado para recriar esta imagem exata usando um gerador de imagens (como o Gemini ou Stable Diffusion).
            
            Concentre-se fortemente nos seguintes aspectos para descrever a imagem:
            1. **Assunto**: Aparência detalhada, roupas, expressão facial, pose exata e ação.
            2. **Câmera e Ângulo**: Especifique o ângulo da câmera (ex: ângulo baixo, vista aérea, close-up, plano geral), tipo de lente sugerida e profundidade de campo (fundo desfocado ou nítido).
            3. **Iluminação**: Descreva a iluminação (ex: cinematográfica, natural, volumétrica, luz de estúdio, hora dourada, contraste).
            4. **Estilo**: O estilo artístico visual (ex: fotorrealista, pintura a óleo, renderização 3D, cyberpunk, anime, fotografia analógica).
            5. **Ambiente**: Detalhes do fundo, atmosfera, cores predominantes e texturas.

            Saída APENAS a string bruta do prompt em Português. Não inclua texto introdutório como "Aqui está o prompt". O texto deve ser descritivo e pronto para ser usado como input de geração.
        `;

        const parts = [
            {
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType
                }
            },
            {
                text: "Analise esta imagem e crie um prompt de geração detalhado em português."
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4, // Lower temperature for more precise description
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Could not analyze the image.");
        }
        return text.trim();

    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Failed to analyze image prompt.");
    }
};


export const generateImage = async (
  prompt: string,
  images?: InputImage[],
  aspectRatio: AspectRatio = '9:16',
  negativePrompt?: string,
): Promise<GeneratedImageData[]> => {
  try {
    const parts: any[] = [];

    // Handle Input Images (for editing/variations)
    if (images && images.length > 0) {
        for (const image of images) {
            if (image.data && image.mimeType) {
                parts.push({
                    inlineData: {
                        data: image.data,
                        mimeType: image.mimeType
                    }
                });
            }
        }
    }

    let finalPrompt = prompt;

    // Append aspect ratio guidance for Flash Image (it follows text instructions)
    // Flash Image doesn't support 'aspectRatio' in config, so we prompt for it.
    if (aspectRatio === '16:9') {
        finalPrompt += " . Wide cinematic aspect ratio 16:9.";
    } else if (aspectRatio === '9:16') {
        finalPrompt += " . Tall portrait aspect ratio 9:16.";
    } else if (aspectRatio === '1:1') {
        finalPrompt += " . Square aspect ratio 1:1.";
    }

    // Append Negative Prompt
    if (negativePrompt) {
        finalPrompt += ` . Exclude: ${negativePrompt}`;
    }

    parts.push({ text: finalPrompt });

    // Use gemini-2.5-flash-image for ALL generations for better reliability and consistency.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts,
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        return [{
            data: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        }];
    } else {
        const err = new Error(getFriendlyErrorMessage(response));
        err.name = "FriendlyError";
        throw err;
    }

  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    if (error instanceof Error) {
        if (error.name === "FriendlyError") {
            throw error;
        }
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
};