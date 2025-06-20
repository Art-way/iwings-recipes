// src/components/RecipeCard.tsx

import React from 'react';
import { RecipeIdea, InstructionStep } from '../types'; // Ensure InstructionStep is imported

interface RecipeCardProps {
  recipe: RecipeIdea;
  isPremiumUser?: boolean;
  onExportRecipe?: (recipe: RecipeIdea) => void;
  onDownloadImage?: (recipe: RecipeIdea) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isPremiumUser, onExportRecipe, onDownloadImage }) => {
  
  const handleExport = () => {
    if (onExportRecipe) {
      onExportRecipe(recipe);
    }
  };

  const handleDownloadImageClick = () => {
    // Ensure onDownloadImage is a function and recipe.imageUrl exists
    if (typeof onDownloadImage === 'function' && recipe.imageUrl) {
      onDownloadImage(recipe);
    } else if (!recipe.imageUrl) {
        console.warn("Download image clicked, but no imageUrl present on recipe:", recipe.title);
    }
  };

  // Helper to safely access potentially missing nutrition details
  const getNutritionDetail = (detail: string | undefined | null, label: string): JSX.Element | null => {
    if (detail && detail !== "N/A" && detail.trim() !== "") {
      return <p className="text-xs"><span className="font-medium">{label}:</span> {detail}</p>;
    }
    return null;
  };

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] flex flex-col md:flex-row">
      {/* Image Display */}
      {recipe.imageUrl ? (
        <div className="md:w-1/3 w-full h-64 md:h-auto overflow-hidden bg-slate-700"> {/* Added bg-slate-700 for better loading perception */}
          <img 
            src={recipe.imageUrl} 
            alt={`Image of ${recipe.title}`} 
            className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" 
            crossOrigin="anonymous"
            onError={(e) => { 
              // Fallback for broken image URLs (e.g., if Gemini returns an error image link)
              console.warn("Image failed to load:", recipe.imageUrl, "for recipe:", recipe.title);
              (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image icon
              // Optionally, replace with a placeholder SVG dynamically
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent && !parent.querySelector('.placeholder-svg')) {
                const placeholder = document.createElement('div');
                placeholder.className = "w-full h-full flex items-center justify-center placeholder-svg"; // Add class to prevent multiple additions
                placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                parent.appendChild(placeholder);
              }
            }}
          />
        </div>
      ) : (
        <div className="md:w-1/3 w-full h-64 md:h-auto bg-slate-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Content Area */}
      <div className={`p-6 ${recipe.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-500 pr-2 flex-grow break-words">
            {recipe.title || "Untitled Recipe"}
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            {isPremiumUser && typeof onDownloadImage === 'function' && recipe.imageUrl && (
              <button
                onClick={handleDownloadImageClick}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                aria-label="Download recipe image"
              >
                Download Image
              </button>
            )}
            {isPremiumUser && typeof onExportRecipe === 'function' && (
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                aria-label="Export recipe as JSON"
              >
                Export JSON
              </button>
            )}
          </div>
        </div>

        {recipe.description && (
          <p className="text-sm text-slate-300 mb-4 italic">{recipe.description}</p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-slate-400 mb-5 border-b border-slate-700 pb-3">
          {recipe.prepTime && recipe.prepTime !== "PT0M" && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div><span className="font-medium text-slate-300">Prep:</span> <span className="ml-1">{recipe.prepTime}</span></div>
            </div>
          )}
          {recipe.cookTime && recipe.cookTime !== "PT0M" && (
             <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 1.014C20.5 5 21 8 21 10c2 1 2.657 1.343 2.657 1.343a8 8 0 01-6.000 7.314zM12 6c0 2-2 4-2 4s2-2 2-4z" />
              </svg>
              <div><span className="font-medium text-slate-300">Cook:</span> <span className="ml-1">{recipe.cookTime}</span></div>
            </div>
          )}
           {recipe.totalTime && recipe.totalTime !== "PT0M" && (
             <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-sky-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <div><span className="font-medium text-slate-300">Total:</span> <span className="ml-1">{recipe.totalTime}</span></div>
            </div>
          )}
          {recipe.recipeYield && recipe.recipeYield !== "N/A" && (
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                <div><span className="font-medium text-slate-300">Yield:</span> <span className="ml-1">{recipe.recipeYield}</span></div>
            </div>
          )}
          {recipe.cuisine && (
            <div className="flex items-center col-span-1 md:col-span-1"> {/* Allow cuisine to take more space if needed */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.061L6.055 11m1.682 5.061L10.055 11m4.89 5.061l1.682-5.061M16.263 16.061L17.945 11m-1.682 5.061l1.682-5.061M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                <div><span className="font-medium text-slate-300">Cuisine:</span> <span className="ml-1">{recipe.cuisine}</span></div>
            </div>
          )}
          {recipe.recipeCategory && recipe.recipeCategory !== "N/A" && (
             <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-pink-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" /></svg>
                <div><span className="font-medium text-slate-300">Category:</span> <span className="ml-1">{recipe.recipeCategory}</span></div>
            </div>
          )}
        </div>
        
        {/* Keywords - only display if keywords string is not empty */}
        {recipe.keywords && recipe.keywords.trim() !== "" && (
            <div className="mb-5">
                <h4 className="text-md font-semibold text-sky-400 mb-1.5">Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                {recipe.keywords.split(',').map((keyword, index) => {
                    const trimmedKeyword = keyword.trim();
                    if (trimmedKeyword) { // Only display non-empty keywords
                        return (
                            <span key={index} className="px-2.5 py-1 text-xs font-medium bg-slate-700 text-sky-300 rounded-full">
                                {trimmedKeyword}
                            </span>
                        );
                    }
                    return null;
                })}
                </div>
            </div>
        )}
        
        {/* Ingredients */}
        {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
          <div className="mb-5">
            <h4 className="text-lg font-semibold text-sky-400 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm pl-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Instructions */}
        {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
          <div className="mb-5">
            <h4 className="text-lg font-semibold text-sky-400 mb-2">Instructions:</h4>
            <div className="text-slate-300 text-sm space-y-3 prose prose-sm prose-invert max-w-none">
               {recipe.instructions.map((step: InstructionStep, index: number) => (
                  <div key={index} className="py-1">
                      <h5 className="font-semibold text-sky-300 mb-0.5">{step.stepName || `Step ${index + 1}`}</h5>
                      <p className="my-0 leading-relaxed">{step.stepText}</p>
                      {/* For debugging image prompts per step:
                        step.imagePrompt && step.imagePrompt.trim() !== "" && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">Prompt: {step.imagePrompt}</p>
                        )
                      */}
                  </div>
               ))}
            </div>
          </div>
        ) : (
            <div className="mb-5">
                <h4 className="text-lg font-semibold text-sky-400 mb-2">Instructions:</h4>
                <p className="text-slate-400 text-sm">No instructions provided for this recipe.</p>
            </div>
        )}

        {/* Nutrition Information - only display if calories are available */}
        {recipe.nutrition && recipe.nutrition.calories && recipe.nutrition.calories !== "N/A" && (
            <div className="mt-5 pt-4 border-t border-slate-700/50">
                <h5 className="text-md font-semibold text-green-400 mb-1.5">Nutrition (approx.):</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-slate-300">
                    {getNutritionDetail(recipe.nutrition.calories, "Calories")}
                    {getNutritionDetail(recipe.nutrition.fatContent, "Fat")}
                    {getNutritionDetail(recipe.nutrition.saturatedFatContent, "Saturated Fat")}
                    {getNutritionDetail(recipe.nutrition.carbohydrateContent, "Carbs")}
                    {getNutritionDetail(recipe.nutrition.fiberContent, "Fiber")}
                    {getNutritionDetail(recipe.nutrition.sugarContent, "Sugar")}
                    {getNutritionDetail(recipe.nutrition.proteinContent, "Protein")}
                    {getNutritionDetail(recipe.nutrition.sodiumContent, "Sodium")}
                    {getNutritionDetail(recipe.nutrition.cholesterolContent, "Cholesterol")}
                </div>
            </div>
        )}


        {/* Chef Personality Feedback */}
        {recipe.chefPersonalityFeedback && (
            <div className="mt-5 pt-4 border-t border-slate-700/50">
                <h5 className="text-sm font-semibold text-amber-400 mb-1">Chef's Note:</h5>
                <p className="text-xs text-slate-400 italic">{recipe.chefPersonalityFeedback}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;