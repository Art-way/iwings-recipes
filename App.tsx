// src/App.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { generateRecipeIdeasWithOllama } from './services/ollamaService';
import { generateImageWithGemini } from './services/geminiService'; // Restore this
import { RecipeIdea, User } from './types';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';
import AuthModal from './components/AuthModal';
import Header from './components/Header';

const MAX_INGREDIENTS = 8;
const CUISINE_OPTIONS = ["Any", "Italian", "Mexican", "Indian", "Chinese", "Mediterranean", "French", "Japanese", "Thai", "American", "Fusion", "Quick & Easy"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Low-Carb", "Paleo"];
const CHEF_PERSONALITY_SUGGESTIONS = [
  "A cheerful grandma sharing secret family recipes.",
  "A Michelin-star chef, precise and innovative.",
  "A rustic, hearty tavern cook.",
  "A futuristic food scientist.",
  "A laid-back surfer dude making beach snacks.",
  "A very enthusiastic and loud TV chef."
];

// This handleDownloadImage should work for both base64 and external URLs
const handleDownloadImage = async (recipe: RecipeIdea) => {
    if (!recipe.imageUrl) {
        alert("No image to download.");
        return;
    }
    try {
        const isBase64 = recipe.imageUrl.startsWith('data:image');
        const link = document.createElement('a');
        let objectUrlToRevoke: string | null = null;

        if (isBase64) {
            link.href = recipe.imageUrl;
        } else { // For external URLs (like Picsum Photos if Gemini fails)
            const response = await fetch(recipe.imageUrl, { mode: 'cors' }); // CORS might be needed for some placeholders
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const blob = await response.blob();
            objectUrlToRevoke = URL.createObjectURL(blob);
            link.href = objectUrlToRevoke;
        }
        
        const fileExtension = recipe.imageUrl.startsWith('data:image/jpeg') || recipe.imageUrl.includes('.jpg') || recipe.imageUrl.includes('/jpeg') ? 'jpg' :
                              recipe.imageUrl.startsWith('data:image/png') || recipe.imageUrl.includes('.png') || recipe.imageUrl.includes('/png') ? 'png' : 'jpg';

        link.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_image.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (objectUrlToRevoke) {
            URL.revokeObjectURL(objectUrlToRevoke);
        }
    } catch (error) {
        console.error("Error downloading image:", error);
        alert("Could not download the image. See console for details.");
    }
};


const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [cuisine, setCuisine] = useState<string>(CUISINE_OPTIONS[0]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [chefPersonality, setChefPersonality] = useState<string>('');
  
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiKeyMissing, setIsGeminiKeyMissing] = useState<boolean>(false); // Restore this

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null);

  useEffect(() => {
    // Check for GEMINI_API_KEY from vite.config.ts
    const GEMINI_API_KEY_CONFIGURED_CHECK = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY_CONFIGURED_CHECK || GEMINI_API_KEY_CONFIGURED_CHECK.trim() === "" || GEMINI_API_KEY_CONFIGURED_CHECK === "undefined") {
      setIsGeminiKeyMissing(true);
      console.warn("Gemini API Key is missing. Images will be placeholders.");
    } else {
      setIsGeminiKeyMissing(false);
      console.log("Gemini API Key is configured.");
    }

    const storedUser = localStorage.getItem('iwings_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); }
      catch (e) { console.error("Failed to parse user from localStorage", e); localStorage.removeItem('iwings_user');}
    }
  }, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem('iwings_user', JSON.stringify(currentUser));
    else localStorage.removeItem('iwings_user');
  }, [currentUser]);

  const handleAddIngredient = () => { if (ingredients.length < MAX_INGREDIENTS) setIngredients([...ingredients, '']); };
  const handleIngredientChange = (index: number, value: string) => { const newIngredients = [...ingredients]; newIngredients[index] = value; setIngredients(newIngredients); };
  const handleRemoveIngredient = (index: number) => { if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index)); else if (ingredients.length === 1) setIngredients(['']); };
  const handleDietaryChange = (option: string) => { setDietaryRestrictions(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]); };
  const handleAuthSuccess = (user: User) => { setCurrentUser(user); setAuthModal(null); };
  const handleSignOut = () => { setCurrentUser(null); setRecipeIdeas([]); setIngredients(['']); setCuisine(CUISINE_OPTIONS[0]); setDietaryRestrictions([]); setChefPersonality(''); };
  const handleGoPremium = () => { if (currentUser) { setCurrentUser({ ...currentUser, isPremium: true }); alert("Congratulations! You are now a Premium user."); } };
  
  const handleExportRecipe = (recipe: RecipeIdea) => {
    console.log("Generating JSON-LD for export from recipe:", recipe);
    const jsonLdData = {
      "@context": "https://schema.org/", "@type": "Recipe", "name": recipe.title,
      "url": `https://neronet-academy.com/recipes/${recipe.title.toLowerCase().replace(/\s+/g, '-')}`,
      "image": [ recipe.imageUrl || "INSERT_GENERATED_FULL_FEATURED_IMAGE_URL_HERE" ], // Simplified for main image
      "author": {"@type": "Person", "name": "Leo Martini"}, "datePublished": new Date().toISOString().split('T')[0],
      "description": recipe.description, "recipeCuisine": recipe.cuisine, "prepTime": recipe.prepTime, "cookTime": recipe.cookTime, "totalTime": recipe.totalTime, "keywords": recipe.keywords,
      "recipeYield": recipe.recipeYield, "recipeCategory": recipe.recipeCategory, "nutrition": recipe.nutrition, "aggregateRating": recipe.aggregateRating, "recipeIngredient": recipe.ingredients,
      "recipeInstructions": recipe.instructions.map(step => ({ "@type": "HowToStep", "name": step.stepName, "text": step.stepText, "image": "" })), // Contextual images could be added later
      "video": null,
      "aiImagePrompts": { "mainPrompts": recipe.mainImagePrompts, "stepPrompts": recipe.instructions.map(step => ({ step: step.stepName, prompt: step.imagePrompt })) }
    };
    const filename = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_schema.json`;
    const jsonStr = JSON.stringify(jsonLdData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) { setError("Please sign in."); setAuthModal('signin'); return; }
    const filteredIngredients = ingredients.map(ing => ing.trim()).filter(ing => ing !== '');
    if (filteredIngredients.length === 0) { setError("Please enter at least one ingredient."); return; }
    setIsLoading(true); setError(null); setRecipeIdeas([]);
    try {
      const selectedCuisine = cuisine === "Any" ? undefined : cuisine;
      const personalityToUse = currentUser?.isPremium ? chefPersonality : undefined;
      
      // 1. Get recipe ideas (including image prompts) from Ollama
      const richRecipes = await generateRecipeIdeasWithOllama(filteredIngredients, selectedCuisine, dietaryRestrictions, personalityToUse);
      if (richRecipes.length === 0) { setError("No recipes found. Try different ingredients!"); setIsLoading(false); return; }
      
      // 2. For each recipe, generate the main image using Gemini with the prompt from Ollama
      const recipesWithDisplayImage = await Promise.all(
        richRecipes.map(async (recipe) => {
          const imagePromptFromOllama = (recipe.mainImagePrompts && recipe.mainImagePrompts.length > 0)
            ? recipe.mainImagePrompts[0] // Use the first prompt from Ollama
            : `A delicious plate of ${recipe.title}`; // Fallback prompt if Ollama doesn't provide one
          
          const displayImageUrl = await generateImageWithGemini(imagePromptFromOllama, recipe.title); // Pass recipe title for placeholder seed
          return { ...recipe, imageUrl: displayImageUrl };
        })
      );
      setRecipeIdeas(recipesWithDisplayImage);
    } catch (err) {
      if (err instanceof Error) { setError(err.message); } else { setError("An unexpected error occurred."); }
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, cuisine, dietaryRestrictions, currentUser, chefPersonality]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 font-sans">
      <Header currentUser={currentUser} onSignIn={() => setAuthModal('signin')} onSignUp={() => setAuthModal('signup')} onSignOut={handleSignOut} onGoPremium={handleGoPremium} />
      <main className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
        {isGeminiKeyMissing && ( // Restore Gemini key missing warning
          <div className="bg-yellow-700 border border-yellow-600 text-yellow-100 px-5 py-4 rounded-lg relative mb-8 shadow-lg" role="alert">
            <strong className="font-bold block mb-1">Image Generation Alert!</strong>
            <span className="block sm:inline">The Gemini API Key is missing. Recipe text will be generated, but **images will be placeholders**.</span>
          </div>
        )}
        {!currentUser ? (
          <div className="text-center bg-slate-800 p-10 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-semibold text-sky-300 mb-4">Welcome to iWINGS Agency Recipe AI!</h2>
            <p className="text-slate-300 mb-6">Sign in or create an account to generate delicious recipe ideas.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setAuthModal('signin')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-colors">Sign In</button>
              <button onClick={() => setAuthModal('signup')} className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors">Sign Up</button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-10 mb-12 ring-1 ring-slate-700">
              <div className="space-y-8">
                <div>
                  <label htmlFor="ingredients" className="block text-xl font-semibold text-sky-300 mb-3"><span role="img" aria-label="Ingredients icon" className="mr-2">🥕</span>Your Ingredients</label>
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3 mb-3">
                      <input type="text" placeholder={`Ingredient ${index + 1}`} value={ingredient} onChange={(e) => handleIngredientChange(index, e.target.value)} className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400 transition-colors" aria-label={`Ingredient ${index + 1}`} />
                      {ingredients.length > 0 && (<button type="button" onClick={() => handleRemoveIngredient(index)} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md" aria-label={`Remove ingredient ${index + 1}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>)}
                    </div>
                  ))}
                  {ingredients.length < MAX_INGREDIENTS && (<button type="button" onClick={handleAddIngredient} className="mt-2 text-sm text-sky-400 hover:text-sky-300 font-medium flex items-center group"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 group-hover:text-emerald-400 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>Add Ingredient</button>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label htmlFor="cuisine" className="block text-lg font-medium text-sky-300 mb-2"><span role="img" aria-label="Cuisine icon" className="mr-2">🌍</span> Cuisine Style</label>
                    <select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100">{CUISINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-sky-300 mb-2"><span role="img" aria-label="Dietary icon" className="mr-2">🥗</span> Dietary Needs</label>
                    <div className="flex flex-wrap gap-3">{DIETARY_OPTIONS.map(option => (<label key={option} className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors border border-transparent has-[:checked]:border-sky-500 has-[:checked]:bg-sky-700/30"><input type="checkbox" checked={dietaryRestrictions.includes(option)} onChange={() => handleDietaryChange(option)} className="h-4 w-4 text-sky-500 border-slate-500 rounded focus:ring-sky-400 focus:ring-offset-slate-700" aria-labelledby={`dietary-label-${option}`} /><span id={`dietary-label-${option}`} className="text-sm text-slate-200 select-none">{option}</span></label>))}</div>
                  </div>
                </div>
                {currentUser?.isPremium && (
                  <div>
                    <label htmlFor="chefPersonality" className="block text-lg font-medium text-sky-300 mb-2"><span role="img" aria-label="Chef hat icon" className="mr-1">🧑‍🍳</span> Chef Personality (Premium)</label>
                    <input type="text" id="chefPersonality" list="chef-personality-suggestions" placeholder="e.g., A fiery Italian chef, a calm Zen master" value={chefPersonality} onChange={(e) => setChefPersonality(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400 transition-colors"/>
                     <datalist id="chef-personality-suggestions">{CHEF_PERSONALITY_SUGGESTIONS.map(suggestion => (<option key={suggestion} value={suggestion} />))}</datalist>
                    <p className="text-xs text-slate-400 mt-1.5">Describe the chef's style, and the AI will try to match their tone!</p>
                  </div>
                )}
              </div>
              <div className="mt-10 text-center">
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-400 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed">{isLoading ? 'Brewing Up Ideas...' : 'Generate Recipes'}</button>
              </div>
            </form>
            {isLoading && <LoadingSpinner />}
            {error && !isLoading && ( <div className="bg-red-800 border border-red-700 text-red-100 px-5 py-4 rounded-lg relative mb-8 shadow-lg" role="alert"> <strong className="font-bold block mb-1">An Error Occurred!</strong> <span className="block sm:inline">{error}</span> </div> )}
            {!isLoading && recipeIdeas.length > 0 && (
              <section className="mt-12" aria-labelledby="recipe-results-title">
                <h2 id="recipe-results-title" className="text-4xl font-bold text-center mb-10"><span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-sky-300 to-blue-400">Your Culinary Inspirations!</span></h2>
                <div className="grid grid-cols-1 gap-10">
                  {recipeIdeas.map((recipe, index) => (<RecipeCard key={index} recipe={recipe} isPremiumUser={currentUser.isPremium} onExportRecipe={handleExportRecipe} onDownloadImage={handleDownloadImage} />))}
                </div>
              </section>
            )}
            {!isLoading && recipeIdeas.length === 0 && !error && currentUser?.email && (
              <div className="text-center text-slate-400 py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                <p className="text-2xl mb-2 font-semibold">Ready for some recipe magic?</p>
                <p className="text-lg">Enter ingredients above and click "Generate Recipes".</p>
              </div>
            )}
          </>
        )}
      </main>
      {authModal && (<AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuthSuccess={handleAuthSuccess} onSwitchMode={(newMode) => setAuthModal(newMode)}/>)}
      <footer className="text-center py-10 mt-16 border-t border-slate-700/50">
        <p className="text-md text-slate-400">Powered by <span className="font-semibold text-sky-400">Local Ollama API</span>, <span className="font-semibold text-sky-400">Google Gemini API</span> & <span className="font-semibold text-sky-400">React</span>.</p>
        <p className="text-sm text-slate-500 mt-2">Styled with <span className="font-semibold text-teal-400">Tailwind CSS</span>.</p>
        <p className="text-xs text-slate-600 mt-4">© {new Date().getFullYear()} iWINGS Agency. Conceptual.</p>
      </footer>
    </div>
  );
};

export default App;