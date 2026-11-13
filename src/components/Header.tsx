import React from 'react';
import { ViewMode, Language } from '../types/genealogy';
import { Network, GitBranch, Layers, Grid3X3, BarChart2, Printer, Globe, Code2 } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  lang: Language;
  onToggleLang: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  lang,
  onToggleLang,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-sm shadow-sm">
            ব
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0">
            {lang === 'bn' ? 'মোল্লা বংশের ধারা' : 'Molla Dynasty Tree'}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => onViewChange('sketch_horizontal')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              currentView === 'sketch_horizontal'
                ? 'text-stone-900 dark:text-white border-stone-900 dark:border-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মূল চিত্ররূপ' : 'Diagram'}</span>
          </button>

          <button
            onClick={() => onViewChange('vertical_tree')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              currentView === 'vertical_tree'
                ? 'text-stone-900 dark:text-white border-stone-900 dark:border-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>{lang === 'bn' ? 'বংশবৃক্ষ' : 'Family Tree'}</span>
          </button>

          <button
            onClick={() => onViewChange('generation_matrix')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              currentView === 'generation_matrix'
                ? 'text-stone-900 dark:text-white border-stone-900 dark:border-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রজন্ম পরিক্রমা' : 'Generations'}</span>
          </button>

          <button
            onClick={() => onViewChange('branch_view')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              currentView === 'branch_view'
                ? 'text-stone-900 dark:text-white border-stone-900 dark:border-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'শাখাভিত্তিক' : 'Branches'}</span>
          </button>

          <button
            onClick={() => onViewChange('statistics')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
              currentView === 'statistics'
                ? 'text-stone-900 dark:text-white border-stone-900 dark:border-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পরিসংখ্যান' : 'Statistics'}</span>
          </button>
        </nav>

        {/* Zone 3: Developer Credit, Language & Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* System Developer: JAYED Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 text-xs whitespace-nowrap shrink-0 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-stone-500 dark:text-stone-400 text-[11px] font-medium hidden sm:inline">
              System Developer:
            </span>
            <span className="font-bold text-stone-900 dark:text-stone-100 tracking-wider font-mono text-[11px]">
              JAYED
            </span>
          </div>

          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            onClick={onPrint}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
