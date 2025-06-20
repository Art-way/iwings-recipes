// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() to ensure it finds .env.local
    return {
      define: {
        // This makes GEMINI_API_KEY from .env.local available as process.env.GEMINI_API_KEY in your client-side code
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // You might also have this for clarity, though the above is the important one for the geminiService
        'process.env.IWINGS_API_KEY': JSON.stringify(env.IWINGS_API_KEY) // If you use this in client code
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // Assuming this is correct for your project structure
        }
      },
      // Optional: if you are using .env.local and want to ensure Vite picks it up correctly for different modes
      // envDir: '.', // This tells Vite to look for .env files in the root directory
    };
});