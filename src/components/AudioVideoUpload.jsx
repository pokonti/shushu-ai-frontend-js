import React, { useState, useRef } from 'react';
import { Upload, File, Video, Music, Loader2, CheckCircle2, X, Zap } from 'lucide-react';
import Header from './Header';

export default function AudioVideoUpload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [options, setOptions] = useState({
    denoise: false,
    removeFillers: false,
    getSummary: false
  });
  const [processed, setProcessed] = useState(false);
  const fileInputRef = useRef(null);

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
        setProcessed(false);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        setProcessed(false);
      }
    }
  };

  const isValidFile = (file) => {
    const validTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'
    ];
    return validTypes.some(type => file.type.includes(type.split('/')[1])) || 
           file.name.match(/\.(mp3|wav|m4a|aac|mp4|avi|mov|wmv|mkv)$/i);
  };

  const removeFile = () => {
    setFile(null);
    setProcessed(false);
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
    if (!file) return;
    
    setProcessing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    setProcessing(false);
    setProcessed(true);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|wmv|mkv)$/i)) {
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

  const canProcess = file && (options.denoise || options.removeFillers || options.getSummary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* <Header/> */}
      <div className="container mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">AI-Powered Video & Podcast Editor</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Content Into
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Professional Media
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your audio or video files and let our AI enhance them with advanced
            denoising, filler word removal, and intelligent summarization.
          </p>
        </div>

        {/* Upload Section */}
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
                  Drop your files here, or browse
                </h3>
                <p className="text-gray-400 mb-6">
                  Supports MP3, WAV, M4A, AAC, MP4, AVI, MOV, WMV, MKV
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="audio/*,video/*"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="border border-purple-800/30 rounded-xl p-6 bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file)}
                    <div>
                      <h4 className="text-white font-medium">{file.name}</h4>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Options */}
          {file && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Processing Options</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    options.denoise
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('denoise')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Denoise</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      options.denoise ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                    }`}>
                      {options.denoise && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Remove background noise and enhance audio clarity using advanced AI algorithms.
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    options.removeFillers
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('removeFillers')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Remove Filler Words</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      options.removeFillers ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                    }`}>
                      {options.removeFillers && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Automatically detect and remove "um", "uh", and other filler words from speech.
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    options.getSummary
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-400'
                  }`}
                  onClick={() => handleOptionChange('getSummary')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Get Summary</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      options.getSummary ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                    }`}>
                      {options.getSummary && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Generate an intelligent summary of your content with key points and insights.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          {file && (
            <div className="text-center">
              <button
                onClick={handleProcess}
                disabled={!canProcess || processing}
                className={`px-12 py-4 rounded-full font-semibold text-lg transition-all transform ${
                  canProcess && !processing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : processed ? (
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Processing Complete!</span>
                  </div>
                ) : (
                  'Start Processing'
                )}
              </button>
              
              {!canProcess && file && (
                <p className="text-gray-400 text-sm mt-3">
                  Please select at least one processing option
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}