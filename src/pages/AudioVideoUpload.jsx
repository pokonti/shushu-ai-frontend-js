import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Music, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft, Zap} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/authService';
import { uploadAndProcessFile } from '../services/uploadService';


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

  const API_BASE_URL = 'http://localhost:8000';

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
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        setFileType(getFileType(droppedFile));
        resetStates();
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        setFileType(getFileType(selectedFile));
        resetStates();
      }
    }
  };

  const isValidFile = (file) => {
    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.mp3', '.wav', '.m4a', '.aac', '.flac'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const getFileType = (file) => {
    const videoExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac'];
    
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

  const simulateProgress = (duration = 30000) => {
    const interval = 100; // Update every 100ms
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 90, 90); // Cap at 90% until actual completion
      setProgress(newProgress);

      // Update progress messages
      if (newProgress < 30) {
        setProgressMessage(t('upload.processing.initializing'));
      } else if (newProgress < 60) {
        setProgressMessage(t('upload.processing.processing', { type: fileType }));
      } else if (newProgress < 90) {
        setProgressMessage(t('upload.processing.finalizing'));
      }

      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, interval);

    return progressInterval;
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

  // const handleProcess = async () => {
  //   if (!file || !fileType) return;
    
  //   setError(null);
  //   setProcessing(true); // We use a single 'processing' state now
  //   setProgress(0);
  //   setProgressMessage(t('upload.processing.initiating'));
  
  //   try {
  //     // This is the progress handler callback for our new service
  //     const onUploadProgress = (percent) => {
  //       // The upload is the first 40% of the total progress bar
  //       const uploadProgress = (percent / 100) * 40;
  //       setProgress(uploadProgress);
  //       setProgressMessage(t('upload.processing.uploading', { progress: Math.round(percent) }));
  //     };
  
  //     // Call the new, all-in-one service function
  //     const result = await uploadAndProcessFile({
  //       file,
  //       options,
  //       onUploadProgress,
  //     });
      
  //     // Once the upload is done, we move to the processing stage
  //     setProgress(50); // Set progress to 50% to show processing has started
  //     setProgressMessage(t('upload.processing.processing', { type: fileType }));
      
  //     // Simulate a bit of extra time for backend processing if needed,
  //     // or you can remove this if your backend is fast.
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  
  //     // All done!
  //     setProgress(100);
  //     setProgressMessage(t('upload.processing.complete'));
  //     setProcessResult(result); // The result from our backend's /process-file endpoint
  
  //   } catch (error) {
  //     console.error("An error occurred:", error);
  //     setError(error.message || 'An unknown error occurred.');
  //     setProgress(0);
  //     setProgressMessage('');
  //   } finally {
  //     setProcessing(false); // Make sure to turn off the processing state
  //     setUploading(false); // also turn off old state if you still use it
  //   }
  // };
  
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
        fileType, // <-- THIS IS THE ONLY LINE YOU NEED TO ADD
        options,
        onUploadProgress,
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

  const isProcessing = uploading || processing;

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            </div>
            
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">{t('home.hero.badge')}</span> 
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('upload.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('upload.hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('upload.hero.description')}
          </p>
        </div>


        {/* Block upload if not logged in */}
        {!isLoggedIn ? (
          <div className="max-w-2xl mx-auto bg-slate-800/60 border border-purple-800/30 rounded-2xl p-10 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">{t('upload.loginRequired.title')}</h2>
            <p className="text-gray-300 mb-6">{t('upload.loginRequired.description')} <br/> <a href="/login" className="text-purple-400 underline hover:text-purple-300">{t('upload.loginRequired.loginLink')}</a> {t('common.back')}.</p>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8 mb-8">
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
                  {t('upload.uploadArea.title')}
                </h3>
                <p className="text-gray-400 mb-6">
                  {t('upload.uploadArea.description')}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  {t('upload.uploadArea.button')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a,.aac,.flac"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="border border-purple-800/30 rounded-xl p-6 bg-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file)}
                    <div>
                      <h4 className="text-white font-medium">{file.name}</h4>
                      <div className="flex items-center space-x-4 text-sm">
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
                
                {uploadResult && !isProcessing && (
                  <div className="mb-4 p-4 bg-slate-600/30 rounded-lg">
                    <h5 className="text-white font-medium mb-2">{t('upload.fileInfo.status')}:</h5>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p><span className="text-purple-300">{t('upload.fileInfo.status')}:</span> {uploadResult.message}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.fileId')}:</span> {uploadResult.file_id}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.type')}:</span> {fileType} {t('upload.fileInfo.type')}</p>
                      <p><span className="text-purple-300">{t('upload.fileInfo.endpoint')}:</span> {fileType === 'video' ? '/process-video' : '/process-audio'}</p>
                    </div>
                  </div>
                )}

                {processResult && (
                  <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-lg mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h5 className="text-green-400 font-medium">{t('upload.processing.complete')}</h5>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>{t('upload.processing.description', { type: fileType })}</p>
                      
                     
                      {processResult.public_url && (
                        <p className="mt-2">
                          <a 
                            href={processResult.public_url} // Use the new flat property
                            className="text-purple-400 hover:text-purple-300 underline"
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
                  <div className="mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{t('upload.summary.title')}</h3>
                      <button
                        className="text-purple-400 hover:text-purple-200 px-3 py-1 rounded transition-colors border border-purple-400 hover:bg-purple-500/20 text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(processResult.summary);
                        }}
                      >
                        {t('common.copy')}
                      </button>
                    </div>
                    <div className="bg-slate-800/80 border border-purple-700 rounded-lg p-4 text-gray-200 whitespace-pre-line text-base font-mono overflow-x-auto">
                      {processResult.summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-medium">{t('upload.errors.processingError')}</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Option Checkboxes */}
          {file && !processResult && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Denoise Option */}
                <div
                  className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.denoise ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('denoise')}
                >
                  {/* Tick at top right */}
                  {options.denoise && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center z-10">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <CheckCircle2 className={`w-8 h-8 mb-2 ${options.denoise ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-lg">{t('upload.options.denoise.title')}</span>
                  <span className="text-gray-300 text-center text-sm mt-2">
                    {t('upload.options.denoise.description')}
                  </span>
                </div>
                {/* Remove Fillers Option */}
                <div
                  className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.removeFillers ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('removeFillers')}
                >
                  {/* Tick at top right */}
                  {options.removeFillers && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center z-10">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <X className={`w-8 h-8 mb-2 ${options.removeFillers ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-lg">{t('upload.options.removeFillers.title')}</span>
                  <span className="text-gray-300 text-center text-sm mt-2">
                    {t('upload.options.removeFillers.description')}
                  </span>
                </div>
                {/* Summarize Option */}
                <div
                  className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all shadow-md select-none relative ${
                    options.summarize ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400' : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('summarize')}
                >
                  {/* Tick at top right */}
                  {options.summarize && (
                    <span className="absolute top-2 right-2 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center z-10">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <div className="flex flex-col items-center mb-2">
                    <AlertCircle className={`w-8 h-8 mb-2 ${options.summarize ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-semibold text-white text-lg">{t('upload.options.summarize.title')}</span>
                  <span className="text-gray-300 text-center text-sm mt-2">
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
                className={`px-12 py-4 rounded-full font-semibold text-lg transition-all transform ${
                  !isProcessing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('upload.buttons.uploading')}</span>
                  </div>
                ) : processing ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('upload.buttons.processing', { type: fileType })}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5" />
                    <span>{t('upload.buttons.process', { type: fileType?.charAt(0).toUpperCase() + fileType?.slice(1) })}</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}