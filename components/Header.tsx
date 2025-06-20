
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
  onGoPremium: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSignIn, onSignUp, onSignOut, onGoPremium }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-md shadow-lg sticky top-0 z-40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
             <img 
                src="https://picsum.photos/seed/iwings_agency/80/80" // Placeholder logo
                alt="iWINGS Agency Logo" // Updated alt text
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md border-2 border-sky-600 mr-3 sm:mr-4" 
             />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500">
                iWINGS Agency Recipe AI
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {currentUser ? (
              <>
                <div className="text-right">
                    <span className="text-sm text-slate-300 hidden sm:block">Welcome, {currentUser.email}!</span>
                    {!currentUser.isPremium && (
                         <button 
                            onClick={onGoPremium} 
                            className="block sm:inline-block mt-1 sm:mt-0 sm:ml-2 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-md shadow transition-colors"
                         >
                            ✨ Go Premium
                        </button>
                    )}
                     {currentUser.isPremium && (
                        <span className="block sm:inline-block mt-1 sm:mt-0 sm:ml-2 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md shadow">
                            ⭐ Premium User
                        </span>
                    )}
                </div>
                <button 
                  onClick={onSignOut} 
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onSignIn} 
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={onSignUp} 
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
