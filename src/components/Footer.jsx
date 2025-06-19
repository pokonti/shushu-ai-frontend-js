import React from 'react';
import { Wand2 } from 'lucide-react';

const Footer = () => (
  <footer className="py-12 px-6 border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">ShuShu AI</span>
        </div>

        <div className="flex items-center space-x-6 text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="https://www.nfactorial.school/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Made in n!</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
