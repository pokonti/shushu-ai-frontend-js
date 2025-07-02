import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleIcon } from '../components/GoogleIcon';

export default function AuthPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/'); // Redirect to home or dashboard
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } 
    // else if (formData.password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters';
    // }
    
    if (!isLogin) {
      // if (!formData.firstName) {
      //   newErrors.firstName = t('auth.validation.firstNameRequired');
      // }
      // if (!formData.lastName) {
      //   newErrors.lastName = t('auth.validation.lastNameRequired');
      // }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('auth.validation.passwordsDoNotMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      if (isLogin) {
        const result = await AuthService.login({
          email: formData.email,
          password: formData.password
        });
        
        setSuccessMessage(t('auth.loginSuccessful'));
        
        // Redirect after successful login
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } else {
        // Register
        await AuthService.register({
          email: formData.email,
          password: formData.password,
          // firstName: formData.firstName,
          // lastName: formData.lastName
        });
        
        setSuccessMessage(t('auth.registrationSuccessful'));
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email, // Keep email for convenience
            password: '',
            confirmPassword: '',
            // firstName: '',
            // lastName: ''
          });
          setSuccessMessage('');
        }, 2000);
      }
      
    } catch (error) {
      setErrors({
        general: error.message || 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    // Use the secure 'auth-code' flow
    flow: 'auth-code',

    // This function is called after the user successfully logs in with Google
    onSuccess: async (codeResponse) => {
      setIsLoading(true); // Show loading spinner
      try {
        // Send the authorization code we received from Google to our backend
        await AuthService.loginWithGoogle(codeResponse.code);
        
        // On success, redirect to the main app page or editor
        navigate('/'); 

      } catch (error) {
        console.error("Backend Google login failed:", error);
        setErrors({
          general: error.message || 'Google login failed. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      setErrors({
        general: 'An error occurred during Google Sign-In.'
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.backToHome')}</span>
          </Link>
        </div>

        {/* Auth Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h1>
            <p className="text-gray-400">
              {isLogin ? t('auth.signInDescription') : t('auth.getStartedDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300">{successMessage}</span>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-300">{errors.general}</p>
              </div>
            )}

            {/* Google Login Button first */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-slate-700/50 border border-gray-600 rounded-xl text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <GoogleIcon className="w-5 h-5" /> 
              <span className="font-medium">
                {isLogin ? t('auth.buttons.signInWithGoogle') : t('auth.buttons.signUpWithGoogle')}
              </span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">
                {t('auth.orContinueWith')}
              </span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.fields.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder={t('auth.placeholders.email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.fields.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder={t('auth.placeholders.password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.fields.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder={t('auth.placeholders.password')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? t('auth.buttons.signingIn') : t('auth.buttons.creatingAccount')}</span>
                </div>
              ) : (
                <span>{isLogin ? t('auth.buttons.signIn') : t('auth.buttons.createAccount')}</span>
              )}
            </button>
          </form>

          {/* Switch Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              {isLogin ? t('auth.switchMode.noAccount') : t('auth.switchMode.hasAccount')}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setSuccessMessage('');
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isLogin ? t('auth.switchMode.signUp') : t('auth.switchMode.signIn')}
              </button>
            </p>
          </div>

          

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}