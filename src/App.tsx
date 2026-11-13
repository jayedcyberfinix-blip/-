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
import { StatisticsView } from './components/StatisticsView';
import { SearchFilterBar } from './components/SearchFilterBar';
import { RelationshipFinderModal } from './components/RelationshipFinderModal';
import { Network, GitBranch, Layers, Grid3X3, BarChart2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('sketch_horizontal');
  const [lang, setLang] = useState<Language>('bn');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isSketchOpen, setIsSketchOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRelationFinderOpen, setIsRelationFinderOpen] = useState<boolean>(false);
  const [relationInitialPerson1Id, setRelationInitialPerson1Id] = useState<string | null>(null);
  const [relationshipHighlight, setRelationshipHighlight] = useState<{
    pathIds: string[];
    person1Id: string;
    person2Id: string;
  } | null>(null);
  const [highlightFitKey, setHighlightFitKey] = useState<number>(0);

  // Filters for search/navigation
  const [selectedBranch, setSelectedBranch] = useState<string | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');

  // Compute set of IDs in direct lineage path or relationship path for highlighting
  const highlightedPathIds = useMemo(() => {
    if (relationshipHighlight) {
      return new Set(relationshipHighlight.pathIds);
    }
    if (!selectedMemberId) return new Set<string>();
    const path = getLineagePath(selectedMemberId);
    return new Set(path.map((m) => m.id));
  }, [selectedMemberId, relationshipHighlight]);

  const handleSelectMember = (id: string) => {
    setRelationshipHighlight(null);
    setSelectedMemberId(id);
  };

  const handleOpenRelationFinder = (initialId?: string | null) => {
    setRelationInitialPerson1Id(initialId ?? null);
    setIsRelationFinderOpen(true);
  };

  const handleHighlightRelationPath = (pathIds: string[], person1Id: string, person2Id: string) => {
    setRelationshipHighlight({ pathIds, person1Id, person2Id });
    setSelectedMemberId(null);
    setIsDetailOpen(false);
    setHighlightFitKey((k) => k + 1);
    if (currentView !== 'sketch_horizontal' && currentView !== 'vertical_tree') {
      setCurrentView('sketch_horizontal');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isCanvasView = currentView === 'sketch_horizontal' || currentView === 'vertical_tree';

  return (
    <div
      className={`${
        isCanvasView ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors`}
    >
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
          onOpenRelationFinder={() => handleOpenRelationFinder(selectedMemberId)}
        />
      </div>

      {/* Mobile Navigation Segmented Control */}
      <div className="md:hidden px-2 py-2 bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-around gap-1 text-[11px] overflow-x-auto no-scrollbar no-print">
        <button
          onClick={() => setCurrentView('sketch_horizontal')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            currentView === 'branch_view'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'শাখা' : 'Branch'}</span>
        </button>

        <button
          onClick={() => setCurrentView('statistics')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            currentView === 'statistics'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'পরিসংখ্যান' : 'Stats'}</span>
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 min-h-0 relative overflow-hidden print-area">
        {currentView === 'sketch_horizontal' && (
          <HorizontalTree
            lang={lang}
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => {
              handleSelectMember(id);
              setIsDetailOpen(true);
            }}
            highlightedPathIds={highlightedPathIds}
            highlightFitKey={highlightFitKey}
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
            activeBranchId={selectedBranch}
            onBranchChange={(branchId) => setSelectedBranch(branchId)}
          />
        )}

        {currentView === 'statistics' && (
          <StatisticsView
            lang={lang}
            onSelectBranch={(branchId) => {
              setSelectedBranch(branchId);
              setCurrentView('branch_view');
            }}
          />
        )}
      </main>

      {/* Lineage Path Floating Banner when a member or relationship is highlighted */}
      <div className="no-print">
        <LineagePathBanner
          selectedMemberId={selectedMemberId}
          onClear={() => setSelectedMemberId(null)}
          onOpenDetails={() => setIsDetailOpen(true)}
          lang={lang}
          onSelectMember={(id) => {
            handleSelectMember(id);
            setIsDetailOpen(true);
          }}
          relationshipHighlight={relationshipHighlight}
          onClearRelationship={() => setRelationshipHighlight(null)}
          onOpenRelationFinder={() =>
            handleOpenRelationFinder(relationshipHighlight?.person1Id ?? selectedMemberId)
          }
        />
      </div>

      {/* Person Detail Modal */}
      <PersonDetailModal
        isOpen={isDetailOpen}
        memberId={selectedMemberId}
        onClose={() => setIsDetailOpen(false)}
        lang={lang}
        onSelectMember={(id) => {
          handleSelectMember(id);
        }}
        onFindRelation={(memberId) => {
          setIsDetailOpen(false);
          handleOpenRelationFinder(memberId);
        }}
      />

      {/* Relationship & Kinship Finder Modal */}
      <RelationshipFinderModal
        isOpen={isRelationFinderOpen}
        onClose={() => setIsRelationFinderOpen(false)}
        lang={lang}
        initialPerson1Id={relationInitialPerson1Id}
        onHighlightPath={handleHighlightRelationPath}
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
            onClick={() => {
              setCurrentView('statistics');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
