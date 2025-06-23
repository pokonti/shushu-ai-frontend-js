import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit, Save, X, Camera, ArrowLeft,Settings,Key,
  Shield,Folder,Plus, Grid, List, Search, Filter } from 'lucide-react';

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [projectsView, setProjectsView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulate fetching user data - replace with your actual AuthService call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUserData = {
          id: 1,
          username: 'john_doe',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          created_at: '2024-01-15T10:30:00Z'
        };
        
        setUserInfo(mockUserData);
        setEditData({
          first_name: mockUserData.first_name || '',
          last_name: mockUserData.last_name || '',
          email: mockUserData.email || mockUserData.username || '',
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically make an API call to update user data
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (in a real app, you'd get the updated data from the API)
      setUserInfo(prev => ({
        ...prev,
        ...editData
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      first_name: userInfo.first_name || '',
      last_name: userInfo.last_name || '',
      email: userInfo.email || userInfo.username || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="text-purple-400 hover:text-purple-300"
          >
            Please log in again
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
              <h1 className="text-2xl font-bold text-white">Profile</h1>
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
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-2 hover:bg-purple-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {userInfo.first_name} {userInfo.last_name}
                </h3>
                <p className="text-gray-400">{userInfo.email || userInfo.username}</p>
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
                  <span>Profile Info</span>
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
                  <span>My Projects</span>
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
                  <span>Security</span>
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
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={editData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                        {userInfo.first_name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={editData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                        {userInfo.last_name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span>{userInfo.email || userInfo.username}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white">
                      {userInfo.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Member Since
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-700/30 border border-gray-600 rounded-xl text-white flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Projects Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Projects</h2>
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </button>
                  </div>

                  {/* Project Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setProjectsView('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          projectsView === 'grid' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-700/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProjectsView('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          projectsView === 'list' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-700/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Projects Container - This is where you'll render your projects */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Projects will be rendered here</h3>
                    <p className="text-gray-400 mb-6">
                      This is a placeholder for your projects. You can integrate your API here to display user projects.
                    </p>
                    <div className="bg-slate-700/50 border border-gray-600 rounded-xl p-4 text-left">
                      <p className="text-sm text-gray-300 mb-2">
                        <strong>Integration Notes:</strong>
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Use the searchTerm state for filtering projects</li>
                        <li>• Use the projectsView state to switch between grid/list layout</li>
                        <li>• Add your project cards/items in this container</li>
                        <li>• Handle loading and error states as needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-8">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="text-white font-medium">Change Password</h3>
                        <p className="text-gray-400 text-sm">Update your account password</p>
                      </div>
                    </div>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors">
                      Enable
                    </button>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}