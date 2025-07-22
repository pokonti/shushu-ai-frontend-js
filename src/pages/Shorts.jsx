import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft, Zap, Scissors } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';
import { uploadAndProcessFile, POLLING_INTERVALS } from '../services/uploadService';
import LoginRequired from '../components/LoginRequired';

export default function Shorts() {
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
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

  useEffect(() => {
    setIsLoggedIn(AuthService.isAuthenticated());
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
        resetStates();
      } else {
        setError(validation.error);
      }
    }
  };

  const validateFile = (file) => {
    // Check file type first - only video files allowed
    if (!isValidFileType(file)) {
      return {
        isValid: false,
        error: t('shorts.errors.invalidFileType')
      };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: t('shorts.errors.fileSizeExceeded', {
          fileSize: formatFileSize(file.size),
          maxSize: formatFileSize(MAX_FILE_SIZE)
        })
      };
    }
    
    return { isValid: true };
  };

  const isValidFileType = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm', ".HEVC"];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
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
    resetStates();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setError(null);
    setProcessing(true);
    setUploading(true);
    setProgress(0);
    setProgressMessage(t('shorts.processing.initializing'));
  
    try {
      const onUploadProgress = (percent) => {
        const uploadProgress = (percent / 100) * 40;
        setProgress(uploadProgress);
        setProgressMessage(t('shorts.processing.uploading', { progress: Math.round(percent) }));
      };

      // Use the uploadAndProcessFile service with shorts-specific options
      const result = await uploadAndProcessFile({
        file,
        fileType: 'video',
        options: {
          denoise: false,
          removeFillers: false,
          generateShorts: true // This would be a new option for shorts generation
        },
        onUploadProgress,
        pollingIntervalMs: POLLING_INTERVALS.NORMAL,
        endpointPrefix: 'shorts'
      });
      
      setProgress(50); 
      setProgressMessage(t('shorts.processing.analyzing'));
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProgress(75);
      setProgressMessage(t('shorts.processing.addingBroll'));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      setProgress(100);
      setProgressMessage(t('shorts.processing.complete'));
      setProcessResult(result);
  
    } catch (error) {
      console.error("An error occurred:", error);
      setError(error.message || t('shorts.errors.unknownError'));
      setProgress(0);
      setProgressMessage('');
    } finally {
      setProcessing(false);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        
        {/* Login Required Section */}
        {!isLoggedIn ? (
          <LoginRequired
            customBadge={t('shorts.loginRequired.badge')}
            customTitle={t('shorts.loginRequired.title')}
            customDescription={t('shorts.loginRequired.description')}
          />
        ) : (
        <>
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8">
              <Scissors className="w-4 h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-white">{t('shorts.badge')}</span> 
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            {t('shorts.title')}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('shorts.titleHighlight')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            {t('shorts.description')}
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
                  {t('shorts.upload.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                  {t('shorts.upload.description')}
                </p>
                <p className="text-xs sm:text-sm text-purple-300 mb-4 sm:mb-6">
                  File size must be 100MB or less
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  {t('shorts.upload.button')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.mkv,.avi,.webm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-purple-800/30 rounded-xl p-4 sm:p-6 bg-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <Video className="w-8 h-8 text-purple-400" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-medium text-sm sm:text-base truncate">{file.name}</h4>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                        <span className="text-gray-400">{formatFileSize(file.size)}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-600/30 text-purple-300">
                          VIDEO
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
                    <h5 className="text-white font-medium mb-2 text-sm sm:text-base">{t('shorts.processing.uploadStatus')}</h5>
                    <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <p><span className="text-purple-300">{t('upload.fileInfo.status')}:</span> {uploadResult.message}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.fileId')}:</span> <span className="break-all">{uploadResult.file_id}</span></p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.type')}:</span> {t('shorts.processing.videoProcessing')}</p>
                    </div>
                  </div>
                )}

                {processResult && (
                  <div className="p-3 sm:p-4 bg-green-600/10 border border-green-600/30 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      <h5 className="text-green-400 font-medium text-sm sm:text-base">{t('shorts.success.title')}</h5>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      <p>{t('shorts.success.description')}</p>
                      
                      {processResult.public_url && (
                        <p className="mt-2">
                          <a 
                            href={processResult.public_url}
                            className="text-purple-400 hover:text-purple-300 underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('shorts.success.downloadLink')}
                          </a>
                        </p>
                      )}
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
                  <h3 className="text-red-400 font-medium text-sm sm:text-base">{t('shorts.errors.title')}</h3>
                  <p className="text-red-300 text-xs sm:text-sm mt-1 break-words">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {file && !processResult && (
            <div className="text-center">
              <button
                onClick={handleGenerate}
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
                    <span className="text-sm sm:text-base">{t('shorts.buttons.uploadingVideo')}</span>
                  </div>
                ) : processing ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t('shorts.buttons.generatingShorts')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{t('shorts.buttons.generateShorts')}</span>
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