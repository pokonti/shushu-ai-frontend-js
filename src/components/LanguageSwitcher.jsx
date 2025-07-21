import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'ru', name: 'RU' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {languages.map((language, index) => (
        <React.Fragment key={language.code}>
          <button
            onClick={() => handleLanguageChange(language.code)}
            className={`px-2 py-1 rounded transition-colors ${
              i18n.language === language.code
                ? 'text-white font-medium'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {language.name}
          </button>
          {index < languages.length - 1 && (
            <span className="text-gray-500">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LanguageSwitcher;