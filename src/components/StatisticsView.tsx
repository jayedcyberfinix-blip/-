import React from 'react';
import { Language } from '../types/genealogy';
import { FAMILY_MEMBERS, BRANCHES } from '../data/familyData';
import { BarChart2, Users, GitBranch } from 'lucide-react';

interface StatisticsViewProps {
  lang: Language;
  onSelectBranch?: (branchId: string) => void;
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBnNumber(num: number): string {
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? BN_DIGITS[Number(ch)] : ch))
    .join('');
}

const GENERATION_DETAILS: {
  gen: number;
  bnTitle: string;
  enTitle: string;
}[] = [
  { gen: 1, bnTitle: '১ম প্রজন্ম · মূল আদিপুরুষ (ধনাউল্লা মোল্লা)', enTitle: '1st Gen · Root Patriarch (Dhonaulla Molla)' },
  { gen: 2, bnTitle: '২য় প্রজন্ম · তোরাবদ্দীন মোল্লা ও পঞ্চপুত্র', enTitle: '2nd Gen · Torabuddin Molla & Five Sons' },
  { gen: 3, bnTitle: '৩য় প্রজন্ম · ওয়াজেদ আলী মোল্লা ও ভগিনী', enTitle: '3rd Gen · Wazed Ali Molla & Sister' },
  { gen: 4, bnTitle: '৪র্থ প্রজন্ম · প্রধান পাঁচ পুত্র ও দুই কন্যা', enTitle: '4th Gen · Five Sons & Two Daughters' },
  { gen: 5, bnTitle: '৫ম প্রজন্ম · নাতি-নাতনি প্রজন্ম', enTitle: '5th Gen · Grandchildren Generation' },
  { gen: 6, bnTitle: '৬ষ্ঠ প্রজন্ম · প্রপৌত্র ও প্রপৌত্রী প্রজন্ম', enTitle: '6th Gen · Great-Grandchildren' },
  { gen: 7, bnTitle: '৭ম প্রজন্ম · অতি-প্রপৌত্র প্রজন্ম', enTitle: '7th Gen · Great-Great-Grandchildren' },
];

export const StatisticsView: React.FC<StatisticsViewProps> = ({ lang, onSelectBranch }) => {
  const totalMembers = FAMILY_MEMBERS.length;
  const maleCount = FAMILY_MEMBERS.filter((m) => m.gender === 'male').length;
  const femaleCount = FAMILY_MEMBERS.filter((m) => m.gender === 'female').length;
  const spouseCount = FAMILY_MEMBERS.filter((m) => !!m.spouse).length;
  const maxGen = Math.max(...FAMILY_MEMBERS.map((m) => m.generation));

  const formatNum = (n: number) => (lang === 'bn' ? toBnNumber(n) : String(n));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Centered Editorial Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
          <span>{lang === 'bn' ? 'বংশবৃত্তান্ত' : 'Genealogy'}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">
            {lang === 'bn' ? 'পরিসংখ্যান' : 'Statistics'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {lang === 'bn'
            ? 'মোল্লা পরিবারের বংশবৃত্তান্ত ও জনতাত্ত্বিক চিত্র'
            : 'Molla Dynasty Genealogy & Demographic Overview'}
        </h1>

        <p className="text-sm text-stone-500 dark:text-stone-400">
          {lang === 'bn'
            ? `ধনাউল্লা মোল্লা হতে ${formatNum(maxGen)} প্রজন্ম পর্যন্ত মোট বংশলতিকার সুবিন্যস্ত সংখ্যাতত্ত্ব`
            : `Structured demographic breakdown across ${maxGen} generations from Dhonaulla Molla`}
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-2">
            {lang === 'bn' ? 'মোট নথিভুক্ত সদস্য' : 'Total Recorded Members'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatNum(totalMembers)}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'জন' : 'members'}
            </span>
          </div>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-2 block">
            {lang === 'bn' ? `${formatNum(maxGen)} প্রজন্মের ব্যাপ্তি` : `${maxGen} Generations Span`}
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-2">
            {lang === 'bn' ? 'মোট পুরুষ সদস্য' : 'Total Male Members'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-sky-700 dark:text-sky-400 tabular-nums">
              {formatNum(maleCount)}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'জন' : 'males'}
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 block">
            {lang === 'bn' ? 'বংশধারার প্রত্যক্ষ পুরুষ' : 'Direct male descendants'}
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-2">
            {lang === 'bn' ? 'মোট নারী সদস্য' : 'Total Female Members'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {formatNum(femaleCount)}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'জন' : 'females'}
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 block">
            {lang === 'bn' ? 'কন্যা ও বংশীয় নারী' : 'Daughters & female descendants'}
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-2">
            {lang === 'bn' ? 'নথিভুক্ত সহধর্মিণী/দম্পতি' : 'Recorded Spouses / Couples'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {formatNum(spouseCount)}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {lang === 'bn' ? 'জন' : 'couples'}
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 block">
            {lang === 'bn' ? 'বিবাহবন্ধনে আবদ্ধ' : 'Married partnerships'}
          </span>
        </div>
      </div>

      {/* Generation Breakdown */}
      <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-stone-100 dark:border-stone-800">
          <BarChart2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {lang === 'bn'
              ? 'প্রজন্মভিত্তিক সদস্য বণ্টন (Generation Breakdown)'
              : 'Generation Breakdown'}
          </h2>
        </div>

        <div className="space-y-4">
          {GENERATION_DETAILS.map((item) => {
            const count = FAMILY_MEMBERS.filter((m) => m.generation === item.gen).length;
            const percent = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

            return (
              <div key={item.gen} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {lang === 'bn' ? item.bnTitle : item.enTitle}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums whitespace-nowrap shrink-0">
                    {formatNum(count)} {lang === 'bn' ? 'জন' : 'members'}{' '}
                    <span className="text-stone-500 dark:text-stone-400 font-normal">
                      ({formatNum(percent)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-stone-800 dark:bg-stone-200 transition-all duration-300"
                    style={{ width: `${Math.max(percent, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Branch Distribution */}
      <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-stone-100 dark:border-stone-800">
          <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {lang === 'bn'
              ? 'শাখাভিত্তিক সদস্য বণ্টন (Branch Distribution)'
              : 'Branch Distribution'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANCHES.map((branch) => {
            const members = FAMILY_MEMBERS.filter((m) => m.branchId === branch.id);
            const count = members.length;
            const percent = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => onSelectBranch?.(branch.id)}
                className="text-left p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-900/40 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: branch.color }}
                    />
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {lang === 'bn' ? branch.nameBn : branch.nameEn}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 tabular-nums shrink-0">
                    {formatNum(count)} {lang === 'bn' ? 'জন' : 'members'} ({formatNum(percent)}%)
                  </span>
                </div>

                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {lang === 'bn' ? branch.leaderBn : branch.leaderEn}
                </div>

                <div className="w-full h-2 rounded-full bg-stone-200/70 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percent, 4)}%`, backgroundColor: branch.color }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Gender Balance Summary */}
      <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
          <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {lang === 'bn' ? 'পুরুষ ও নারী অনুপাত' : 'Gender Ratio'}
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
            <span className="text-sky-700 dark:text-sky-400">
              {lang === 'bn'
                ? `পুরুষ: ${formatNum(maleCount)} জন (${formatNum(Math.round((maleCount / totalMembers) * 100))}%)`
                : `Male: ${maleCount} (${Math.round((maleCount / totalMembers) * 100)}%)`}
            </span>
            <span className="text-rose-700 dark:text-rose-400">
              {lang === 'bn'
                ? `নারী: ${formatNum(femaleCount)} জন (${formatNum(Math.round((femaleCount / totalMembers) * 100))}%)`
                : `Female: ${femaleCount} (${Math.round((femaleCount / totalMembers) * 100)}%)`}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-rose-500/80 overflow-hidden flex">
            <div
              className="h-full bg-sky-600 transition-all duration-300"
              style={{ width: `${Math.round((maleCount / totalMembers) * 100)}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
