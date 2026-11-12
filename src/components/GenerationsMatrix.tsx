import React, { useState } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { FAMILY_MEMBERS, GENERATION_LABELS, MEMBERS_MAP } from '../data/familyData';
import { Heart, User, ArrowRight, Sparkles } from 'lucide-react';

interface GenerationsMatrixProps {
  lang: Language;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  highlightedPathIds: Set<string>;
}

export const GenerationsMatrix: React.FC<GenerationsMatrixProps> = ({
  lang,
  selectedMemberId,
  onSelectMember,
  highlightedPathIds,
}) => {
  const [activeGen, setActiveGen] = useState<number | 'all'>('all');

  const generations = [1, 2, 3, 4, 5, 6, 7];

  const filteredMembersByGen = (gen: number) => {
    return FAMILY_MEMBERS.filter((m) => m.generation === gen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Subtitle */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {lang === 'bn' ? 'প্রজন্ম পরিক্রমা ও ধারাবাহিকতা' : 'Chronological Generation Matrix'}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {lang === 'bn'
            ? 'ধনাউল্লা মোল্লার মূল শিকড় থেকে ৭ম প্রজন্ম পর্যন্ত পূর্ণাঙ্গ বিন্যাস।'
            : 'Detailed distribution of all family members from 1st to 7th generation.'}
        </p>
      </div>

      {/* Generation Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveGen('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeGen === 'all'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'সকল প্রজন্ম (১-৭)' : 'All Generations'}
        </button>

        {generations.map((g) => {
          const count = filteredMembersByGen(g).length;
          const label = GENERATION_LABELS[g];
          return (
            <button
              key={g}
              onClick={() => setActiveGen(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeGen === g
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>{lang === 'bn' ? label.bn : `Gen ${g}`}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generation Rows */}
      <div className="space-y-10">
        {generations
          .filter((g) => activeGen === 'all' || activeGen === g)
          .map((gen) => {
            const members = filteredMembersByGen(gen);
            const genInfo = GENERATION_LABELS[gen];

            return (
              <div
                key={gen}
                className="bg-white dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm"
              >
                {/* Generation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center justify-center">
                        {gen}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        {lang === 'bn' ? genInfo?.bn : genInfo?.en}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 ml-8">
                      {lang === 'bn' ? genInfo?.subtitleBn : genInfo?.subtitleEn}
                    </p>
                  </div>

                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {members.length}
                    </span>{' '}
                    {lang === 'bn' ? 'জন সদস্য তালিকাভুক্ত' : 'members listed'}
                  </div>
                </div>

                {/* Grid of Member Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {members.map((member) => {
                    const isSelected = selectedMemberId === member.id;
                    const isInPath = highlightedPathIds.has(member.id);
                    const parent = member.parentId ? MEMBERS_MAP.get(member.parentId) : null;

                    let cardBorder =
                      'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700';
                    if (isSelected) {
                      cardBorder =
                        'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/30';
                    } else if (isInPath) {
                      cardBorder =
                        'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 dark:bg-amber-950/20';
                    }

                    return (
                      <div
                        key={member.id}
                        onClick={() => onSelectMember(member.id)}
                        className={`rounded-xl border p-4 transition-all duration-150 cursor-pointer bg-stone-50/60 dark:bg-stone-900/40 hover:shadow-sm ${cardBorder}`}
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
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                            {member.order > 0 ? `#${member.order}` : ''}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                          {lang === 'bn' ? member.nameBn : member.nameEn}
                        </h4>

                        {member.spouse && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mb-2">
                            <Heart className="w-3 h-3 fill-current shrink-0" />
                            <span className="truncate">
                              {lang === 'bn' ? member.spouse.nameBn : member.spouse.nameEn}
                            </span>
                          </div>
                        )}

                        {parent && (
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800 pt-2 mt-2">
                            <span className="text-stone-400">{lang === 'bn' ? 'পিতা: ' : 'Parent: '}</span>
                            <span className="font-medium text-stone-700 dark:text-stone-300">
                              {lang === 'bn' ? parent.nameBn : parent.nameEn}
                            </span>
                          </div>
                        )}

                        {member.childrenIds.length > 0 && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                            {member.childrenIds.length}{' '}
                            {lang === 'bn' ? 'সন্তান রয়েছে' : 'children'}
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
