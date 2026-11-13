import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { FAMILY_MEMBERS, BRANCHES } from '../data/familyData';
import { Search, X, Heart, Compass } from 'lucide-react';

interface SearchFilterBarProps {
  lang: Language;
  onSelectMember: (id: string) => void;
  selectedBranch: string | 'all';
  onSelectBranch: (branch: string | 'all') => void;
  selectedGender: 'all' | 'male' | 'female';
  onSelectGender: (gender: 'all' | 'male' | 'female') => void;
  onOpenRelationFinder: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  lang,
  onSelectMember,
  selectedBranch,
  onSelectBranch,
  selectedGender,
  onSelectGender,
  onOpenRelationFinder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchTerm.trim()
    ? FAMILY_MEMBERS.filter((m) => {
        const query = searchTerm.toLowerCase();
        const matchNameBn = m.nameBn.toLowerCase().includes(query);
        const matchNameEn = m.nameEn.toLowerCase().includes(query);
        const matchAliasBn = m.aliasBn?.toLowerCase().includes(query) || false;
        const matchAliasEn = m.aliasEn?.toLowerCase().includes(query) || false;
        const matchSpouseBn = m.spouse?.nameBn.toLowerCase().includes(query) || false;
        const matchSpouseEn = m.spouse?.nameEn.toLowerCase().includes(query) || false;

        return (
          matchNameBn ||
          matchNameEn ||
          matchAliasBn ||
          matchAliasEn ||
          matchSpouseBn ||
          matchSpouseEn
        );
      }).slice(0, 8)
    : [];

  const handleSelect = (id: string) => {
    onSelectMember(id);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div ref={containerRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={
                lang === 'bn'
                  ? 'বংশের যে কাউকে খুঁজুন (যেমন: জায়েদ, ববি, নজরুল, সোহাগ...)'
                  : 'Search any member (e.g., Jayed, Bobi, Nazrul, Sohag...)'
              }
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden z-50">
              <div className="p-1.5">
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {lang === 'bn' ? member.nameBn : member.nameEn}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <span>{lang === 'bn' ? member.generationNameBn : member.generationNameEn}</span>
                        {member.spouse && (
                          <>
                            <span>·</span>
                            <span className="text-rose-500 flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              {lang === 'bn' ? member.spouse.nameBn : member.spouse.nameEn}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200">
                      {lang === 'bn' ? member.branchNameBn : member.branchNameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
            <button
              onClick={() => onSelectGender('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedGender === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {lang === 'bn' ? 'সকল' : 'All'}
            </button>
            <button
              onClick={() => onSelectGender('male')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedGender === 'male'
                  ? 'bg-white dark:bg-stone-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {lang === 'bn' ? 'ছেলে / পুরুষ' : 'Male'}
            </button>
            <button
              onClick={() => onSelectGender('female')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedGender === 'female'
                  ? 'bg-white dark:bg-stone-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {lang === 'bn' ? 'মেয়ে / মহিলা' : 'Female'}
            </button>
          </div>

          {/* Branch filter dropdown */}
          <select
            value={selectedBranch}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shrink-0"
          >
            <option value="all">{lang === 'bn' ? 'সকল শাখা' : 'All Branches'}</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === 'bn' ? b.nameBn : b.nameEn}
              </option>
            ))}
          </select>

          {/* Relationship Finder Trigger */}
          <button
            type="button"
            onClick={onOpenRelationFinder}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-800 hover:bg-amber-900 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            title={
              lang === 'bn'
                ? 'পারিবারিক সম্পর্ক ও আত্মীয়তা নির্ণয়ক'
                : 'Family Relationship & Kinship Finder'
            }
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'bn' ? 'আত্মীয়তা নির্ণয়ক' : 'Relation Finder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
