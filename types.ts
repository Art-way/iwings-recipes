
export interface RecipeIdea {
  title: string;
  description?: string; // Short description for the recipe
  ingredients: string[];
  instructions: string; // Newline-separated steps
  prepTime?: string;
  cookTime?: string;
  cuisine?: string;
  dietaryNotes?: string[];
  chefPersonalityFeedback?: string;
  imageUrl?: string; // To store URL/data URL of the generated image
}

// GeminiRecipeResponse removed as we are now using Puter.js and parsing directly.

export interface User {
  email: string;
  isPremium: boolean;
  // In a real app, you wouldn't store password here or on client-side
}
