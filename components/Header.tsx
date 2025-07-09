
import React from 'react';
import { AILogo } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800/50 shadow-md backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <AILogo className="w-8 h-8 text-brand-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
            AI Task Analyzer
          </h1>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-white transition-colors"
        >
          View Source
        </a>
      </div>
    </header>
  );
};

export default Header;
