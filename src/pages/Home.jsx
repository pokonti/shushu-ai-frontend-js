import React, { useState, useEffect } from 'react';
import { Play, Zap, CheckCircle, ArrowRight, Music, AudioWaveform, Music2, Music3, Music4} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useFeatures } from '../data/features'

const Home = () => {
  const { t } = useTranslation();
  const features = useFeatures();
  const [audioLevel, setAudioLevel] = useState(0);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling past hero section
      const scrollPosition = window.scrollY;
      setShowFloatingCTA(scrollPosition > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Floating musical notes animation data
  const floatingNotes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 5,
    icon: [Music, Music2, Music3, Music4, AudioWaveform][Math.floor(Math.random() * 5)]
  }));

  // Audio waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    height: Math.random() * 60 + 20,
    delay: i * 0.1
  }));

  const beforeVideoUrl = 'https://shushu-space.fra1.digitaloceanspaces.com/demo/example/original.mov';
  const afterVideoUrl = 'https://shushu-space.fra1.digitaloceanspaces.com/demo/example/denoised.mov';

  // Video error handling
  const handleVideoError = (e, videoName) => {
    const video = e.target;
    console.error(`Error loading ${videoName} video:`, {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      currentSrc: video.currentSrc,
      src: video.src
    });
    
    if (video.error) {
      const errorCodes = {
        1: 'MEDIA_ERR_ABORTED - The fetching process was stopped.',
        2: 'MEDIA_ERR_NETWORK - A network error occurred.',
        3: 'MEDIA_ERR_DECODE - An error occurred while decoding.',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The audio/video format is not supported.'
      };
      console.log(`Error: ${errorCodes[video.error.code] || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Floating Musical Notes Background */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingNotes.map((note) => {
          const IconComponent = note.icon;
          return (
            <div
              key={note.id}
              className="absolute opacity-20 animate-bounce"
              style={{
                left: `${note.x}%`,
                top: `${note.y}%`,
                animationDelay: `${note.delay}s`,
                animationDuration: `${note.duration}s`,
                fontSize: `${note.size}px`
              }}
            >
              <IconComponent className="text-purple-400" style={{ width: note.size, height: note.size }} />
            </div>
          );
        })}
      </div>

      {/* Animated Audio Waveform Background */}
      <div className="fixed bottom-0 left-0 right-0 h-32 flex items-end justify-center space-x-1 opacity-10 pointer-events-none">
        {waveformBars.map((bar) => (
          <div
            key={bar.id}
            className="bg-gradient-to-t from-purple-500 to-pink-500 w-2 animate-pulse"
            style={{
              height: `${bar.height}%`,
              animationDelay: `${bar.delay}s`
            }}
          />
        ))}
      </div>

      <Header />
       

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 md:pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium tracking-wide">{t('home.hero.badge')}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight tracking-tight">
              {t('home.hero.title')}
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold tracking-tighter">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col items-center justify-center space-y-6 mb-12">
              {/* Primary CTA - Most Prominent */}
              <Link to="/editor" className="group">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center space-x-3 text-white border-0 min-w-[280px] justify-center tracking-wide">
                  <span>{t('home.hero.startCreating')}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              {/* Secondary CTA - Subtle */}
              <a href="#demo" className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors group-hover:scale-105">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="font-medium tracking-wide">{t('home.hero.watchDemo')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -left-8 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Flow Indicator */}
        <div className="flex justify-center pb-8">
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2">{t('home.flow.seeHowItWorks', 'See how it works')}</div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-purple-500 to-transparent"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

     {/* Interactive Demo Section - Before/After */}
      <section id="demo" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 md:p-16 shadow-2xl">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                {t('home.demo.title')}
              </h3>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                {t('home.demo.beforeAfterDescription')}
              </p>
            </div>

            {/* Before/After Video Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
              
              {/* Before Video */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl p-4 sm:p-6 border border-red-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg sm:text-xl font-semibold text-red-400">{t('home.demo.before')}</h4>
                    <div className="px-2 sm:px-3 py-1 bg-red-500/20 rounded-full text-xs sm:text-sm text-red-300">
                      {t('home.demo.rawAudio')}
                    </div>
                  </div>
                  
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                    <video 
                      className="w-full h-40 sm:h-48 md:h-56 object-cover"
                      controls
                      preload="metadata"
                      playsInline
                      onError={(e) => handleVideoError(e, 'before')}
                      onLoadStart={() => console.log('Before video: Loading started')}
                      onCanPlay={() => console.log('Before video: Can play')}
                      onLoadedMetadata={() => console.log('Before video: Metadata loaded')}
                    >
                      <source src={beforeVideoUrl} type="video/quicktime" />
                      <source src={beforeVideoUrl} type="video/mp4" />
                      <source src={beforeVideoUrl} type="video/mov" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Audio Quality Indicators */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{t('home.demo.backgroundNoise')}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{t('home.demo.clarity')}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After Video */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl p-4 sm:p-6 border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-green-400">{t('home.demo.after')}</h4>
                    <div className="px-3 py-1 bg-green-500/20 rounded-full text-sm text-green-300">
                      {t('home.demo.enhancedAudio')}
                    </div>
                  </div>
                  
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                  <video 
                    className="w-full h-40 sm:h-48 md:h-56 object-cover"
                    controls
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => handleVideoError(e, 'after')}
                    onLoadStart={() => console.log('After video: Loading started')}
                    onCanPlay={() => console.log('After video: Can play')}
                    onLoadedMetadata={() => console.log('After video: Metadata loaded')}
                  >
                      <source src={afterVideoUrl} type="video/quicktime" />
                      <source src={afterVideoUrl} type="video/mp4" />
                      <source src={afterVideoUrl} type="video/mov" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Audio Quality Indicators */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{t('home.demo.backgroundNoise')}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{t('home.demo.clarity')}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Flow Indicator */}
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2">{t('home.flow.exploreFeatures', 'Explore our features')}</div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-purple-500 to-transparent"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Audio Waves */}
          <div className="absolute top-16 left-8 w-24 h-24 opacity-10">
            <div className="flex items-end space-x-1 h-full">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-purple-500 to-pink-500 w-1.5 animate-pulse"
                  style={{
                    height: `${30 + Math.sin(Date.now() / 1000 + i) * 40}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 + i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Video Frame Elements */}
          <div className="absolute top-24 right-12 w-18 h-12 border-2 border-purple-400/20 rounded opacity-20 animate-pulse"></div>
          <div className="absolute bottom-24 left-1/4 w-16 h-10 border-2 border-pink-400/20 rounded opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t('home.features.title')} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('home.features.titleHighlight')}</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          {/* Features Grid with Creative Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                
                {/* Feature Card with Advanced Design */}
                <div className="relative bg-gradient-to-br from-slate-800/40 via-purple-900/20 to-slate-800/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 overflow-hidden transform transition-all duration-700 hover:scale-105 hover:border-purple-400/40">
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                    
                    {/* Sound Wave Animation for Audio Features */}
                    {(index === 0 || index === 2) && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center space-x-1 opacity-20">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-t from-purple-400 to-pink-400 w-1 animate-pulse"
                            style={{
                              height: `${20 + Math.sin(i * 0.5) * 30}%`,
                              animationDelay: `${i * 0.05}s`,
                              animationDuration: '1.5s'
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Video Frame Animation for Video Features */}
                    {(index === 1 || index === 3) && (
                      <div className="absolute top-4 right-4 opacity-20">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute w-12 h-8 border border-purple-400 rounded"
                            style={{
                              transform: `translate(${i * 4}px, ${i * 4}px)`,
                              opacity: 1 - (i * 0.3)
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with Enhanced Design */}
                    <div className="mb-4 relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/20 group-hover:scale-110 transition-transform duration-500">
                        <div className="text-purple-400 group-hover:text-purple-300 transition-colors text-xl">
                          {feature.icon}
                        </div>
                      </div>
                      
                      {/* Processing Indicator */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>

                    {/* Progress Bar Animation */}
                    <div className="mt-4 relative">
                      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                      </div>
                      <div className="absolute right-0 top-2 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-500">
                        AI Processing
                      </div>
                    </div>
                  </div>

                </div>

                {/* Enhanced Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-pink-500/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                
                {/* Connection Lines Between Features */}
                {index < features.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-12 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent transform -translate-y-1/2 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flow Indicator */}
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2">{t('home.flow.choosePlan', 'Choose your plan')}</div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-purple-500 to-transparent"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              {t('home.pricing.title')} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('home.pricing.titleHighlight')}</span> {t('home.pricing.titleSuffix')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              {t('home.pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Free Plan */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('home.pricing.free.title')}</h3>
                <div className="text-4xl font-bold mb-4">{t('home.pricing.free.price')}</div>
                <p className="text-gray-400">{t('home.pricing.free.description')}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.free.feature1')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.free.feature2')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.free.feature3')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.free.feature4')}</span>
                </li>
              </ul>
              
              <Link to="/editor">
                <button className="w-full border-2 border-white/30 hover:border-purple-500/70 hover:bg-purple-500/10 py-4 rounded-full font-semibold transition-all hover:scale-[1.02] text-white">
                  {t('home.pricing.free.button')}
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 md:p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {t('home.pricing.pro.popular')}
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('home.pricing.pro.title')}</h3>
                {/* <div className="text-4xl font-bold mb-2">{t('home.pricing.pro.price')}</div> */}
                <div className="text-gray-400 mb-4">{t('home.pricing.pro.period')}</div>
                <p className="text-gray-300">{t('home.pricing.pro.description')}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.pro.feature1')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.pro.feature2')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.pro.feature3')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.pro.feature4')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('home.pricing.pro.feature5')}</span>
                </li>
              </ul>
              
              <Link to="/editor">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all text-white border-0 flex items-center justify-center space-x-2">
                  <span>{t('home.pricing.pro.button')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>
            
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Primary CTA */}
              <Link to="/editor" className="group">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center space-x-3 text-white border-0 min-w-[300px] justify-center">
                  <span>{t('home.cta.button')}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              {/* Trust Indicators */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>{t('home.cta.freeStart', 'Free to start')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>{t('home.cta.instantAccess', 'Instant access')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>{t('home.cta.noInstall', 'No installation')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      {showFloatingCTA && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <Link to="/editor" className="group">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center space-x-2 text-white border-0 shadow-xl">
              <span>{t('home.floating.enhanceAudio', 'Enhance Audio')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      )}

      <Footer/>
    </div>
  );
};

export default Home;