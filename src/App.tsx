/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ViewMode, Language } from './types/genealogy';
import { getLineagePath } from './data/familyData';
import { Header } from './components/Header';
import { HorizontalTree } from './components/HorizontalTree';
import { VerticalTree } from './components/VerticalTree';
import { GenerationsMatrix } from './components/GenerationsMatrix';
import { BranchExplorer } from './components/BranchExplorer';
import { PersonDetailModal } from './components/PersonDetailModal';
import { LineagePathBanner } from './components/LineagePathBanner';
import { OriginalSketchModal } from './components/OriginalSketchModal';
import { FamilyStatsModal } from './components/FamilyStatsModal';
import { SearchFilterBar } from './components/SearchFilterBar';
import { Network, GitBranch, Layers, Grid3X3, BarChart2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('sketch_horizontal');
  const [lang, setLang] = useState<Language>('bn');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isSketchOpen, setIsSketchOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  // Filters for search/navigation
  const [selectedBranch, setSelectedBranch] = useState<string | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');

  // Compute set of IDs in direct lineage path for highlighting
  const highlightedPathIds = useMemo(() => {
    if (!selectedMemberId) return new Set<string>();
    const path = getLineagePath(selectedMemberId);
    return new Set(path.map((m) => m.id));
  }, [selectedMemberId]);

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
  };

  const handleOpenDetails = () => {
    if (selectedMemberId) {
      setIsDetailOpen(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
        onPrint={handlePrint}
      />

      {/* Global Search & Filter Strip */}
      <div className="no-print">
        <SearchFilterBar
          lang={lang}
          onSelectMember={(id) => {
            handleSelectMember(id);
            setIsDetailOpen(true);
          }}
          selectedBranch={selectedBranch}
          onSelectBranch={(branch) => {
            setSelectedBranch(branch);
            if (branch !== 'all') {
              setCurrentView('branch_view');
            }
          }}
          selectedGender={selectedGender}
          onSelectGender={setSelectedGender}
        />
      </div>

      {/* Mobile Navigation Segmented Control */}
      <div className="md:hidden px-4 py-2 bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-around gap-1 text-xs no-print">
        <button
          onClick={() => setCurrentView('sketch_horizontal')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer ${
            currentView === 'sketch_horizontal'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'নকশা' : 'Sketch'}</span>
        </button>

        <button
          onClick={() => setCurrentView('vertical_tree')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer ${
            currentView === 'vertical_tree'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'বৃক্ষ' : 'Tree'}</span>
        </button>

        <button
          onClick={() => setCurrentView('generation_matrix')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer ${
            currentView === 'generation_matrix'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'প্রজন্ম' : 'Gens'}</span>
        </button>

        <button
          onClick={() => setCurrentView('branch_view')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer ${
            currentView === 'branch_view'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'শাখা' : 'Branch'}</span>
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden print-area">
        {currentView === 'sketch_horizontal' && (
          <HorizontalTree
            lang={lang}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              handleSelectMember(id);
              setIsDetailOpen(true);
            }}
            highlightedPathIds={highlightedPathIds}
          />
        )}

        {currentView === 'vertical_tree' && (
          <VerticalTree
            lang={lang}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              handleSelectMember(id);
              setIsDetailOpen(true);
            }}
            highlightedPathIds={highlightedPathIds}
          />
        )}

        {currentView === 'generation_matrix' && (
          <GenerationsMatrix
            lang={lang}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              handleSelectMember(id);
              setIsDetailOpen(true);
            }}
            highlightedPathIds={highlightedPathIds}
          />
        )}

        {currentView === 'branch_view' && (
          <BranchExplorer
            lang={lang}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              handleSelectMember(id);
              setIsDetailOpen(true);
            }}
            highlightedPathIds={highlightedPathIds}
          />
        )}
      </main>

      {/* Lineage Path Floating Banner when a member is selected */}
      <div className="no-print">
        <LineagePathBanner
          selectedMemberId={selectedMemberId}
          onClear={() => setSelectedMemberId(null)}
          onOpenDetails={() => setIsDetailOpen(true)}
          lang={lang}
          onSelectMember={(id) => setSelectedMemberId(id)}
        />
      </div>

      {/* Person Detail Modal */}
      <PersonDetailModal
        isOpen={isDetailOpen}
        memberId={selectedMemberId}
        onClose={() => setIsDetailOpen(false)}
        lang={lang}
        onSelectMember={(id) => {
          setSelectedMemberId(id);
        }}
      />

      {/* Original Sketch Modal */}
      <OriginalSketchModal
        isOpen={isSketchOpen}
        onClose={() => setIsSketchOpen(false)}
        lang={lang}
      />

      {/* Family Stats Modal */}
      <FamilyStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        lang={lang}
      />

      {/* Subtle Bottom Bar with Stats Trigger */}
      <footer className="no-print bg-white/80 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 px-4 py-2.5 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{lang === 'bn' ? 'ধনাউল্লা মোল্লা পরিবার বংশলতিকা' : 'Dhonaulla Molla Genealogy'}</span>
          <span>·</span>
          <span>{lang === 'bn' ? '৭ প্রজন্ম সংরক্ষিত' : '7 Generations Documented'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'পরিসংখ্যান' : 'Statistics'}</span>
          </button>
          <span>·</span>
          <span className="font-mono text-stone-600 dark:text-stone-300 font-semibold text-[11px]">
            System Developer: JAYED
          </span>
        </div>
      </footer>
    </div>
  );
}
