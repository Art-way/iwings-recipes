// src/components/RecipeCard.tsx

import React from 'react';
import { RecipeIdea, InstructionStep } from '../types'; // Import InstructionStep for clarity

interface RecipeCardProps {
  recipe: RecipeIdea;
  isPremiumUser?: boolean;
  onExportRecipe?: (recipe: RecipeIdea) => void;
  onDownloadImage?: (recipe: RecipeIdea) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isPremiumUser, onExportRecipe, onDownloadImage }) => {
  
  const handleExport = () => { if (onExportRecipe) onExportRecipe(recipe); };
  const handleDownloadImageClick = () => { if (onDownloadImage && recipe.imageUrl) onDownloadImage(recipe); };

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] flex flex-col md:flex-row">
      {recipe.imageUrl && (
        <div className="md:w-1/3 w-full h-64 md:h-auto overflow-hidden">
          <img src={recipe.imageUrl} alt={`Image of ${recipe.title}`} className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" crossOrigin="anonymous" />
        </div>
      )}
       {!recipe.imageUrl && (
        <div className="md:w-1/3 w-full h-64 md:h-auto bg-slate-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className={`p-6 ${recipe.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-500 pr-2 flex-grow">{recipe.title}</h3>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            {isPremiumUser && onDownloadImage && recipe.imageUrl && (
              <button onClick={handleDownloadImageClick} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors" aria-label="Download recipe image as JPG">
                Download Image (JPG)
              </button>
            )}
            {isPremiumUser && onExportRecipe && (
              <button onClick={handleExport} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors" aria-label="Export recipe as JSON">
                Export JSON
              </button>
            )}
          </div>
        </div>
        {recipe.description && ( <p className="text-sm text-slate-300 mb-4 italic">{recipe.description}</p> )}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 mb-5">
            {/* Displaying time is now simpler because the AI provides ISO format. We just show it. */}
            {recipe.prepTime && ( <div className="flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /> </svg> <span className="font-medium">Prep:</span> <span className="ml-1">{recipe.prepTime}</span> </div> )}
            {recipe.cookTime && ( <div className="flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 1.014C20.5 5 21 8 21 10c2 1 2.657 1.343 2.657 1.343a8 8 0 01-6.000 7.314zM12 6c0 2-2 4-2 4s2-2 2-4z" /> </svg> <span className="font-medium">Cook:</span> <span className="ml-1">{recipe.cookTime}</span> </div> )}
        </div>
        {recipe.cuisine && ( <p className="text-sm text-slate-300 mb-4"><span className="font-semibold text-sky-400">Cuisine:</span> {recipe.cuisine}</p> )}
        
        {/* The dietaryNotes field might not exist in the new structure, handle it gracefully */}
        {recipe.dietaryNotes && recipe.dietaryNotes.length > 0 && (
          <div className="mb-5">
            <h4 className="text-md font-semibold text-sky-400 mb-1">Dietary Notes:</h4>
            <div className="flex flex-wrap gap-2"> {recipe.dietaryNotes.map((note, index) => ( <span key={index} className="px-2.5 py-1 text-xs font-medium bg-slate-700 text-sky-300 rounded-full">{note}</span> ))} </div>
          </div>
        )}
        
        <div className="mb-5">
          <h4 className="text-lg font-semibold text-sky-400 mb-2">Ingredients:</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm pl-2">
            {recipe.ingredients.map((ingredient, index) => ( <li key={index}>{ingredient}</li> ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-sky-400 mb-2">Instructions:</h4>
          {/* --- THIS IS THE CORRECTED SECTION --- */}
          {/* We now map over the array of instruction objects directly. */}
          <div className="text-slate-300 text-sm space-y-4 prose prose-sm prose-invert max-w-none">
             {recipe.instructions.map((step: InstructionStep, index: number) => (
                <div key={index}>
                    <h5 className="font-bold text-sky-300">{step.stepName}</h5>
                    <p className="my-1">{step.stepText}</p>
                </div>
             ))}
          </div>
          {/* --- END OF CORRECTION --- */}
        </div>

        {recipe.chefPersonalityFeedback && (
            <div className="mt-5 pt-4 border-t border-slate-700/50">
                <h5 className="text-sm font-semibold text-amber-400 mb-1">Chef's Note on Personality:</h5>
                <p className="text-xs text-slate-400 italic">{recipe.chefPersonalityFeedback}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;