// src/types.ts

export interface User {
  email: string;
  isPremium: boolean;
}

export interface NutritionInformation {
  calories: string;
  fatContent?: string;
  saturatedFatContent?: string;
  cholesterolContent?: string;
  sodiumContent?: string;
  carbohydrateContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  proteinContent?: string;
}

export interface AggregateRating {
  ratingValue: string;
  ratingCount: string;
}

export interface InstructionStep {
  stepName: string;
  stepText: string;
  imagePrompt: string;
}

export interface RecipeIdea {
  title: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  keywords: string;
  recipeYield: string;
  recipeCategory: string;
  nutrition: NutritionInformation;
  aggregateRating: AggregateRating;
  mainImagePrompts: string[];
  ingredients: string[];
  instructions: InstructionStep[];
  chefPersonalityFeedback?: string;
  imageUrl?: string;
}