import React, { useState, useEffect } from 'react';
import { Wand2, Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
              <span className="text-xl font-bold">{t('common.brand')}</span>
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
            <span className="text-xl font-bold">{t('common.brand')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-purple-300 transition-colors">{t('navigation.features')}</a>
            <a href="#pricing" className="hover:text-purple-300 transition-colors">{t('navigation.pricing')}</a>
            <Link to="/editor">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                {t('navigation.getStarted')}
              </button>
            </Link>
            <Link to="/shorts">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                Shorts
              </button>
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-8">
                <Link to="/projects" className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                  {t('navigation.projects')}
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
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors">
                        {t('navigation.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navigation.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                    {t('navigation.login')}
                  </button>
                </Link>
              </>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

            {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 z-50 shadow-xl">
          <div className="px-6 py-6 space-y-3">
            <a href="#features" className="block py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 font-medium">{t('navigation.features')}</a>
            <a href="#pricing" className="block py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 font-medium">{t('navigation.pricing')}</a>
            <Link to="/editor" className="block py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 font-medium">
              {t('navigation.getStarted')}
            </Link>
            <Link to="/shorts" className="block py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 font-medium">
              Shorts
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/projects" className="block py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 font-medium">
                  {t('navigation.projects')}
                </Link>
                {userInfo && (
                  <div className="py-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="text-gray-300 text-sm font-medium">
                      {userInfo.email || userInfo.username}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navigation.logout')}</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-3 px-4 rounded-xl hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 font-medium">
                {t('navigation.login')}
              </Link>
            )}
            
            {/* Mobile Language Switcher */}
            <div className="border-t border-purple-500/20 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;