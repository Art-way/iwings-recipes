
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onSwitchMode: (newMode: 'signin' | 'signup') => void; // Added for mode switching
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onAuthSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // MOCK AUTHENTICATION LOGIC
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      // Check if user already exists (mock)
      const existingUser = localStorage.getItem(`iwings_mock_user_${email}`);
      if (existingUser) {
        setError("An account with this email already exists. Please sign in.");
        return;
      }
      const newUser: User = { email, isPremium: false };
      // In a real app, password would be hashed and stored securely on a server.
      // For this mock, we'll store the user object (without password) and a separate "password" entry for demo.
      localStorage.setItem(`iwings_mock_user_${email}`, JSON.stringify(newUser));
      localStorage.setItem(`iwings_mock_user_pw_${email}`, password); // DO NOT DO THIS IN PRODUCTION
      onAuthSuccess(newUser);

    } else { // signin
      const storedUserStr = localStorage.getItem(`iwings_mock_user_${email}`);
      const storedPassword = localStorage.getItem(`iwings_mock_user_pw_${email}`); // DO NOT DO THIS IN PRODUCTION

      if (storedUserStr && storedPassword === password) {
        try {
            const user = JSON.parse(storedUserStr) as User;
            onAuthSuccess(user);
        } catch(e) {
            setError("Error retrieving user data. Please try signing up again.");
        }
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md ring-1 ring-slate-700 relative"
        onClick={e => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close authentication modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="auth-modal-title" className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-500">
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sky-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password_auth" className="block text-sm font-medium text-sky-300 mb-1">Password</label>
            <input
              type="password"
              id="password_auth"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-sky-300 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
          >
            {mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={() => onSwitchMode('signin')} className="font-medium text-sky-400 hover:text-sky-300">Sign In</button></>
          ) : (
            <>Don't have an account? <button onClick={() => onSwitchMode('signup')} className="font-medium text-sky-400 hover:text-sky-300">Sign Up</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
