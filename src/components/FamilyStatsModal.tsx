import React from 'react';
import { Language } from '../types/genealogy';
import { FAMILY_MEMBERS, BRANCHES } from '../data/familyData';
import { X, Users, GitFork, Heart, Sparkles, Award } from 'lucide-react';

interface FamilyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const FamilyStatsModal: React.FC<FamilyStatsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const totalMembers = FAMILY_MEMBERS.length;
  const directDescendants = FAMILY_MEMBERS.filter((m) => m.isDirectDescendant).length;
  const recordedSpouses = FAMILY_MEMBERS.filter((m) => !!m.spouse).length;
  const males = FAMILY_MEMBERS.filter((m) => m.gender === 'male').length;
  const females = FAMILY_MEMBERS.filter((m) => m.gender === 'female').length;
  const youngestGen = Math.max(...FAMILY_MEMBERS.map((m) => m.generation));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {lang === 'bn' ? 'বংশতালিকা পরিসংখ্যান ও তথ্য' : 'Genealogy Demographics & Statistics'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-center">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 block tabular-nums">
              {totalMembers}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'তালিকাভুক্ত বংশধর' : 'Total Descendants'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-center">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 block tabular-nums">
              {youngestGen}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'প্রজন্মের ব্যপ্তি' : 'Generations Span'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-center">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 block tabular-nums">
              {males}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'ছেলে / পুরুষ' : 'Male Descendants'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-center">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block tabular-nums">
              {females}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'মেয়ে / মহিলা' : 'Female Descendants'}
            </span>
          </div>
        </div>

        {/* Branches distribution */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            {lang === 'bn' ? 'শাখাভিত্তিক সদস্য বণ্টন' : 'Branch Distribution'}
          </h4>
          <div className="space-y-2">
            {BRANCHES.map((b) => {
              const count = FAMILY_MEMBERS.filter((m) => m.branchId === b.id).length;
              const percent = Math.round((count / totalMembers) * 100);

              return (
                <div key={b.id} className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {lang === 'bn' ? b.nameBn : b.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-600 dark:text-stone-400 tabular-nums">
                      {count} {lang === 'bn' ? 'জন' : 'members'}
                    </span>
                    <span className="text-[10px] text-stone-400 w-8 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
