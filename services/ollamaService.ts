// src/services/ollamaService.ts

import axios from 'axios';
import { RecipeIdea } from '../types';

const OLLAMA_API_URL = 'https://uncommon-obviously-mako.ngrok-free.app/api/chat';

/**
 * Generates rich recipe data by calling the local Ollama API.
 */
export const generateRecipeIdeasWithOllama = async (
  ingredients: string[],
  cuisine?: string,
  dietaryRestrictions?: string[],
  chefPersonality?: string,
): Promise<RecipeIdea[]> => {
  console.log('[OllamaService] Called generateRecipeIdeasWithOllama for rich export data.');

  let userPrompt = `Generate 1 creative recipe idea based on the following ingredients: ${ingredients.join(", ")}.`;
  if (cuisine) userPrompt += ` The recipe should fit a ${cuisine} cuisine style.`;
  if (dietaryRestrictions && dietaryRestrictions.length > 0) userPrompt += ` Accommodate these restrictions: ${dietaryRestrictions.join(", ")}.`;
  if (chefPersonality) userPrompt += ` Describe it with this personality: "${chefPersonality}".`;

  // --- THIS IS THE NEW, ADVANCED SYSTEM PROMPT ---
  const systemInstruction = `You are an expert recipe data generator for SEO. Your output MUST be a single, valid JSON object following this structure: { "recipes": RecipeIdea[] }.

The RecipeIdea interface you MUST generate is:
interface RecipeIdea {
  title: string; // The recipe title.
  description: string; // Brief, appealing recipe description.
  cuisine: string; // Estimate cuisine if not specified (e.g., "Italian").
  prepTime: string; // MUST be ISO 8601 format (e.g., "PT15M" for 15 minutes). Estimate if unknown.
  cookTime: string; // MUST be ISO 8601 format (e.g., "PT30M"). Estimate if unknown.
  totalTime: string; // MUST be ISO 8601 format (sum of prep and cook). Estimate if unknown.
  keywords: string; // Comma-separated string of keywords including main ingredients and cuisine.
  recipeYield: string; // How many servings (e.g., "4 servings"). Estimate.
  recipeCategory: string; // e.g., "Dinner", "Dessert", "Appetizer". Estimate.
  nutrition: { // Sensibly estimate all nutrition values based on ingredients.
    calories: string; // e.g., "450 calories"
    fatContent: string; // e.g., "20g"
    saturatedFatContent: string; // e.g., "8g"
    cholesterolContent: string; // e.g., "70mg"
    sodiumContent: string; // e.g., "500mg"
    carbohydrateContent: string; // e.g., "45g"
    fiberContent: string; // e.g., "5g"
    sugarContent: string; // e.g., "10g"
    proteinContent: string; // e.g., "25g"
  };
  aggregateRating: { // You MUST estimate these values.
    ratingValue: string; // A string number between "4.1" and "4.9".
    ratingCount: string; // A string number between "40" and "100".
  };
  mainImagePrompts: string[]; // An array of EXACTLY 3 strings. Each string is a detailed AI prompt to generate a photorealistic image for this recipe.
  ingredients: string[]; // A comprehensive list of all ingredients.
  instructions: { // An array of instruction objects.
    stepName: string; // A short name for the step, e.g., "Step 1: Prepare Vegetables".
    stepText: string; // The full text for the instruction.
    imagePrompt: string; // A detailed AI prompt for a photorealistic image of THIS specific step.
  }[];
  chefPersonalityFeedback?: string; // Optional feedback on the personality integration.
}

Do NOT include any markdown or text outside the single JSON object.`;

  console.log('[OllamaService] Sending request to local API...');
  
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ]
    });
    
    const parsedData = response.data;
    if (parsedData && Array.isArray(parsedData.recipes)) {
      console.log(`[OllamaService] Successfully received and validated ${parsedData.recipes.length} recipes.`);
      return parsedData.recipes as RecipeIdea[];
    } else {
      console.error("[OllamaService] Unexpected JSON structure from local API:", parsedData);
      throw new Error("The local AI's response was not in the expected recipe format.");
    }
  } catch (error) {
    console.error("[OllamaService] Exception during recipe generation with local API:", error);
    let errorMessage = "Failed to generate recipes. Please ensure the local Ollama API server is running.";
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') errorMessage = "Connection Error: Could not connect to the local API server.";
      else if (error.response) errorMessage = `API Server Error: ${error.response.data?.error || 'Unknown error from server.'}`;
    }
    throw new Error(errorMessage);
  }
};