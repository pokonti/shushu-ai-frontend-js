import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Music, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft, } from 'lucide-react';
import AuthService from '../services/authService';
import MiniHeader from '../components/MiniHeader';
import { useTranslation } from 'react-i18next';

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const type = selectedFile.type.startsWith('video') ? 'video' : selectedFile.type.startsWith('audio') ? 'audio' : null;
    if (type) {
      setFile(selectedFile);
      setFileType(type);
      setError(null);
      resetStates();
    } else {
      setFile(null);
      setFileType(null);
      setError('Unsupported file type. Please upload a video or audio file.');
    }
  };

  const resetStates = () => {
    setUploading(false);
    setProcessing(false);
    setProgress(0);
    setProgressMessage('');
    setUploadResult(null);
    setProcessResult(null);
    setError(null);
    setOptions({
      denoise: false,
      removeFillers: false,
      summarize: false
    });
  };

  const uploadFile = async (fileToUpload, fileType, options) => {
    const endpoint = fileType === 'video' ? '/upload-video' : '/upload-audio';
    // Build query string from options
    const params = new URLSearchParams();
    if (options?.denoise) params.append('denoise', 'true');
    if (options?.removeFillers) params.append('remove_fillers', 'true');
    if (options?.summarize) params.append('summarize', 'true');

    const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
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
      if (newProgress < 30) {
        setProgressMessage(t('initializing'));
      } else if (newProgress < 60) {
        setProgressMessage(`${t('processing')} ${fileType}...`);
      } else if (newProgress < 90) {
        setProgressMessage(t('finalizing'));
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

  const handleProcess = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setProgressMessage(t('uploading'));
    setError(null);
    setUploadResult(null);
    setProcessResult(null);

    let progressInterval = null;

    try {
      const uploadRes = await uploadFile(file, fileType, options);
      setUploadResult(uploadRes);
      setUploading(false);
      setProcessing(true);
      setProgressMessage(`${t('processing')} ${fileType}...`);

      // Start simulating processing progress
      progressInterval = simulateProgress();

      const processRes = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: uploadRes.filename }),
      });

      if (!processRes.ok) {
        const errorData = await processRes.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      const result = await processRes.json();
      setProcessResult(result);
      setProgress(100);
      setProgressMessage('Done!');

    } catch (err) {
      console.error('Error during process:', err);
      setError(err.message);
      setUploading(false);
      setProcessing(false);
      setProgress(0);
      setProgressMessage('');
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleOptionChange = (optionName) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      [optionName]: !prevOptions[optionName]
    }));
  };

  const isProcessing = uploading || processing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <MiniHeader />

      <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          {t('dropMedia')}
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center space-x-3 mb-8">
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

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
              {t('dropMedia')}
            </h3>
            <p className="text-gray-400 mb-6">
              {t('supportsFiles')}
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
              accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a,.aac,.flac"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {fileType === 'video' ? (
                  <Video className="w-6 h-6 text-purple-400" />
                ) : (
                  <Music className="w-6 h-6 text-pink-400" />
                )}
                <span className="text-lg font-semibold">{file.name}</span>
                <span className="text-gray-400 text-sm">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <button onClick={removeFile} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-xl font-semibold mb-2">{progressMessage}</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">{Math.round(progress)}%</p>
              </div>
            ) : processResult ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t('success')}</h3>
                <p className="text-gray-400 mb-6">
                  Your {fileType} has been successfully processed.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                  <a
                    href={processResult.output_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>View Processed {fileType?.charAt(0).toUpperCase() + fileType?.slice(1)}</span>
                  </a>
                  <button
                    onClick={removeFile}
                    className="border border-gray-600 text-gray-300 px-8 py-3 rounded-full font-medium hover:border-purple-500 hover:text-white transition-all transform hover:scale-105"
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Processing Options</h2>
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
                      <Music className={`w-8 h-8 mb-2 ${options.denoise ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    <span className="font-semibold text-white text-lg">Denoise Audio</span>
                    <span className="text-gray-300 text-center text-sm mt-2">
                      Clean up background noise for clearer speech and improved audio quality.
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
                    <span className="font-semibold text-white text-lg">{t('removeFillers')}</span>
                    <span className="text-gray-300 text-center text-sm mt-2">
                      {t('removeFillersDesc')}
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
                      <CheckCircle2 className={`w-8 h-8 mb-2 ${options.summarize ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    <span className="font-semibold text-white text-lg">Summarize Content</span>
                    <span className="text-gray-300 text-center text-sm mt-2">
                      Generate concise summaries of your audio/video content for quick overviews.
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                      <span>{t('uploading')}</span>
                    </div>
                  ) : processing ? (
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('processing')} {fileType}...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Play className="w-5 h-5" />
                      <span>{t('process')} {fileType?.charAt(0).toUpperCase() + fileType?.slice(1)}</span>
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