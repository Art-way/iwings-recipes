// src/services/geminiService.ts

import { GoogleGenAI } from "@google/genai";
// RecipeIdea type is no longer needed here

const GEMINI_API_KEY = process.env.API_KEY;
const IMAGE_MODEL_NAME = "imagen-3.0-generate-002";

let ai: GoogleGenAI | null = null;

const isApiKeyEffectivelyMissing = () => {
  return !GEMINI_API_KEY || GEMINI_API_KEY.trim() === "" || GEMINI_API_KEY === "undefined";
};

if (!isApiKeyEffectivelyMissing()) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('[GeminiService] GoogleGenAI SDK for IMAGE generation initialized successfully.');
  } catch (error) {
    console.error('[GeminiService] Failed to initialize GoogleGenAI SDK:', error);
    ai = null;
  }
} else {
  console.warn('[GeminiService] GoogleGenAI SDK not initialized due to missing API key. Image generation will use placeholders.');
}

/**
 * Generates an image for a given recipe title using the Gemini API.
 * Falls back to a placeholder if the API key is missing or an error occurs.
 */
export const generateImageWithGemini = async (recipeTitle: string): Promise<string> => {
  console.log(`[GeminiService] Called generateImageWithGemini for: "${recipeTitle}"`);
  if (isApiKeyEffectivelyMissing() || !ai) {
    console.warn(`[GeminiService] API Key missing or SDK not initialized. Returning placeholder for "${recipeTitle}".`);
    return `https://picsum.photos/seed/${recipeTitle.replace(/\s+/g, '_')}_gemini_no_key/600/400`;
  }

  const imagePrompt = `Photorealistic, appetizing culinary photo of "${recipeTitle}", bright lighting, high quality, food photography style.`;
  console.log(`[GeminiService] Generating REAL image with prompt: "${imagePrompt}"`);

  try {
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image.imageBytes) {
      console.log(`[GeminiService] Successfully generated image for "${recipeTitle}".`);
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    console.warn(`[GeminiService] No imageBytes data found from Gemini. Returning placeholder.`);
    return `https://picsum.photos/seed/${recipeTitle.replace(/\s+/g, '_')}_gemini_no_data/600/400`;
  } catch (error) {
    console.error(`[GeminiService] Exception during image generation for "${recipeTitle}" with Gemini:`, error);
    return `https://picsum.photos/seed/${recipeTitle.replace(/\s+/g, '_')}_gemini_exception/600/400`;
  }
};