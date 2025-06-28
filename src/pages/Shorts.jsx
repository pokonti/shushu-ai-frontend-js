// import React, { useState, useRef } from 'react';
// import { Upload, Video, Loader2, CheckCircle2, X, AlertCircle, Play, ArrowLeft, Zap } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { uploadFile } from '../services/uploadService';

// export default function Shorts() {
//   const { t } = useTranslation();
//   const [file, setFile] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [progressMessage, setProgressMessage] = useState('');
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const fileInputRef = useRef(null);

//   const isValidFile = (file) => {
//     const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
//     return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const droppedFile = e.dataTransfer.files[0];
//       if (isValidFile(droppedFile)) {
//         setFile(droppedFile);
//         setResult(null);
//         setError(null);
//       }
//     }
//   };

//   const handleFileSelect = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       if (isValidFile(selectedFile)) {
//         setFile(selectedFile);
//         setResult(null);
//         setError(null);
//       }
//     }
//   };

//   const removeFile = () => {
//     setFile(null);
//     setResult(null);
//     setError(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const simulateProgress = (duration = 20000) => {
//     const interval = 100;
//     const steps = duration / interval;
//     let currentStep = 0;
//     const progressInterval = setInterval(() => {
//       currentStep++;
//       const newProgress = Math.min((currentStep / steps) * 90, 90);
//       setProgress(newProgress);
//       if (newProgress < 30) {
//         setProgressMessage(t('upload.processing.initializing'));
//       } else if (newProgress < 60) {
//         setProgressMessage(t('upload.processing.processing', { type: 'video' }));
//       } else if (newProgress < 90) {
//         setProgressMessage(t('upload.processing.finalizing'));
//       }
//       if (currentStep >= steps) {
//         clearInterval(progressInterval);
//       }
//     }, interval);
//     return progressInterval;
//   };

//   const handleProcess = async () => {
//     if (!file) return;
//     setError(null);
//     setUploading(true);
//     setProgress(0);
//     setProgressMessage(t('upload.processing.uploading'));
//     try {
//       const uploadResponse = await uploadFile({
//         file,
//         fileType: 'video',
//         endpoint: '/generate-shorts',
//       });
//       setUploading(false);
//       setProcessing(true);
//       setProgress(10);
//       setProgressMessage(t('upload.processing.processingStatus'));
//       const progressInterval = simulateProgress();
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       clearInterval(progressInterval);
//       setProgress(100);
//       setProgressMessage(t('upload.processing.complete'));
//       setResult(uploadResponse);
//       setProcessing(false);
//     } catch (error) {
//       setError(error.message);
//       setUploading(false);
//       setProcessing(false);
//       setProgress(0);
//       setProgressMessage('');
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const isProcessing = uploading || processing;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
//       <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-800/30">
//         <div className="max-w-6xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button 
//                 onClick={() => window.location.href = '/'} 
//                 className="text-purple-400 hover:text-purple-300 transition-colors"
//               >
//                 <ArrowLeft className="w-6 h-6" />
//               </button>
//               {/* <h1 className="text-2xl font-bold text-white">Shorts Generator</h1> */}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="container mx-auto px-6 py-12">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//         <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
//               <Zap className="w-4 h-4 text-yellow-400" />
//               <span className="text-sm text-white">{t('home.hero.badge')}</span> 
//           </div>
          
//           <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
//             {t('upload.hero.title')}
//             <br />
//             <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//               {t('upload.hero.titleHighlight')}
//             </span>
//           </h1>
          
//           <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
//           {t('shorts.description')}
//           </p>
//         </div>
        
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-8 mb-8">
//             {!file ? (
//               <div
//                 className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
//                   dragActive 
//                     ? 'border-purple-400 bg-purple-400/10' 
//                     : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//               >
//                 <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">
//                   Upload your video file
//                 </h3>
//                 <p className="text-gray-400 mb-6">
//                   Only video files are supported (.mp4, .mov, .mkv, .avi, .webm)
//                 </p>
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
//                 >
//                   Choose File
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   className="hidden"
//                   accept=".mp4,.mov,.mkv,.avi,.webm"
//                   onChange={handleFileSelect}
//                 />
//               </div>
//             ) : (
//               <div className="border border-purple-800/30 rounded-xl p-6 bg-slate-700/30">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-4">
//                     <Video className="w-8 h-8 text-purple-400" />
//                     <div>
//                       <h4 className="text-white font-medium">{file.name}</h4>
//                       <div className="flex items-center space-x-4 text-sm">
//                         <span className="text-gray-400">{formatFileSize(file.size)}</span>
//                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-600/30 text-purple-300">
//                           VIDEO
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     onClick={removeFile}
//                     className="text-gray-400 hover:text-red-400 transition-colors"
//                     disabled={isProcessing}
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//                 {/* Progress Bar */}
//                 {isProcessing && (
//                   <div className="mb-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-300">{progressMessage}</span>
//                       <span className="text-sm text-purple-300">{Math.round(progress)}%</span>
//                     </div>
//                     <div className="w-full bg-slate-600 rounded-full h-2">
//                       <div 
//                         className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
//                         style={{ width: `${progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//                 {result && !isProcessing && (
//                   <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-lg mb-6">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <CheckCircle2 className="w-5 h-5 text-green-400" />
//                       <h5 className="text-green-400 font-medium">Short Generated!</h5>
//                     </div>
//                     <div className="text-sm text-gray-300">
//                       <p>Your viral short is ready.</p>
//                       {result.output_url && (
//                         <p className="mt-2">
//                           <a 
//                             href={result.output_url} 
//                             className="text-purple-400 hover:text-purple-300 underline"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             Download Short
//                           </a>
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
//               <div className="flex items-center space-x-3">
//                 <AlertCircle className="w-5 h-5 text-red-400" />
//                 <div>
//                   <h3 className="text-red-400 font-medium">Error</h3>
//                   <p className="text-red-300 text-sm mt-1">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* Process Button */}
//           {file && !result && (
//             <div className="text-center">
//               <button
//                 onClick={handleProcess}
//                 disabled={isProcessing}
//                 className={`px-12 py-4 rounded-full font-semibold text-lg transition-all transform ${
//                   !isProcessing
//                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105'
//                     : 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                 }`}
//               >
//                 {uploading ? (
//                   <div className="flex items-center space-x-3">
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span>Uploading...</span>
//                   </div>
//                 ) : processing ? (
//                   <div className="flex items-center space-x-3">
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span>Processing...</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center space-x-3">
//                     <Play className="w-5 h-5" />
//                     <span>Generate Short</span>
//                   </div>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// } 