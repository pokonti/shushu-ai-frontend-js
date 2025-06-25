import React, { useState, useEffect } from 'react';
import { Wand2, Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsLoggedIn(false);
          setUserInfo(null);
          setIsLoading(false);
          return;
        }

        // Try to get current user info
        const userData = await AuthService.getCurrentUser();
        setIsLoggedIn(true);
        setUserInfo(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setUserInfo(null);
        // Clear invalid token
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          checkAuthStatus();
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAuthSuccess = async (type, result) => {
    if (type === 'login') {
      try {
        // Fetch user info after successful login
        const userData = await AuthService.getCurrentUser();
        setIsLoggedIn(true);
        setUserInfo(userData);
        
        // Optionally redirect to a protected route
        // navigate('/dashboard');
      } catch (error) {
        console.error('Failed to fetch user info after login:', error);
        // Still set as logged in if login was successful
        setIsLoggedIn(true);
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUserInfo(null);
    
    // Optionally redirect to home page
    navigate('/');
  };

  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <nav className="fixed w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{t('appName')}</span>
            </div>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/20 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">{t('appName')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-purple-300 transition-colors">{t('features')}</a>
            <a href="#pricing" className="hover:text-purple-300 transition-colors">{t('pricing')}</a>
            <Link to="/editor">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                {t('getStarted')}
              </button>
            </Link>
            <Link to="/shorts">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                {t('shorts')}
              </button>
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-8">
                <Link to="/projects" className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                  {t('projects')}
                </Link>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    {userInfo && (
                      <span className="text-sm">
                        {userInfo.first_name || userInfo.username}
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {userInfo && (
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                          <div className="font-medium">{userInfo.first_name} {userInfo.last_name}</div>
                          <div className="text-gray-400">{userInfo.email || userInfo.username}</div>
                        </div>
                      )}
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        {t('profile')}
                      </Link>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                    Login
                  </button>
                </Link>
              </>
            )}
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>{i18n.language.toUpperCase()}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-slate-800/90 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button onClick={() => i18n.changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors rounded-t-xl">
                  EN
                </button>
                <button onClick={() => i18n.changeLanguage('ru')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors rounded-b-xl">
                  RU
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Language Switcher for Mobile */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>{i18n.language.toUpperCase()}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-slate-800/90 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button onClick={() => i18n.changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors rounded-t-xl">
                  EN
                </button>
                <button onClick={() => i18n.changeLanguage('ru')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors rounded-b-xl">
                  RU
                </button>
              </div>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} fixed inset-y-0 right-0 w-64 bg-slate-900/95 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out`}>
        <div className="flex justify-end p-4">
          <button onClick={() => setIsMenuOpen(false)} className="text-white focus:outline-none">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col items-center space-y-6 py-8">
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">{t('features')}</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">{t('pricing')}</a>
          <Link to="/editor" onClick={() => setIsMenuOpen(false)}>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold text-white text-lg hover:shadow-lg hover:scale-105 transition-all">
              {t('getStarted')}
            </button>
          </Link>
          <Link to="/shorts" onClick={() => setIsMenuOpen(false)}>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold text-white text-lg hover:shadow-lg hover:scale-105 transition-all">
              {t('shorts')}
            </button>
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/projects" onClick={() => setIsMenuOpen(false)} className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold text-white text-lg hover:shadow-lg hover:scale-105 transition-all">
                {t('projects')}
              </Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-lg">
                <User className="w-5 h-5" />
                <span>{t('profile')}</span>
              </Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-lg">
                <LogOut className="w-5 h-5" />
                <span>{t('logout')}</span>
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold text-white text-lg hover:shadow-lg hover:scale-105 transition-all">
                {t('signIn')}
              </button>
            </Link>
          )}
        </nav>
      </div>
    </nav>
  );
};

export default Header;