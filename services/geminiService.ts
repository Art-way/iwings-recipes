// src/services/geminiService.ts
import { GoogleGenAI } from "@google/genai"; // Assuming this is the correct named export from esm.sh/@google/genai@1.5.1

const GEMINI_API_KEY_FROM_ENV = process.env.GEMINI_API_KEY;

// >>> DEFINITION FOR isApiKeyEffectivelyMissing <<<
const isApiKeyEffectivelyMissing = (): boolean => {
  return !GEMINI_API_KEY_FROM_ENV || 
         GEMINI_API_KEY_FROM_ENV.trim() === "" || 
         GEMINI_API_KEY_FROM_ENV === "undefined";
};
// >>> END OF DEFINITION <<<

let genAIInstance: GoogleGenAI | null = null;

if (!isApiKeyEffectivelyMissing()) { // Now this function call is valid
  try {
    // For @google/genai@1.5.1, the constructor was likely taking an object with the key
    genAIInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY_FROM_ENV });
    console.log('[GeminiService] GoogleGenAI SDK initialized successfully.');
  } catch (error) {
    console.error('[GeminiService] Failed to initialize GoogleGenAI SDK:', error);
    genAIInstance = null;
  }
} else {
  console.warn('[GeminiService] GoogleGenAI SDK not initialized due to missing API key. Image generation will use placeholders.');
}

export const generateImageWithGemini = async (imagePrompt: string, recipeTitleForSeed?: string): Promise<string> => {
    const safeRecipeTitle = recipeTitleForSeed || "default_recipe_title";
    console.log(`[GeminiService] Called generateImageWithGemini with prompt: "${imagePrompt}"`);

    if (isApiKeyEffectivelyMissing() || !genAIInstance) { // Also valid here
        console.warn(`[GeminiService] API Key missing or SDK not initialized. Returning placeholder for prompt: "${imagePrompt}".`);
        return `https://picsum.photos/seed/${safeRecipeTitle.replace(/\s+/g, '_')}_gemini_no_key/600/400`;
    }

    // IMPORTANT: Actual image generation logic for @google/genai@1.5.1
    // and your specific model needs to be implemented here if you have it.
    // The following is a placeholder.
    console.warn(`[GeminiService] Placeholder: True Gemini image generation logic needed for @google/genai@1.5.1 and chosen model. Prompt: "${imagePrompt}". Returning picsum URL.`);
    try {
        // Example if genAIInstance had a direct method (unlikely for image bytes with this SDK version):
        // const response = await genAIInstance.someImageGenerationMethod({ prompt: imagePrompt });
        // if (response && response.imageDataBase64) {
        //    return `data:image/jpeg;base64,${response.imageDataBase64}`;
        // }
        
        // Fallback to picsum
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate tiny delay for placeholder
        const seed = imagePrompt.replace(/[^a-z0-9]/gi, '_').substring(0, 30) || safeRecipeTitle.replace(/\s+/g, '_');
        return `https://picsum.photos/seed/${seed}/600/400`;

    } catch (error) {
        console.error(`[GeminiService] Exception during (simulated) image generation for prompt "${imagePrompt}":`, error);
        return `https://picsum.photos/seed/${safeRecipeTitle.replace(/\s+/g, '_')}_gemini_exception/600/400`;
    }
};