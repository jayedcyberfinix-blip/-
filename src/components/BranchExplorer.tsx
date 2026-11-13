import React, { useState } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { BRANCHES, FAMILY_MEMBERS, MEMBERS_MAP, getAllDescendantIds } from '../data/familyData';
import { Users, Heart, GitBranch, ChevronRight } from 'lucide-react';

interface BranchExplorerProps {
  lang: Language;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  highlightedPathIds: Set<string>;
  activeBranchId?: string;
  onBranchChange?: (branchId: string) => void;
}

export const BranchExplorer: React.FC<BranchExplorerProps> = ({
  lang,
  selectedMemberId,
  onSelectMember,
  highlightedPathIds,
  activeBranchId,
  onBranchChange,
}) => {
  const [internalBranchId, setInternalBranchId] = useState<string>('nazrul');
  const selectedBranchId =
    activeBranchId && activeBranchId !== 'all' ? activeBranchId : internalBranchId;
  const setSelectedBranchId = (id: string) => {
    setInternalBranchId(id);
    onBranchChange?.(id);
  };

  const currentBranch = BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0];

  // Members belonging to this branch
  const branchMembers = FAMILY_MEMBERS.filter((m) => m.branchId === selectedBranchId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {lang === 'bn' ? 'শাখাভিত্তিক বংশধারা অন্বেষণ' : 'Family Branch Explorer'}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {lang === 'bn'
            ? 'ওয়াজেদ আলী মোল্লার সন্তানবর্গের একেকটি স্বতন্ত্র পরিবার ও বংশধারার চিত্র।'
            : 'Detailed exploration of each major branch stemming from Wazed Ali Molla.'}
        </p>
      </div>

      {/* Branch Selector Chips / Tabs */}
      <div className="flex items-center gap-2 pb-4 overflow-x-auto no-scrollbar mb-8">
        {BRANCHES.map((branch) => {
          const isCurrent = branch.id === selectedBranchId;
          const count = FAMILY_MEMBERS.filter((m) => m.branchId === branch.id).length;

          return (
            <button
              key={branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm ${
                isCurrent
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: branch.color }}
              />
              <span>{lang === 'bn' ? branch.nameBn : branch.nameEn}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isCurrent
                    ? 'bg-stone-800 text-stone-200 dark:bg-stone-200 dark:text-stone-800'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Branch Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentBranch.color }}
              />
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {lang === 'bn' ? currentBranch.nameBn : currentBranch.nameEn}
              </h3>
            </div>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              {lang === 'bn' ? currentBranch.leaderBn : currentBranch.leaderEn}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="block text-xl font-bold text-stone-900 dark:text-stone-100">
                {branchMembers.length}
              </span>
              <span>{lang === 'bn' ? 'সদস্য তালিকাভুক্ত' : 'Recorded Members'}</span>
            </div>
            <div className="w-px h-8 bg-stone-200 dark:bg-stone-800" />
            <div>
              <span className="block text-xl font-bold text-stone-900 dark:text-stone-100">
                {new Set(branchMembers.map((m) => m.generation)).size}
              </span>
              <span>{lang === 'bn' ? 'প্রজন্ম ব্যাপ্তি' : 'Generations Span'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Members Grouped by Generation */}
      <div className="space-y-6">
        {[4, 5, 6, 7].map((gen) => {
          const genMembers = branchMembers.filter((m) => m.generation === gen);
          if (genMembers.length === 0) return null;

          return (
            <div key={gen} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <span>
                  {lang === 'bn'
                    ? `${gen === 4 ? '৪র্থ প্রজন্ম (শাখা প্রধান)' : `${gen}ম প্রজন্ম`}`
                    : `Generation ${gen}`}
                </span>
                <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {genMembers.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  const isInPath = highlightedPathIds.has(member.id);

                  let border =
                    'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900';
                  if (isSelected) {
                    border =
                      'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/30';
                  } else if (isInPath) {
                    border =
                      'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 dark:bg-amber-950/20';
                  }

                  return (
                    <div
                      key={member.id}
                      onClick={() => onSelectMember(member.id)}
                      className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${border}`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            member.gender === 'male'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {member.gender === 'male' ? '♂' : '♀'}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          Gen {member.generation}
                        </span>
                      </div>

                      <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        {lang === 'bn' ? member.nameBn : member.nameEn}
                      </h5>

                      {member.spouse && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mb-2">
                          <Heart className="w-3 h-3 fill-current shrink-0" />
                          <span>
                            {lang === 'bn' ? member.spouse.nameBn : member.spouse.nameEn}
                          </span>
                        </div>
                      )}

                      {member.notesBn && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                          {lang === 'bn' ? member.notesBn : member.notesEn}
                        </p>
                      )}

                      {member.childrenIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                          <span>
                            {member.childrenIds.length}{' '}
                            {lang === 'bn' ? 'সন্তান' : 'children'}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            {lang === 'bn' ? 'বিস্তারিত' : 'View'}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
