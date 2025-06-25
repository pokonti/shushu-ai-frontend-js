import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit, Save, X, Camera, ArrowLeft,Settings,Key,
  Shield,Folder,Plus, Grid, List, Search, Filter } from 'lucide-react';
import AuthService from '../services/authService';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [projectsView, setProjectsView] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await AuthService.getCurrentUser();
        setUserInfo(data);
        setEditFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          username: data.username || '',
        });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setError(error.message || 'Failed to load profile.');
        // Optionally redirect to login if unauthorized
        if (error.message === 'Session expired. Please log in again.') {
          // navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedUser = await AuthService.updateCurrentUser(editFormData);
      setUserInfo(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">{t('loadingProfile')}</span>
        </div>
      </div>
    );
  }

  if (error && error !== 'Session expired. Please log in again.') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{t('profileNotFound')}</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="text-purple-400 hover:text-purple-300"
          >
            {t('pleaseLogInAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">{t('profile')}</h1>
          </div>
          {successMessage && (
            <p className="text-green-400 text-sm font-medium animate-pulse">{successMessage}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <nav className="md:col-span-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-6 h-fit">
            <ul className="space-y-4">
              <li>
                <button 
                  className="w-full flex items-center space-x-3 text-left px-4 py-2 rounded-xl transition-colors 
                             bg-purple-600/20 text-purple-300"
                >
                  <User className="w-5 h-5" />
                  <span>{t('profileInfo')}</span>
                </button>
              </li>
              <li>
                <button 
                  className="w-full flex items-center space-x-3 text-left px-4 py-2 rounded-xl text-gray-300 hover:bg-purple-600/10 hover:text-purple-300 transition-colors"
                >
                  <Folder className="w-5 h-5" />
                  <span>{t('myProjects')}</span>
                </button>
              </li>
              <li>
                <button 
                  className="w-full flex items-center space-x-3 text-left px-4 py-2 rounded-xl text-gray-300 hover:bg-purple-600/10 hover:text-purple-300 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>{t('security')}</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3 space-y-8">
            {/* Profile Information Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{t('profileInformation')}</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setSuccessMessage(null);
                        // Reset form data if canceling
                        if (userInfo) {
                          setEditFormData({
                            first_name: userInfo.first_name || '',
                            last_name: userInfo.last_name || '',
                            email: userInfo.email || '',
                            username: userInfo.username || '',
                          });
                        }
                      }}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>{t('cancel')}</span>
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium ${
                        isSaving
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105'
                      }`}
                    >
                      {isSaving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span>{isSaving ? t('saving') : t('save')}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('firstName')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo?.first_name || t('notProvided')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('lastName')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo?.last_name || t('notProvided')}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('emailAddress')}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo?.email}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('username')}
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                    {userInfo?.username}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('memberSince')}
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : t('notProvided')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* My Projects Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{t('myProjects')}</h2>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>{t('newProject')}</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder={t('searchProjects')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-slate-700/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setProjectsView('grid')}
                    className={`p-3 rounded-xl ${projectsView === 'grid' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setProjectsView('list')}
                    className={`p-3 rounded-xl ${projectsView === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>{t('filter')}</span>
                  </button>
                </div>
              </div>
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('projectsWillBeRenderedHere')}</h3>
                <p className="text-gray-400 mb-6">
                  {t('thisIsAPlaceholderForYourProjects')}
                </p>
                <div className="bg-slate-700/50 border border-gray-600 rounded-xl p-4 text-left">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>{t('integrationNotes')}:</strong>
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• {t('useSearchTermStateForFilteringProjects')}</li>
                    <li>• {t('useProjectsViewStateToSwitchBetweenGridListLayout')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{t('security')}</h2>
                <button 
                  className="flex items-center space-x-2 bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>{t('changePassword')}</span>
                </button>
              </div>
              <p className="text-gray-400">
                Manage your password and other security settings here.
              </p>
              {/* Add more security options as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}