import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Camera, ArrowLeft,Settings,Key,
  Shield,Folder,Plus, Grid, List, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';

export default function Profile() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('profile');
  const [projectsView, setProjectsView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Image handling functions
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Please select a valid image file (JPG, PNG, GIF, or WEBP)' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    return { isValid: true };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      const validation = validateImage(file);
      if (!validation.isValid) {
        setImageError(validation.error);
        return;
      }

      setImageError(null);
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target.result;
        setImagePreview(preview);
        
        // Save to localStorage for persistence
        localStorage.setItem('profileImage', preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.isValid) {
      setImageError(validation.error);
      return;
    }

    setImageError(null);
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target.result;
      setImagePreview(preview);
      
      // Save to localStorage for persistence
      localStorage.setItem('profileImage', preview);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    localStorage.removeItem('profileImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load saved image on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }

        // Fetch actual user data
        const userData = await AuthService.getCurrentUser();
        
        setUserInfo(userData);

      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError(error.message);
        
        // If authentication failed, redirect to login
        if (error.message.includes('Session expired') || error.message.includes('No authentication token')) {
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">{t('profile.loading')}</span>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">{t('profile.notFound.title')}</h2>
          <p className="text-gray-300 mb-6">
            {error || t('profile.notFound.loginAgain')}
          </p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            {t('navigation.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-800/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'} 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-6 sticky top-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div 
                    className={`w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 overflow-hidden transition-all cursor-pointer ${
                      dragActive ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800 scale-105' : 'hover:scale-105'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleImageUpload}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                    {dragActive && (
                      <div className="absolute inset-0 bg-purple-500/50 rounded-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleImageUpload}
                    className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-2 hover:bg-purple-600 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  {imagePreview && (
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {userInfo.username || 'User'}
                </h3>
                <p className="text-gray-400">{userInfo.email || userInfo.username}</p>
                
                {/* Image Error Display */}
                {imageError && (
                  <div className="mt-2 text-red-400 text-sm">
                    {imageError}
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center space-x-3 ${
                    activeTab === 'profile' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{t('profile.navigation.profileInfo')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center space-x-3 ${
                    activeTab === 'projects' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  <span>{t('profile.navigation.myProjects')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center space-x-3 ${
                    activeTab === 'security' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{t('profile.navigation.security')}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">{t('profile.profileInfo.title')}</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('auth.fields.username')}
                    </label>
                    <div className="px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo.username || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('auth.fields.email')}
                    </label>
                    <div className="px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo.email || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">{t('profile.projects.title')}</h2>
                  <button 
                    onClick={() => window.location.href = '/editor'}
                    className="flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('profile.projects.createProject')}</span>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('profile.projects.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center space-x-2 bg-slate-700/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-slate-600/50 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>{t('common.filter')}</span>
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-2 mb-6">
                  <button
                    onClick={() => setProjectsView('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      projectsView === 'grid' 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-slate-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setProjectsView('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      projectsView === 'list' 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-slate-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Projects List */}
                <div className="text-center text-gray-400 py-12">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">{t('profile.projects.inProgress')}</p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-8">{t('profile.navigation.security')}</h2>
                <div className="text-center text-gray-400 py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">Security settings coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}