import React, { useState, useMemo, useEffect } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { FAMILY_MEMBERS, MEMBERS_MAP, getLineagePath } from '../data/familyData';
import { X, Compass, GitFork, Heart, ArrowRight, ArrowLeftRight, Check } from 'lucide-react';

interface RelationshipFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialPerson1Id?: string | null;
  onHighlightPath: (pathIds: string[], person1Id: string, person2Id: string) => void;
}

function cleanDisplayName(member: FamilyMember, lang: Language): string {
  if (lang === 'bn') {
    return member.nameBn
      .replace(/^[০-৯0-9]+(ম|য়|য়|র্থ|ষ্ঠ|থ)?\s*(ছেলে|মেয়ে|মেয়ে)?\.?\s*/u, '')
      .trim();
  }
  return member.nameEn
    .replace(/^[0-9]+(st|nd|rd|th)?\s*(Son|Dtr)?\.?\s*/i, '')
    .trim();
}

interface KinshipResult {
  titleBn: string;
  titleEn: string;
  subtitleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  steps: FamilyMember[];
}

function computeKinship(person1Id: string, person2Id: string): KinshipResult | null {
  const p1 = MEMBERS_MAP.get(person1Id);
  const p2 = MEMBERS_MAP.get(person2Id);
  if (!p1 || !p2) return null;

  const path1 = getLineagePath(person1Id);
  const path2 = getLineagePath(person2Id);

  // Find Lowest Common Ancestor index
  let lcaIdx = 0;
  const minLen = Math.min(path1.length, path2.length);
  for (let i = 0; i < minLen; i++) {
    if (path1[i].id === path2[i].id) {
      lcaIdx = i;
    } else {
      break;
    }
  }

  const up = path1.length - 1 - lcaIdx;
  const down = path2.length - 1 - lcaIdx;

  // Build step-by-step path from person1 -> LCA -> person2
  const upSteps = path1.slice(lcaIdx).reverse(); // person1 ... LCA
  const downSteps = path2.slice(lcaIdx + 1); // child of LCA ... person2
  const steps = [...upSteps, ...downSteps];

  const p1NameBn = cleanDisplayName(p1, 'bn');
  const p2NameBn = cleanDisplayName(p2, 'bn');
  const p1NameEn = cleanDisplayName(p1, 'en');
  const p2NameEn = cleanDisplayName(p2, 'en');

  const isP2Male = p2.gender === 'male';
  // Check whether p1 connects via mother or father for grand-relations
  const p1Parent = p1.parentId ? MEMBERS_MAP.get(p1.parentId) : undefined;
  const viaMother = p1Parent?.gender === 'female';

  let titleBn = '';
  let titleEn = '';
  let subtitleEn = '';
  let descriptionBn = '';
  let descriptionEn = '';

  if (up === 0 && down === 0) {
    titleBn = 'একই ব্যক্তি';
    titleEn = 'Same Person';
    subtitleEn = '(Identical Individual)';
    descriptionBn = `${p1NameBn} এবং ${p2NameBn} একই ব্যক্তি।`;
    descriptionEn = `${p1NameEn} and ${p2NameEn} are the same person.`;
  } else if (down === 0) {
    // p2 is direct ancestor of p1
    if (up === 1) {
      titleBn = isP2Male ? 'পিতা' : 'মাতা';
      titleEn = isP2Male ? 'Father' : 'Mother';
      subtitleEn = `(${titleEn} · 1st Gen Ancestor)`;
    } else if (up === 2) {
      titleBn = viaMother
        ? isP2Male
          ? 'নানা (মাতামহ)'
          : 'নানি (মাতামহী)'
        : isP2Male
          ? 'দাদা (পিতামহ)'
          : 'দাদি (পিতামহী)';
      titleEn = isP2Male ? 'Grandfather' : 'Grandmother';
      subtitleEn = `(${titleEn} · 2nd Generation Ancestor)`;
    } else if (up === 3) {
      titleBn = '৩য় ঊর্ধ্বতন পূর্বপুরুষ (প্রপিতামহ/প্রমাতামহ)';
      titleEn = isP2Male ? 'Great-Grandfather' : 'Great-Grandmother';
      subtitleEn = '(3rd Generation Ancestor)';
    } else {
      titleBn = `${up}ম ঊর্ধ্বতন পূর্বপুরুষ (আদিপুরুষ)`;
      titleEn = `${up}th Generation Ancestor`;
      subtitleEn = `(${up}th Generation Ancestor)`;
    }
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (${up} প্রজন্ম ঊর্ধ্বতন)।`;
    descriptionEn = `${p2NameEn} is the ${titleEn} of ${p1NameEn} (${up} generation${up > 1 ? 's' : ''} above).`;
  } else if (up === 0) {
    // p2 is direct descendant of p1
    if (down === 1) {
      titleBn = isP2Male ? 'পুত্র (ছেলে)' : 'কন্যা (মেয়ে)';
      titleEn = isP2Male ? 'Son' : 'Daughter';
      subtitleEn = `(${titleEn} · 1st Gen Descendant)`;
    } else if (down === 2) {
      titleBn = isP2Male ? 'নাতি (পৌত্র/দৌহিত্র)' : 'নাতনি (পৌত্রী/দৌহিত্রী)';
      titleEn = isP2Male ? 'Grandson' : 'Granddaughter';
      subtitleEn = `(${titleEn} · 2nd Generation Descendant)`;
    } else if (down === 3) {
      titleBn = isP2Male ? 'প্রপৌত্র' : 'প্রপৌত্রী';
      titleEn = isP2Male ? 'Great-Grandson' : 'Great-Granddaughter';
      subtitleEn = '(3rd Generation Descendant)';
    } else {
      titleBn = `${down}ম অধঃস্তন বংশধর`;
      titleEn = `${down}th Generation Descendant`;
      subtitleEn = `(${down}th Generation Descendant)`;
    }
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (${down} প্রজন্ম অধঃস্তন)।`;
    descriptionEn = `${p2NameEn} is the ${titleEn} of ${p1NameEn} (${down} generation${down > 1 ? 's' : ''} below).`;
  } else if (up === 1 && down === 1) {
    titleBn = isP2Male ? 'আপন ভাই' : 'আপন বোন';
    titleEn = isP2Male ? 'Brother' : 'Sister';
    subtitleEn = `(${titleEn} · Sibling)`;
    descriptionBn = `${p2NameBn} এবং ${p1NameBn} পরস্পরের আপন ${isP2Male ? 'ভাই' : 'বোন'}।`;
    descriptionEn = `${p2NameEn} is the ${titleEn.toLowerCase()} of ${p1NameEn}.`;
  } else if (up === 1 && down === 2) {
    const p2Parent = p2.parentId ? MEMBERS_MAP.get(p2.parentId) : undefined;
    const isSisterChild = p2Parent?.gender === 'female';
    titleBn = isSisterChild
      ? isP2Male
        ? 'ভাগ্নে'
        : 'ভাগ্নি'
      : isP2Male
        ? 'ভাতিজা'
        : 'ভাতিজি';
    titleEn = isP2Male ? 'Nephew' : 'Niece';
    subtitleEn = `(${titleEn})`;
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (১ প্রজন্ম অধঃস্তন)।`;
    descriptionEn = `${p2NameEn} is the ${titleEn.toLowerCase()} of ${p1NameEn}.`;
  } else if (up === 2 && down === 1) {
    titleBn = viaMother
      ? isP2Male
        ? 'মামা'
        : 'খালা'
      : isP2Male
        ? 'চাচা'
        : 'ফুফু';
    titleEn = isP2Male ? 'Uncle' : 'Aunt';
    subtitleEn = `(${titleEn})`;
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (১ প্রজন্ম ঊর্ধ্বতন)।`;
    descriptionEn = `${p2NameEn} is the ${titleEn.toLowerCase()} of ${p1NameEn}.`;
  } else if (up === 2 && down === 2) {
    // First cousin: check p1's parent gender to specify Chachato/Fufato/Mamato/Khalato
    const p1LineChild = path1[lcaIdx + 1];
    const isP1ViaFemale = p1LineChild?.gender === 'female';
    const prefix = isP1ViaFemale
      ? isP2Male
        ? 'মামাতো / খালাতো'
        : 'মামাতো / খালাতো'
      : path2[lcaIdx + 1]?.gender === 'female'
        ? 'ফুফাতো'
        : 'চাচাতো';
    titleBn = `${prefix} ${isP2Male ? 'ভাই' : 'বোন'}`;
    titleEn = 'First Cousin';
    subtitleEn = '(First Cousin · Same Generation)';
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (সমপ্রজন্ম)।`;
    descriptionEn = `${p2NameEn} and ${p1NameEn} are first cousins.`;
  } else if (up === down) {
    const degree = up - 1;
    titleBn = `${degree}ম প্রজন্মের কাজিন (${isP2Male ? 'ভাই' : 'বোন'})`;
    titleEn = `${degree === 2 ? 'Second' : `${degree}th`} Cousin`;
    subtitleEn = `(${titleEn} · Same Generation)`;
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn} (সমপ্রজন্ম)।`;
    descriptionEn = `${p2NameEn} is a ${titleEn.toLowerCase()} of ${p1NameEn}.`;
  } else if (up > down) {
    const diff = up - down;
    if (down === 1) {
      titleBn = `${diff} প্রজন্ম ঊর্ধ্বতন চাচা/ফুফু/দাদা স্তরের আত্মীয়`;
      titleEn = up === 3 ? (isP2Male ? 'Great-Uncle' : 'Great-Aunt') : `${diff}-Gen Elder Collateral Relative`;
    } else {
      titleBn = `${diff} প্রজন্ম ঊর্ধ্বতন বংশীয় আত্মীয় (${isP2Male ? 'চাচা/দাদা স্তর' : 'ফুফু/দাদি স্তর'})`;
      titleEn = `${diff} Generation${diff > 1 ? 's' : ''} Elder Relative`;
    }
    subtitleEn = `(${titleEn})`;
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn}।`;
    descriptionEn = `${p2NameEn} is ${diff} generation${diff > 1 ? 's' : ''} above ${p1NameEn} through ${cleanDisplayName(path1[lcaIdx], 'en')}.`;
  } else {
    const diff = down - up;
    if (up === 1) {
      titleBn = `${diff} প্রজন্ম অধঃস্তন নাতি-নাতনি স্তরের আত্মীয়`;
      titleEn = down === 3 ? (isP2Male ? 'Great-Nephew' : 'Great-Niece') : `${diff}-Gen Younger Descendant Relative`;
    } else {
      titleBn = `${diff} প্রজন্ম অধঃস্তন বংশীয় আত্মীয় (${isP2Male ? 'ভাতিজা/নাতি স্তর' : 'ভাতিজি/নাতনি স্তর'})`;
      titleEn = `${diff} Generation${diff > 1 ? 's' : ''} Younger Relative`;
    }
    subtitleEn = `(${titleEn})`;
    descriptionBn = `${p2NameBn} হলেন ${p1NameBn}-এর ${titleBn}।`;
    descriptionEn = `${p2NameEn} is ${diff} generation${diff > 1 ? 's' : ''} below ${p1NameEn} through ${cleanDisplayName(path1[lcaIdx], 'en')}.`;
  }

  return {
    titleBn,
    titleEn,
    subtitleEn,
    descriptionBn,
    descriptionEn,
    steps,
  };
}

export const RelationshipFinderModal: React.FC<RelationshipFinderModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialPerson1Id,
  onHighlightPath,
}) => {
  const [person1Id, setPerson1Id] = useState<string>('jayed_ahmed');
  const [person2Id, setPerson2Id] = useState<string>('dhonaulla');

  useEffect(() => {
    if (isOpen && initialPerson1Id) {
      setPerson1Id(initialPerson1Id);
    }
  }, [isOpen, initialPerson1Id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sortedMembers = useMemo(() => {
    return [...FAMILY_MEMBERS].sort((a, b) => a.generation - b.generation || a.order - b.order);
  }, []);

  const result = useMemo(() => computeKinship(person1Id, person2Id), [person1Id, person2Id]);

  if (!isOpen) return null;

  const handleSwap = () => {
    setPerson1Id(person2Id);
    setPerson2Id(person1Id);
  };

  const handleHighlight = () => {
    if (!result) return;
    onHighlightPath(
      result.steps.map((s) => s.id),
      person1Id,
      person2Id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {lang === 'bn'
                  ? 'পারিবারিক সম্পর্ক ও আত্মীয়তা নির্ণয়ক'
                  : 'Family Relationship & Kinship Finder'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {lang === 'bn'
                  ? 'মোল্লা পরিবারের যেকোনো দুইজন সদস্যের পারস্পরিক রক্তের সম্পর্ক ও বংশানুক্রম বের করুন'
                  : 'Discover the exact blood relationship and lineage connection between any two members'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Two Person Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                {lang === 'bn' ? 'ব্যক্তি ১ (সূচনাবিন্দু):' : 'Person 1 (Starting Point):'}
              </label>
              <select
                value={person1Id}
                onChange={(e) => setPerson1Id(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 cursor-pointer"
              >
                {sortedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {cleanDisplayName(m, lang)} ·{' '}
                    {lang === 'bn' ? `প্রজন্ম ${m.generation}` : `Gen ${m.generation}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title={lang === 'bn' ? 'স্থান পরিবর্তন করুন' : 'Swap persons'}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                {lang === 'bn' ? 'ব্যক্তি ২ (গন্তব্য ব্যক্তি):' : 'Person 2 (Target Person):'}
              </label>
              <select
                value={person2Id}
                onChange={(e) => setPerson2Id(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-amber-700/60 dark:border-amber-600/60 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 cursor-pointer"
              >
                {sortedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {cleanDisplayName(m, lang)} ·{' '}
                    {lang === 'bn' ? `প্রজন্ম ${m.generation}` : `Gen ${m.generation}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Relationship Result Highlight Card */}
          {result && (
            <>
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-5 text-center space-y-1.5">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 block">
                  {lang === 'bn' ? 'পারস্পরিক আত্মীয়তা সম্পর্ক' : 'Mutual Kinship Relation'}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold text-amber-950 dark:text-amber-100">
                  {lang === 'bn' ? result.titleBn : result.titleEn}
                </h4>
                <span className="text-xs text-stone-500 dark:text-stone-400 block">
                  {result.subtitleEn}
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 pt-1">
                  {lang === 'bn' ? result.descriptionBn : result.descriptionEn}
                </p>
              </div>

              {/* Step-by-Step Lineage Chain */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                  <GitFork className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>
                    {lang === 'bn'
                      ? `বংশগত সংযোগের ধারাবাহিক স্তরসমূহ (${result.steps.length} ধাপ)`
                      : `Lineage Connection Steps (${result.steps.length} steps)`}
                  </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 p-3 space-y-2 max-h-60 overflow-y-auto">
                  {result.steps.map((step, idx) => {
                    const isLast = idx === result.steps.length - 1;
                    return (
                      <div key={step.id} className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                          {idx + 1}
                        </span>

                        <div className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="font-semibold text-stone-900 dark:text-stone-100">
                              {cleanDisplayName(step, lang)}
                            </span>
                            {step.spouse && (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-medium">
                                <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                                <span>
                                  {lang === 'bn' ? step.spouse.nameBn : step.spouse.nameEn}
                                </span>
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-stone-500 dark:text-stone-400 shrink-0 tabular-nums">
                            {lang === 'bn' ? `প্রজন্ম ${step.generation}` : `Gen ${step.generation}`}
                          </span>
                        </div>

                        <div className="w-5 flex justify-center shrink-0 text-stone-400">
                          {isLast ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handleHighlight}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-800 hover:bg-amber-900 text-white transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <GitFork className="w-4 h-4" />
            <span>
              {lang === 'bn'
                ? 'ট্রি ডায়াগ্রামে এই সম্পর্ক হাইলাইট করুন'
                : 'Highlight Relationship on Tree'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
