import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function MiniHeader() {

  const handleBackClick = () => {
    window.history.back();
  };

  return (
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-800/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <button 
            onClick={handleBackClick}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-xl ml-4 font-semibold">ShuShu AI</h1>
        </div>
      </div>
  );
}