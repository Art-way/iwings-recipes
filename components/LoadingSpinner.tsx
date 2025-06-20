
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500 mb-4"></div>
      <p className="text-xl text-sky-300 font-semibold">Crafting culinary magic...</p>
      <p className="text-sm text-slate-400">Please wait a moment.</p>
    </div>
  );
};

export default LoadingSpinner;
