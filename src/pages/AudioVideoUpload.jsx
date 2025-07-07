import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Music, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft, Zap} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';
import { uploadAndProcessFile, POLLING_INTERVALS } from '../services/uploadService';

export default function AudioVideoUpload() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [options, setOptions] = useState({
    denoise: false,
    removeFillers: false,
    summarize: false
  });
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB in bytes

  useEffect(() => {
    setIsLoggedIn(AuthService.isAuthenticated());
    // Optionally, listen for storage changes to update login status
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        setIsLoggedIn(AuthService.isAuthenticated());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      const validation = validateFile(droppedFile);
      
      if (validation.isValid) {
        setFile(droppedFile);
        setFileType(getFileType(droppedFile));
        resetStates();
      } else {
        setError(validation.error);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (validation.isValid) {
        setFile(selectedFile);
        setFileType(getFileType(selectedFile));
        resetStates();
      } else {
        setError(validation.error);
      }
    }
  };

  const validateFile = (file) => {
    // Check file type first
    if (!isValidFileType(file)) {
      return {
        isValid: false,
        error: t('upload.errors.unsupportedFormat')
      };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: t('upload.errors.fileSizeExceeded', {
          fileSize: formatFileSize(file.size),
          maxSize: formatFileSize(MAX_FILE_SIZE)
        })
      };
    }
    
    return { isValid: true };
  };

  const isValidFileType = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mkv', '.mp3', '.wav'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  // Legacy function for backward compatibility - now just calls isValidFileType
  const isValidFile = (file) => {
    return isValidFileType(file);
  };

  const getFileType = (file) => {
    const videoExtensions = ['.mp4', '.mov', '.mkv'];
    const audioExtensions = ['.mp3', '.wav'];
    
    const fileName = file.name.toLowerCase();
    
    if (videoExtensions.some(ext => fileName.endsWith(ext))) {
      return 'video';
    } else if (audioExtensions.some(ext => fileName.endsWith(ext))) {
      return 'audio';
    }
    return null;
  };

  const resetStates = () => {
    setUploadResult(null);
    setProcessResult(null);
    setError(null);
    setProgress(0);
    setProgressMessage('');
  };


  const removeFile = () => {
    setFile(null);
    setFileType(null);
    resetStates();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleProcess = async () => {
    if (!file || !fileType) return;
    
    setError(null);
    setProcessing(true);
    setUploading(true); // Keep your existing state logic
    setProgress(0);
    setProgressMessage(t('upload.processing.initiating'));
  
    try {
      const onUploadProgress = (percent) => {
        const uploadProgress = (percent / 100) * 40;
        setProgress(uploadProgress);
        setProgressMessage(t('upload.processing.uploading', { progress: Math.round(percent) }));
      };
      // Call the all-in-one service function, now passing the fileType
      const result = await uploadAndProcessFile({
        file,
        fileType, 
        options,
        onUploadProgress,
        pollingIntervalMs: POLLING_INTERVALS.NORMAL
      });
      
      // The rest of your existing logic can remain the same
      setProgress(50); 
      setProgressMessage(t('upload.processing.processing', { type: fileType }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      setProgress(100);
      setProgressMessage(t('upload.processing.complete'));
      // In your code you used 'setProcessResult', let's stick with that
      setProcessResult(result);
  
    } catch (error) {
      console.error("An error occurred:", error);
      setError(error.message || 'An unknown error occurred.');
      setProgress(0);
      setProgressMessage('');
    } finally {
      setProcessing(false);
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (fileType === 'video') {
      return <Video className="w-8 h-8 text-purple-400" />;
    }
    return <Music className="w-8 h-8 text-purple-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const shouldShowDownloadLink = () => {
    // Show download link if any processing option (denoise or removeFillers) is selected
    // Hide download link if only summarize is selected
    return options.denoise || options.removeFillers;
  };

  const isProcessing = uploading || processing;

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => window.location.href = '/'} 
                className="text-purple-400 hover:text-purple-300 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Enhanced Login Required Section */}
        {!isLoggedIn ? (
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
                <span className="text-sm text-orange-300 font-medium">{t('auth.authenticationRequired')}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {t('upload.loginRequired.title')}
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('upload.loginRequired.description')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a href="/login">
                  <button className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold text-lg text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center space-x-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10">{t('upload.loginRequired.loginLink')}</span>
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
        ) : (
        <>
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-white">{t('home.hero.badge')}</span> 
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            {t('upload.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('upload.hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            {t('upload.hero.description')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {t('upload.uploadArea.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                  {t('upload.uploadArea.description')}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  {t('upload.uploadArea.button')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.mkv,.mp3,.wav"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-purple-800/30 rounded-xl p-4 sm:p-6 bg-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-medium text-sm sm:text-base truncate">{file.name}</h4>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                        <span className="text-gray-400">{formatFileSize(file.size)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fileType === 'video' ? 'bg-purple-600/30 text-purple-300' : 'bg-pink-600/30 text-pink-300'
                        }`}>
                          {fileType?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-300 truncate pr-2">{progressMessage}</span>
                      <span className="text-xs sm:text-sm text-purple-300 flex-shrink-0">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {uploadResult && !isProcessing && (
                  <div className="mb-4 p-3 sm:p-4 bg-slate-600/30 rounded-lg">
                    <h5 className="text-white font-medium mb-2 text-sm sm:text-base">{t('upload.fileInfo.status')}:</h5>
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <p><span className="text-purple-300">{t('upload.fileInfo.status')}:</span> {uploadResult.message}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.fileId')}:</span> <span className="break-all">{uploadResult.file_id}</span></p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.type')}:</span> {fileType} {t('upload.fileInfo.type')}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.endpoint')}:</span> <span className="break-all">{fileType === 'video' ? '/process-video' : '/process-audio'}</span></p>
                    </div>
                  </div>
                )}

                {processResult && (
                  <div className="p-3 sm:p-4 bg-green-600/10 border border-green-600/30 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      <h5 className="text-green-400 font-medium text-sm sm:text-base">{t('upload.processing.complete')}</h5>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      <p>{t('upload.processing.description', { type: fileType })}</p>
                      
                     
                      {processResult.public_url && shouldShowDownloadLink() && (
                        <p className="mt-2">
                          <a 
                            href={processResult.public_url} // Use the new flat property
                            className="text-purple-400 hover:text-purple-300 underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('upload.processing.downloadLink')}
                          </a>
                        </p>
                      )}

                    </div>
                  </div>
                )}

                {/* Summary Box */}
                {processResult && processResult.summary && (
                  <div className="mb-6 sm:mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">{t('upload.summary.title')}</h3>
                      <button
                        className="text-purple-400 hover:text-purple-200 px-2 sm:px-3 py-1 rounded transition-colors border border-purple-400 hover:bg-purple-500/20 text-xs sm:text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(processResult.summary);
                        }}
                      >
                        {t('common.copy')}
                      </button>
                    </div>
                    <div className="bg-slate-800/80 border border-purple-700 rounded-lg p-3 sm:p-4 text-gray-200 whitespace-pre-line text-sm sm:text-base font-mono overflow-x-auto">
                      {processResult.summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-red-400 font-medium text-sm sm:text-base">{t('upload.errors.processingError')}</h3>
                  <p className="text-red-300 text-xs sm:text-sm mt-1 break-words">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Option Checkboxes */}
          {file && !processResult && (
            <div className="mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Denoise Option */}
                <div
                  className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.denoise ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('denoise')}
                >
                  {/* Tick at top right */}
                  {options.denoise && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center z-10">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <CheckCircle2 className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${options.denoise ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-base sm:text-lg text-center">{t('upload.options.denoise.title')}</span>
                  <span className="text-gray-300 text-center text-xs sm:text-sm mt-2">
                    {t('upload.options.denoise.description')}
                  </span>
                </div>
                {/* Remove Fillers Option */}
                <div
                  className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.removeFillers ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('removeFillers')}
                >
                  {/* Tick at top right */}
                  {options.removeFillers && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center z-10">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <X className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${options.removeFillers ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-base sm:text-lg text-center">{t('upload.options.removeFillers.title')}</span>
                  <span className="text-gray-300 text-center text-xs sm:text-sm mt-2">
                    {t('upload.options.removeFillers.description')}
                  </span>
                </div>
                {/* Summarize Option */}
                <div
                  className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.summarize ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('summarize')}
                >
                  {/* Tick at top right */}
                  {options.summarize && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center z-10">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <AlertCircle className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${options.summarize ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-base sm:text-lg text-center">{t('upload.options.summarize.title')}</span>
                  <span className="text-gray-300 text-center text-xs sm:text-sm mt-2">
                    {t('upload.options.summarize.description')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          {file && !processResult && (
            <div className="text-center">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`px-8 sm:px-12 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all transform ${
                  !isProcessing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t('upload.buttons.uploading')}</span>
                  </div>
                ) : processing ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t('upload.buttons.processing', { type: fileType })}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{t('upload.buttons.process', { type: fileType?.charAt(0).toUpperCase() + fileType?.slice(1) })}</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}