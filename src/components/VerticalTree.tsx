import React, { useState, useRef } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { MEMBERS_MAP, GENERATION_LABELS, getChildrenOf, FAMILY_MEMBERS } from '../data/familyData';
import { Heart, ChevronDown, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface VerticalTreeProps {
  lang: Language;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  highlightedPathIds: Set<string>;
}

export const VerticalTree: React.FC<VerticalTreeProps> = ({
  lang,
  selectedMemberId,
  onSelectMember,
  highlightedPathIds,
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<number>(0.85);

  const toggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseToGen4 = () => {
    const ids = new Set<string>();
    FAMILY_MEMBERS.forEach((m) => {
      if (m.generation >= 4 && m.childrenIds.length > 0) {
        ids.add(m.id);
      }
    });
    setCollapsed(ids);
  };

  const renderNode = (memberId: string) => {
    const member = MEMBERS_MAP.get(memberId);
    if (!member) return null;

    const children = getChildrenOf(memberId);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(memberId);
    const isSelected = selectedMemberId === member.id;
    const isInPath = highlightedPathIds.has(member.id);

    const name = lang === 'bn' ? member.nameBn : member.nameEn;
    const spouse = member.spouse;

    let borderStyle = 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900';
    if (isSelected) {
      borderStyle =
        'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md';
    } else if (isInPath) {
      borderStyle =
        'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/40 dark:bg-amber-950/30';
    }

    if (member.id === 'wazed_ali' && !isSelected && !isInPath) {
      borderStyle =
        'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20 shadow-md';
    }

    return (
      <div key={memberId} className="flex flex-col items-center">
        {/* Person Card */}
        <div
          onClick={() => onSelectMember(member.id)}
          className={`relative group w-64 p-3 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${borderStyle}`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-mono text-[10px] tracking-wide">
              {lang === 'bn' ? GENERATION_LABELS[member.generation]?.bn : `Gen ${member.generation}`}
            </span>
            <span
              className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                member.gender === 'male'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {member.gender === 'male' ? '♂' : '♀'}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
            {name}
          </h4>

          {spouse && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
              <span className="truncate">{lang === 'bn' ? spouse.nameBn : spouse.nameEn}</span>
            </div>
          )}

          {hasChildren && (
            <button
              onClick={(e) => toggle(member.id, e)}
              className="mt-2 w-full py-1 px-2 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>
                {children.length} {lang === 'bn' ? 'সন্তান' : 'Children'}
              </span>
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Children Subtree */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center">
            {/* Vertical connector down */}
            <div className="w-px h-6 bg-stone-300 dark:bg-stone-700" />

            {/* Horizontal bar connecting children */}
            <div className="relative flex justify-center pt-2">
              {children.length > 1 && (
                <div
                  className="absolute top-0 h-px bg-stone-300 dark:bg-stone-700"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `calc(100% - ${256 / children.length}px)`,
                  }}
                />
              )}

              <div className="flex items-start gap-6">
                {children.map((child) => (
                  <div key={child.id} className="relative flex flex-col items-center">
                    <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 -mt-2 mb-2" />
                    {renderNode(child.id)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-stone-50 dark:bg-stone-950 overflow-auto">
      {/* Zoom Toolbar */}
      <div className="sticky top-4 z-20 flex justify-end px-6 pointer-events-none">
        <div className="flex items-center gap-1 p-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-800 shadow-md pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300 px-1 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.4))}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-0.5" />
          <button
            onClick={() => setZoom(0.85)}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-0.5" />
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md cursor-pointer"
          >
            {lang === 'bn' ? 'সব প্রসারিত' : 'Expand'}
          </button>
          <button
            onClick={collapseToGen4}
            className="px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md cursor-pointer"
          >
            {lang === 'bn' ? 'সংকুচিত' : 'Collapse'}
          </button>
        </div>
      </div>

      {/* Scaled Vertical Tree Canvas */}
      <div className="p-8 flex justify-center min-w-max pb-36">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {renderNode('dhonaulla')}
        </div>
      </div>
    </div>
  );
};
