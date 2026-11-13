import React, { useEffect } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { MEMBERS_MAP, getLineagePath, getChildrenOf, GENERATION_LABELS } from '../data/familyData';
import { X, Heart, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface PersonDetailModalProps {
  isOpen: boolean;
  memberId: string | null;
  onClose: () => void;
  lang: Language;
  onSelectMember: (id: string) => void;
  onFindRelation?: (memberId: string) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  isOpen,
  memberId,
  onClose,
  lang,
  onSelectMember,
  onFindRelation,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !memberId) return null;

  const member = MEMBERS_MAP.get(memberId);
  if (!member) return null;

  const lineagePath = getLineagePath(memberId);
  const children = getChildrenOf(memberId);
  const parent = member.parentId ? MEMBERS_MAP.get(member.parentId) : null;

  // Siblings: children of the same parent excluding self
  const siblings = parent
    ? parent.childrenIds
        .filter((cid) => cid !== member.id)
        .map((cid) => MEMBERS_MAP.get(cid))
        .filter((m): m is FamilyMember => !!m)
    : [];

  const genInfo = GENERATION_LABELS[member.generation];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer z-20"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-10">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                member.gender === 'male'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {member.gender === 'male' ? '♂' : '♀'}
            </span>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? genInfo?.bn : genInfo?.en}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? member.branchNameBn : member.branchNameEn}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 pr-10">
            {lang === 'bn' ? member.nameBn : member.nameEn}
          </h3>

          {member.notesBn && (
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
              {lang === 'bn' ? member.notesBn : member.notesEn}
            </p>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Direct Lineage Breadcrumbs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'bn' ? 'বংশধারা পরিক্রমা (শিকড় থেকে)' : 'Direct Lineage Path'}</span>
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800 text-xs">
              {lineagePath.map((item, idx) => {
                const isCurrent = item.id === member.id;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectMember(item.id)}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                      }`}
                    >
                      {lang === 'bn' ? item.nameBn : item.nameEn}
                    </button>
                    {idx < lineagePath.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Immediate Family Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Spouse */}
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">
                {lang === 'bn' ? 'সহধর্মিণী / স্বামী' : 'Spouse'}
              </span>
              {member.spouse ? (
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                  <Heart className="w-4 h-4 fill-current shrink-0" />
                  <span>
                    {lang === 'bn' ? member.spouse.nameBn : member.spouse.nameEn}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-stone-400 italic">
                  {lang === 'bn' ? 'তালিকাভুক্ত নেই' : 'Not recorded'}
                </span>
              )}
            </div>

            {/* Parent */}
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">
                {lang === 'bn' ? 'পিতা / পূর্বসূরি' : 'Parent'}
              </span>
              {parent ? (
                <button
                  type="button"
                  onClick={() => onSelectMember(parent.id)}
                  className="text-sm font-semibold text-stone-800 dark:text-stone-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'bn' ? parent.nameBn : parent.nameEn}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </button>
              ) : (
                <span className="text-xs text-stone-400 italic">
                  {lang === 'bn' ? 'আদি পুরুষ' : 'Root Patriarch'}
                </span>
              )}
            </div>
          </div>

          {/* Children List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              {lang === 'bn'
                ? `সন্তান-সন্ততি (${children.length} জন)`
                : `Children (${children.length})`}
            </h4>
            {children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {children.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    onClick={() => onSelectMember(child.id)}
                    className="p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-stone-900 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                        {lang === 'bn' ? child.nameBn : child.nameEn}
                      </div>
                      {child.spouse && (
                        <div className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <Heart className="w-2.5 h-2.5 fill-current" />
                          <span className="truncate">
                            {lang === 'bn' ? child.spouse.nameBn : child.spouse.nameEn}
                          </span>
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                {lang === 'bn' ? 'কোনো সন্তান রেকর্ড করা নেই।' : 'No recorded children.'}
              </p>
            )}
          </div>

          {/* Siblings */}
          {siblings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                {lang === 'bn'
                  ? `সহোদর ভাই ও বোন (${siblings.length} জন)`
                  : `Siblings (${siblings.length})`}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {siblings.map((sib) => (
                  <button
                    type="button"
                    key={sib.id}
                    onClick={() => onSelectMember(sib.id)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? sib.nameBn : sib.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between gap-2">
          {onFindRelation ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFindRelation(member.id);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 border border-amber-300/70 dark:border-amber-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আত্মীয়তা নির্ণয়' : 'Find Relationship'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
