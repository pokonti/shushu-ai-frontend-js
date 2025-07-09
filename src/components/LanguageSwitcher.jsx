import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const otherLanguage = languages.find(lang => lang.code !== i18n.language) || languages[1];

  const handleLanguageToggle = () => {
    i18n.changeLanguage(otherLanguage.code);
  };

  return (
    <button
      onClick={handleLanguageToggle}
      className="group relative flex items-center space-x-2 sm:space-x-3 bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 text-gray-300 hover:text-white transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full hover:bg-slate-700/50 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden"
      title={`Switch to ${otherLanguage.nativeName}`}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
      
      {/* Content */}
      <div className="relative flex items-center space-x-2 sm:space-x-3">
        <Globe className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors hidden sm:inline" />
        
        {/* Current Language */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium hidden sm:block">{currentLanguage.code.toUpperCase()}</span>
        </div>
        
        {/* Switcher Arrow */}
        <div className="flex items-center space-x-1 text-purple-400 group-hover:text-purple-300 transition-colors">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
        
        {/* Next Language */}
        <div className="flex items-center space-x-1 sm:space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-lg">{otherLanguage.flag}</span>
          <span className="text-sm font-medium hidden sm:block">{otherLanguage.code.toUpperCase()}</span>
        </div>
      </div>
    </button>
  );
};

export default LanguageSwitcher; 