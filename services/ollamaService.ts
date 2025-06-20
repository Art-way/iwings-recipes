// src/services/ollamaService.ts

import axios from 'axios';
import { RecipeIdea, InstructionStep, NutritionInformation, AggregateRating } from '../types';

const OLLAMA_API_URL = 'https://suddenly-aware-skink.ngrok-free.app/api/chat'; // Ensure this is current// src/services/ollamaService.ts
// ... (imports and OLLAMA_API_URL remain the same) ...

const normalizeAndCreateRecipeIdea = (rawData: any): RecipeIdea | null => {
    if (!rawData || typeof rawData !== 'object') {
        console.warn("[OllamaService Normalizer] Input rawData is not an object, cannot normalize:", rawData);
        return null;
    }
    console.log("[OllamaService Normalizer] Normalizing raw data:", JSON.stringify(rawData, null, 2));

    // ... (nutrition, ingredients, keywords, mainImagePrompts normalization - KEEP AS IS from previous correct version) ...
    // Fix " nutrition" key and "carbsContent"
    const nutritionInput = rawData.nutrition || rawData[' nutrition'] || {};
    const fixedNutrition: NutritionInformation = {
        calories: String(nutritionInput.calories || "N/A"),
        fatContent: String(nutritionInput.fatContent || "N/A"),
        saturatedFatContent: String(nutritionInput.saturatedFatContent || "N/A"),
        cholesterolContent: String(nutritionInput.cholesterolContent || "N/A"),
        sodiumContent: String(nutritionInput.sodiumContent || "N/A"),
        carbohydrateContent: String(nutritionInput.carbohydrateContent || nutritionInput.carbsContent || "N/A"),
        fiberContent: String(nutritionInput.fiberContent || "N/A"),
        sugarContent: String(nutritionInput.sugarContent || "N/A"),
        proteinContent: String(nutritionInput.proteinContent || "N/A"),
    };

    let ingredientsArray: string[];
    if (Array.isArray(rawData.ingredients)) {
        ingredientsArray = rawData.ingredients.map((ing: any) => {
            if (typeof ing === 'object' && ing !== null && ing.name) {
                return String(ing.name);
            }
            return String(ing);
        }).filter(name => name.trim() !== "");
    } else if (typeof rawData.ingredients === 'string') {
        ingredientsArray = [String(rawData.ingredients)];
    } else {
        ingredientsArray = [];
    }

    let keywordsString: string;
    if (Array.isArray(rawData.keywords)) {
        keywordsString = rawData.keywords.map(String).join(", ");
    } else if (typeof rawData.keywords === 'string') {
        keywordsString = rawData.keywords;
    } else {
        keywordsString = "";
    }

    let mainImagePromptsArray: string[];
    if (Array.isArray(rawData.mainImagePrompts)) {
        mainImagePromptsArray = rawData.mainImagePrompts.map(String).slice(0,3);
    } else if (typeof rawData.mainImagePrompts === 'string') {
        mainImagePromptsArray = [String(rawData.mainImagePrompts)];
    } else {
        mainImagePromptsArray = [`A delicious image of ${rawData.title || 'the recipe'}`];
    }
    while(mainImagePromptsArray.length < 3) {
        mainImagePromptsArray.push(`Another appealing view of ${rawData.title || 'the dish'}`);
    }
    mainImagePromptsArray = mainImagePromptsArray.slice(0, 3);


    // --- MODIFIED INSTRUCTIONS HANDLING ---
    const instructionsInput = rawData.instructions || rawData.assembleInstructions; // Could be an object or an array
    let instructionsArray: InstructionStep[] = [];

    if (Array.isArray(instructionsInput)) {
        // If it's already an array (Ollama got it right or a future fix)
        instructionsArray = instructionsInput.map((instr: any, index: number): InstructionStep => {
            let currentInstr = instr;
            if (typeof currentInstr === 'string') {
                try { currentInstr = JSON.parse(currentInstr); }
                catch (e) { return { stepName: `Step ${index + 1} (Raw String)`, stepText: instr, imagePrompt: `Image for raw step ${index + 1}` }; }
            }
            if (typeof currentInstr !== 'object' || currentInstr === null) {
                return { stepName: `Step ${index + 1} (Malformed)`, stepText: "Invalid instruction data", imagePrompt: `Image for malformed step ${index + 1}`};
            }
            return {
                stepName: String(currentInstr.stepName || `Step ${index + 1}`),
                stepText: String(currentInstr.stepText || "No step text provided."),
                imagePrompt: String(currentInstr.imagePrompt || `Image for ${currentInstr.stepName || `step ${index + 1}`}`),
            };
        });
    } else if (typeof instructionsInput === 'object' && instructionsInput !== null) {
        // If it's an object (like { "step1": "...", "step2": "..." }) - YOUR CURRENT CASE
        console.log("[OllamaService Normalizer] Instructions received as an object, converting to array.");
        Object.keys(instructionsInput).forEach((key, index) => {
            // Assuming keys like "step1", "step2" or just ordered keys
            const stepText = String(instructionsInput[key]);
            const stepNumberMatch = key.match(/\d+/); // Try to extract number from key
            const stepName = stepNumberMatch ? `Step ${stepNumberMatch[0]}` : `Step ${index + 1}`;

            instructionsArray.push({
                stepName: stepName,
                stepText: stepText,
                // Ollama isn't providing image prompts per step in this object format, so generate a default
                imagePrompt: `Image for ${stepName}: ${stepText.substring(0, 30)}...`
            });
        });
    }
    // If instructionsInput was undefined or some other type, instructionsArray remains []
    // --- END OF MODIFIED INSTRUCTIONS HANDLING ---

    const recipe: RecipeIdea = {
        title: String(rawData.title || "Untitled Recipe (Normalized)"),
        description: String(rawData.description || "No description provided."),
        cuisine: String(rawData.cuisine || "Unknown"),
        prepTime: String(rawData.prepTime || "PT0M"), // Should be ISO 8601
        cookTime: String(rawData.cookTime || "PT0M"), // Should be ISO 8601
        totalTime: String(rawData.totalTime || "PT0M"), // Should be ISO 8601, and sum of others
        keywords: keywordsString,
        recipeYield: String(rawData.recipeYield || "N/A"),
        recipeCategory: String(rawData.recipeCategory || "N/A"),
        nutrition: fixedNutrition,
        aggregateRating: { // Handle aggregateRating potentially being a string "4/5"
            ratingValue: String((rawData.aggregateRating && typeof rawData.aggregateRating === 'string' ? rawData.aggregateRating.split('/')[0] : rawData.aggregateRating?.ratingValue) || "4.5"),
            ratingCount: String((rawData.aggregateRating && typeof rawData.aggregateRating === 'string' ? '1' : rawData.aggregateRating?.ratingCount) || "50"), // Default count if only simple rating string
        } as AggregateRating,
        mainImagePrompts: mainImagePromptsArray,
        ingredients: ingredientsArray,
        instructions: instructionsArray, // Now correctly populated
        chefPersonalityFeedback: typeof rawData.chefPersonalityFeedback === 'string' ? rawData.chefPersonalityFeedback : undefined,
        imageUrl: typeof rawData.imageUrl === 'string' ? rawData.imageUrl : undefined,
    };

    // Also, ensure time fields are somewhat valid ISO 8601, or default them
    const timeRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    if (!timeRegex.test(recipe.prepTime) && recipe.prepTime !== "PT0M") recipe.prepTime = "PT0M"; // Basic check, could be more robust
    if (!timeRegex.test(recipe.cookTime) && recipe.cookTime !== "PT0M") recipe.cookTime = "PT0M";
    if (!timeRegex.test(recipe.totalTime) && recipe.totalTime !== "PT0M") recipe.totalTime = "PT0M";


    if (recipe.title.toLowerCase().includes("untitled") && recipe.ingredients.length === 0 && recipe.instructions.length === 0) {
        console.warn("[OllamaService Normalizer] Normalized recipe is still too incomplete, discarding:", recipe);
        return null;
    }
    console.log("[OllamaService Normalizer] Successfully normalized recipe:", recipe);
    return recipe;
};

// ... (rest of generateRecipeIdeasWithOllama function - KEEP AS IS from previous correct version)
export const generateRecipeIdeasWithOllama = async (
  ingredientsInput: string[],
  cuisine?: string,
  dietaryRestrictions?: string[],
  chefPersonality?: string,
): Promise<RecipeIdea[]> => {
  console.log('[OllamaService] Called generateRecipeIdeasWithOllama.');
  let userPrompt = `Generate 1 creative recipe idea based on the following ingredients: ${ingredientsInput.join(", ")}.`;
  if (cuisine) userPrompt += ` The recipe should fit a ${cuisine} cuisine style.`;
  if (dietaryRestrictions && dietaryRestrictions.length > 0) userPrompt += ` Accommodate these restrictions: ${dietaryRestrictions.join(", ")}.`;
  if (chefPersonality) userPrompt += ` Describe it with this personality: "${chefPersonality}".`;

  const systemInstruction = `You are an expert recipe data generator for SEO. Your output MUST be a single, valid JSON object.
This JSON object should ideally follow this structure: { "recipes": [RecipeIdea] }.
RecipeIdea is: { title: string, description: string, cuisine: string, prepTime: string (ISO 8601 format like "PT15M"), cookTime: string (ISO 8601 format like "PT30M"), totalTime: string (ISO 8601 format), keywords: string (comma-separated), recipeYield: string, recipeCategory: string, nutrition: { calories: string, fatContent?: string, carbohydrateContent?: string ... }, aggregateRating: { ratingValue: string (e.g., "4.5"), ratingCount: string (e.g., "60") }, mainImagePrompts: string[3], ingredients: string[], instructions: { stepName: string, stepText: string, imagePrompt: string }[], chefPersonalityFeedback?: string }.
If you generate only one recipe, it MUST be inside the 'recipes' array: {"recipes": [ { ...the recipe... } ]}.
The 'ingredients' field MUST be an array of strings. The 'instructions' field MUST be an array of step objects, each with 'stepName', 'stepText', and 'imagePrompt'.
The 'mainImagePrompts' field MUST be an array of 3 strings. Provide sensible defaults if unsure.
The 'nutrition' key must be 'nutrition' (no leading space) and its sub-key for carbs should be 'carbohydrateContent'.
The 'aggregateRating' must be an object like {"ratingValue": "4.5", "ratingCount": "75"}.
All time durations (prepTime, cookTime, totalTime) MUST be in ISO 8601 duration format (e.g., "PT15M" for 15 minutes, "PT1H30M" for 1 hour 30 minutes).
`;

  const requestBody = {
      messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
      ]
  };
  console.log(`[OllamaService] Sending request to API: ${OLLAMA_API_URL}`);
  try {
    const response = await axios.post(OLLAMA_API_URL, requestBody);
    const responseData = response.data;
    console.log("[OllamaService] Raw response data from API:", JSON.stringify(responseData, null, 2));

    let finalRecipes: RecipeIdea[] = [];

    if (responseData && typeof responseData === 'object' && responseData !== null) {
        if (Array.isArray(responseData.recipes)) {
            finalRecipes = responseData.recipes
                .filter((item: any) => typeof item === 'object' && item !== null)
                .map((recipeData: any) => normalizeAndCreateRecipeIdea(recipeData))
                .filter((recipe: RecipeIdea | null): recipe is RecipeIdea => recipe !== null);
        } else if (responseData.title || responseData.description || responseData.ingredients) {
            console.warn("[OllamaService] No 'recipes' array, but top-level data looks like a recipe. Normalizing.");
            const singleRecipe = normalizeAndCreateRecipeIdea(responseData);
            if (singleRecipe) {
                finalRecipes.push(singleRecipe);
            }
        } else {
            console.warn("[OllamaService] API response structure is unexpected. Raw data:", responseData);
        }
    } else {
        console.error("[OllamaService] API response was not a valid object or was null. Raw data:", responseData);
        throw new Error("Invalid or null response received from the recipe API.");
    }

    if (finalRecipes.length === 0) {
        console.warn("[OllamaService] No valid recipes could be extracted or transformed from API response.");
    }
    console.log(`[OllamaService] Successfully processed. Returning ${finalRecipes.length} recipes.`);
    return finalRecipes;

  } catch (error) {
    console.error("[OllamaService] Exception during recipe generation or processing:", error);
    let errorMessage = "Failed to generate recipes. ";
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
            errorMessage += "Connection Error: Could not connect to the recipe API server.";
        } else if (error.response) {
            errorMessage += `API Server Error (${error.response.status}): ${JSON.stringify(error.response.data?.error || error.response.data || 'Unknown error from server.')}`;
        } else if (error.request) {
            errorMessage += "No response received from the recipe API server.";
        } else {
            errorMessage += `Network or request setup error: ${error.message}`;
        }
    } else if (error instanceof Error) {
        errorMessage += error.message;
    } else {
        errorMessage += "An unknown error occurred.";
    }
    throw new Error(errorMessage);
  }
};