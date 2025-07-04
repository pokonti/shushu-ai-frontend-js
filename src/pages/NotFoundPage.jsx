import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-purple-800/50 backdrop-blur-sm rounded-full border border-purple-600/30 mb-8">
          <span className="text-purple-300 text-sm font-medium">{t('notFound.badge')}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-white">{t('notFound.mainTitle')}</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
            {t('notFound.mainTitleHighlight')}
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          {t('notFound.description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/">
                <button className="group bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>{t('notFound.goHome')}</span>
                </button>
            </Link>
        </div>


      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-pink-600/10 rounded-full blur-xl"></div>
      <div className="fixed top-1/2 left-1/4 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
    </div>
  );
}