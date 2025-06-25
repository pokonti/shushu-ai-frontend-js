import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft } from 'lucide-react';
import MiniHeader from '../components/MiniHeader';
import { useTranslation } from 'react-i18next';

export default function Shorts() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [processResult, setProcessResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for demo, integrate with your auth service

  const API_BASE_URL = 'http://localhost:8000';

  // Uncomment and modify based on your auth service
  // useEffect(() => {
  //   setIsLoggedIn(AuthService.isAuthenticated());
  //   const handleStorageChange = () => setIsLoggedIn(AuthService.isAuthenticated());
  //   window.addEventListener('storage', handleStorageChange);
  //   return () => window.removeEventListener('storage', handleStorageChange);
  // }, []);

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
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        resetStates();
      } else {
        setError('Please upload a valid video file (MP4, MOV, MKV, AVI, WEBM)');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        resetStates();
      } else {
        setError('Please upload a valid video file (MP4, MOV, MKV, AVI, WEBM)');
      }
    }
  };

  const isValidFile = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const resetStates = () => {
    setProcessResult(null);
    setError(null);
    setProgress(0);
    setProgressMessage('');
  };

  const removeFile = () => {
    setFile(null);
    resetStates();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadAndProcessFile = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-shorts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const simulateProgress = (duration = 30000) => {
    const interval = 100; // Update every 100ms
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 90, 90); // Cap at 90% until actual completion
      setProgress(newProgress);

      // Update progress messages
      if (newProgress < 20) {
        setProgressMessage('Uploading video...');
      } else if (newProgress < 40) {
        setProgressMessage('Analyzing video content...');
      } else if (newProgress < 60) {
        setProgressMessage('Identifying key moments...');
      } else if (newProgress < 80) {
        setProgressMessage('Generating shorts...');
      } else if (newProgress < 90) {
        setProgressMessage('Finalizing clips...');
      }

      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, interval);

    return progressInterval;
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setError(null);
    setUploading(true);
    setProcessing(true);
    setProgress(0);
    setProgressMessage('Starting upload...');
    
    try {
      // Start progress simulation
      const progressInterval = simulateProgress();
      
      // Upload and process the file
      const result = await uploadAndProcessFile();
      
      // Clear progress simulation and set completion
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Shorts generated successfully!');
      setProcessResult(result);
      
      setUploading(false);
      setProcessing(false);
      
    } catch (error) {
      setError(error.message || 'Failed to generate shorts');
      setUploading(false);
      setProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const isProcessingActive = uploading || processing;

  const handleBackClick = () => {
    window.history.back();
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MiniHeader/>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-800/30 text-purple-300 px-4 py-2 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span>{t('aiPoweredShortsGenerator')}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('generateViralShorts')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('uploadVideoDescription')}
          </p>
        </div>

        {/* Main Content */}
        {!1 ? (
          <div className="max-w-md mx-auto bg-slate-800/60 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6">Please log in to access the AI Shorts Generator</p>
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              Log In
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-700/40 rounded-2xl p-8">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-400/10' 
                      : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('dropVideoHere')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {t('supportsVideoFiles')}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    {t('chooseFile')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".mp4,.mov,.mkv,.avi,.webm"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Video className="w-8 h-8 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      disabled={isProcessingActive}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {isProcessingActive && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{progressMessage}</span>
                        <span className="text-sm text-purple-300">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Success Result */}
                  {processResult && (
                    <div className="mb-6 p-6 bg-green-600/10 border border-green-600/30 rounded-xl">
                      <div className="flex items-center space-x-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <h5 className="text-lg font-semibold text-green-400">{t('success')}</h5>
                      </div>
                      
                      {processResult.shorts && processResult.shorts.length > 0 ? (
                        <div>
                          <p className="text-gray-300 mb-4">
                            {t('generatedClipsFromVideo')}
                          </p>
                          <div className="space-y-2">
                            {processResult.shorts.map((short, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                <span className="text-white">Short Clip #{index + 1}</span>
                                <a
                                  href={short.url || short.download_url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 underline text-sm"
                                >
                                  {t('download')}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-300">
                          {t('shortsGeneratedSuccessfully')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-red-400 font-medium">{t('generationFailed')}</h3>
                          <p className="text-red-300 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  {!processResult && (
                    <div className="text-center">
                      <button
                        onClick={handleProcess}
                        disabled={isProcessingActive}
                        className={`px-10 py-4 rounded-full font-semibold text-lg transition-all transform ${
                          !isProcessingActive
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isProcessingActive ? (
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t('generatingShorts')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <Play className="w-5 h-5" />
                            <span>{t('generateShorts')}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}