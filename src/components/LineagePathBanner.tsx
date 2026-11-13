import React from 'react';
import { Language } from '../types/genealogy';
import { MEMBERS_MAP, getLineagePath } from '../data/familyData';
import { ArrowRight, Sparkles, X, Info, GitFork, Compass } from 'lucide-react';

interface RelationshipHighlight {
  pathIds: string[];
  person1Id: string;
  person2Id: string;
}

interface LineagePathBannerProps {
  selectedMemberId: string | null;
  onClear: () => void;
  onOpenDetails: () => void;
  lang: Language;
  onSelectMember: (id: string) => void;
  relationshipHighlight?: RelationshipHighlight | null;
  onClearRelationship?: () => void;
  onOpenRelationFinder?: () => void;
}

export const LineagePathBanner: React.FC<LineagePathBannerProps> = ({
  selectedMemberId,
  onClear,
  onOpenDetails,
  lang,
  onSelectMember,
  relationshipHighlight,
  onClearRelationship,
  onOpenRelationFinder,
}) => {
  if (relationshipHighlight) {
    const steps = relationshipHighlight.pathIds
      .map((id) => MEMBERS_MAP.get(id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    if (steps.length === 0) return null;

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-[calc(100%-2rem)] bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-amber-300 dark:border-amber-800 shadow-xl p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100 min-w-0">
            <GitFork className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              {lang === 'bn' ? 'হাইলাইটকৃত পারিবারিক সম্পর্ক' : 'Highlighted Relationship Path'}
            </span>
            <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400 shrink-0">
              ({steps.length} {lang === 'bn' ? 'ধাপ' : 'steps'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenRelationFinder && (
              <button
                type="button"
                onClick={onOpenRelationFinder}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পরিবর্তন' : 'Change'}</span>
              </button>
            )}
            {onClearRelationship && (
              <button
                type="button"
                onClick={onClearRelationship}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Clear highlight"
                aria-label="Clear highlight"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Relationship Chain Breadcrumbs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          {steps.map((item, idx) => {
            const isEndpoint =
              item.id === relationshipHighlight.person1Id ||
              item.id === relationshipHighlight.person2Id;
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectMember(item.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                    isEndpoint
                      ? 'bg-amber-800 text-white font-bold shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-medium'
                  }`}
                >
                  <span>{lang === 'bn' ? item.nameBn : item.nameEn}</span>
                  <span className="text-[10px] opacity-75 font-mono">G{item.generation}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  if (!selectedMemberId) return null;

  const member = MEMBERS_MAP.get(selectedMemberId);
  if (!member) return null;

  const path = getLineagePath(selectedMemberId);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-[calc(100%-2rem)] bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          <span>
            {lang === 'bn' ? 'চিহ্নিত বংশধারা পরিক্রমা' : 'Traced Lineage Path'}
          </span>
          <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
            ({path.length} {lang === 'bn' ? 'প্রজন্মের বিস্তার' : 'generations span'})
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenDetails}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Clear highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        {path.map((item, idx) => {
          const isTarget = item.id === selectedMemberId;
          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => onSelectMember(item.id)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  isTarget
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium'
                }`}
              >
                <span>{lang === 'bn' ? item.nameBn : item.nameEn}</span>
                <span className="text-[10px] opacity-75 font-mono">G{item.generation}</span>
              </button>
              {idx < path.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
