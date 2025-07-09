import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginRequired({ 
  badge = "authenticationRequired", 
  title = "loginRequired", 
  description = "loginRequiredDescription",
  customBadge,
  customTitle,
  customDescription 
}) {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative bg-gradient-to-br from-slate-800/80 via-purple-900/30 to-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-300 font-medium">
            {customBadge || t(`auth.${badge}`)}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          {customTitle || t(`upload.${title}.title`)}
        </h2>
        
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {customDescription || t(`upload.${description}.description`)}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a href="/login">
            <button className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold text-lg text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center space-x-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{t('navigation.login')}</span>
              <ArrowLeft className="w-5 h-5 relative z-10 rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </a>
          
          <a href="/">
            <button className="flex items-center space-x-2 px-6 py-3 border border-purple-500/50 rounded-full font-semibold text-purple-300 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-500/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back')} {t('auth.backToHome')}</span>
            </button>
          </a>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-b-3xl"></div>
      </div>
    </div>
  );
} 