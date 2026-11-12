import React from 'react';
import { Language } from '../types/genealogy';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface OriginalSketchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const OriginalSketchModal: React.FC<OriginalSketchModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {lang === 'bn' ? 'মূল হস্তলিখিত খসড়া ও রূপরেখা' : 'Original Hand-Drawn Sketch & Mapping'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {lang === 'bn'
                ? 'আপনার দেওয়া হাতের আঁকা চিত্রের সাথে ডিজিটাল বংশবৃক্ষের প্রতিটি ধাপের হুবহু সামঞ্জস্য।'
                : 'Exact structural mapping between your hand-drawn sketch and this digital genealogy tree.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Sketch Image */}
          <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950">
            <img
              src="./assets/aistudio/WhatsApp_Image_2026-11-12_at_9.00.54_PM_5dce71e0.jpeg"
              alt="User hand-drawn genealogical sketch"
              className="w-full h-auto object-contain max-h-[460px]"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800">
              {lang === 'bn' ? 'আপনার প্রেরিত মূল হাতের আঁকা নকশা' : 'Your uploaded hand-drawn diagram'}
            </div>
          </div>

          {/* Mapping Explanation */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {lang === 'bn' ? 'নকশা ও ডিজিটাল মডেলের রূপান্তর:' : 'Structural Architecture Translation:'}
            </h4>

            <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-white block mb-0.5">
                    {lang === 'bn' ? '১. বামদিকের প্রথম বক্স (আদি পুরুষ)' : '1. Far Left Box (Patriarch)'}
                  </strong>
                  <span>
                    {lang === 'bn'
                      ? 'ধনাউল্লা মোল্লা — সমগ্র বংশের মূল কাণ্ড ও আদি পিতা।'
                      : 'Dhonaulla Molla — The root ancestor and foundation of the dynasty.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-white block mb-0.5">
                    {lang === 'bn' ? '২. দ্বিতীয় কলামের ৫টি বক্স' : '2. Second Column (5 Sons)'}
                  </strong>
                  <span>
                    {lang === 'bn'
                      ? 'হারাণ, তোরাবদ্দীন, জোরাপ, তমেজ, নিদান। মধ্যবর্তী বক্স (তোরাবদ্দীন মোল্লা) থেকে পরবর্তী ধারা বিস্তৃত।'
                      : 'Haran, Torabuddin, Jorap, Tamez, Nidan. Torabuddin Molla extends horizontally.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-white block mb-0.5">
                    {lang === 'bn' ? '৩. কেন্দ্রবিন্দু বক্স' : '3. Central Connecting Node'}
                  </strong>
                  <span>
                    {lang === 'bn'
                      ? 'ওয়াজেদ আলী মোল্লা ❤️ আফছুন্নাহার — মধ্যবর্তী মূল কাণ্ড, যাদের ৫ ছেলে ও ২ মেয়ের মাধ্যমে সকল প্রধান শাখার সৃষ্টি।'
                      : 'Wazed Ali Molla ❤️ Afchunnahar — The central progenitors of the 5 main family branches.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-white block mb-0.5">
                    {lang === 'bn' ? '৪. ডানদিকের ৫টি মূল শাখা ও উপশাখা' : '4. Right Side 5 Main Branches'}
                  </strong>
                  <span>
                    {lang === 'bn'
                      ? '১. নজরুল ইসলাম, ২. সামসুল আলম, ৩. আবু মোস্তফা, ৪. মোহাম্মদ আলী, ৫. আহাম্মেদ আলী এবং তাদের সন্তান ও নাতি-নাতনি ধারা।'
                      : 'Nazrul Islam, Samsul Alam, Abu Mostofa, Mohammad Ali, Ahammed Ali and all sub-branches.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বুঝেছি / ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
