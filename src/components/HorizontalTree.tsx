import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FamilyMember, Language } from '../types/genealogy';
import { MEMBERS_MAP, GENERATION_LABELS } from '../data/familyData';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Heart,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Sparkles,
  Navigation,
} from 'lucide-react';

interface HorizontalTreeProps {
  lang: Language;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  highlightedPathIds: Set<string>;
}

interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  width: number;
  height: number;
  isExpanded: boolean;
  children: TreeNode[];
}

export const HorizontalTree: React.FC<HorizontalTreeProps> = ({
  lang,
  selectedMemberId,
  onSelectMember,
  highlightedPathIds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Collapsed state
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const ids = new Set<string>();
    MEMBERS_MAP.forEach((m) => {
      if (m.childrenIds.length > 0 && m.generation >= 4) {
        ids.add(m.id);
      }
    });
    setCollapsedIds(ids);
  };

  // Node Dimensions
  const nodeWidth = 260;
  const nodeHeight = 84;
  const colGap = 90;
  const rowGap = 20;

  // Custom Hand-Sketch Oriented Layout Engine
  const layout = useMemo(() => {
    // Column X positions
    const colX = {
      1: 50, // Dhonaulla Molla
      2: 50 + (nodeWidth + colGap), // 5 Sons
      3: 50 + (nodeWidth + colGap) * 2, // Wazed Ali Molla
      4: 50 + (nodeWidth + colGap) * 3, // Wazed Ali's children (Nazrul, Samsul, etc.)
      5: 50 + (nodeWidth + colGap) * 4, // Grandchildren
      6: 50 + (nodeWidth + colGap) * 5, // Great-grandchildren
      7: 50 + (nodeWidth + colGap) * 6, // Great-great-grandchildren
    };

    let currentY = 50;

    // Helper to recursively layout descendants of Wazed Ali's children
    function layoutSubtree(memberId: string, depth: number): TreeNode | null {
      const member = MEMBERS_MAP.get(memberId);
      if (!member) return null;

      const isExpanded = !collapsedIds.has(memberId);
      const childNodes: TreeNode[] = [];

      if (isExpanded && member.childrenIds.length > 0) {
        for (const cid of member.childrenIds) {
          const childNode = layoutSubtree(cid, depth + 1);
          if (childNode) childNodes.push(childNode);
        }
      }

      let yPos: number;
      if (childNodes.length === 0) {
        yPos = currentY;
        currentY += nodeHeight + rowGap;
      } else {
        const firstY = childNodes[0].y;
        const lastY = childNodes[childNodes.length - 1].y;
        yPos = (firstY + lastY) / 2;
      }

      const xPos = colX[depth as keyof typeof colX] || depth * (nodeWidth + colGap) + 50;

      return {
        member,
        x: xPos,
        y: yPos,
        width: nodeWidth,
        height: nodeHeight,
        isExpanded,
        children: childNodes,
      };
    }

    // 1. Layout Wazed Ali's branches (Generation 4 downwards)
    const wazedAliChildrenIds = [
      'nazrul_islam',
      'samsul_alam',
      'abu_mostofa',
      'mohammad_ali',
      'ahammed_ali',
      'fatema',
      'rabeya',
    ];

    const wazedChildrenNodes: TreeNode[] = [];
    for (const cid of wazedAliChildrenIds) {
      const node = layoutSubtree(cid, 4);
      if (node) wazedChildrenNodes.push(node);
    }

    // 2. Position Wazed Ali Molla (Gen 3) centered relative to his children
    const firstWazedChildY = wazedChildrenNodes[0]?.y ?? 100;
    const lastWazedChildY = wazedChildrenNodes[wazedChildrenNodes.length - 1]?.y ?? 400;
    const wazedAliY = (firstWazedChildY + lastWazedChildY) / 2;

    const wazedAliMember = MEMBERS_MAP.get('wazed_ali')!;
    const wazedAliNode: TreeNode = {
      member: wazedAliMember,
      x: colX[3],
      y: wazedAliY,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: !collapsedIds.has('wazed_ali'),
      children: collapsedIds.has('wazed_ali') ? [] : wazedChildrenNodes,
    };

    // Torabuddin's daughter
    const torabuddinDaughterMember = MEMBERS_MAP.get('torabuddin_daughter');
    const torabuddinDaughterNode: TreeNode | null = torabuddinDaughterMember
      ? {
          member: torabuddinDaughterMember,
          x: colX[3],
          y: wazedAliY + nodeHeight + 25,
          width: nodeWidth,
          height: nodeHeight,
          isExpanded: true,
          children: [],
        }
      : null;

    // 3. Position Torabuddin Molla (Gen 2) aligned horizontally with Wazed Ali Molla
    const torabuddinY = wazedAliY;
    const torabuddinMember = MEMBERS_MAP.get('torabuddin')!;
    const torabChildren = [wazedAliNode];
    if (torabuddinDaughterNode) torabChildren.push(torabuddinDaughterNode);

    const torabuddinNode: TreeNode = {
      member: torabuddinMember,
      x: colX[2],
      y: torabuddinY,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: !collapsedIds.has('torabuddin'),
      children: collapsedIds.has('torabuddin') ? [] : torabChildren,
    };

    // 4. Place 5 Sons of Dhonaulla Molla in Column 2 compactly
    // Haran above Torabuddin; Jorap, Tamez, Nidan below Torabuddin
    const sonSpacing = nodeHeight + 24;
    const haranNode: TreeNode = {
      member: MEMBERS_MAP.get('haran')!,
      x: colX[2],
      y: torabuddinY - sonSpacing,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: true,
      children: [],
    };

    const jorapNode: TreeNode = {
      member: MEMBERS_MAP.get('jorap')!,
      x: colX[2],
      y: torabuddinY + sonSpacing,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: true,
      children: [],
    };

    const tamezNode: TreeNode = {
      member: MEMBERS_MAP.get('tamez')!,
      x: colX[2],
      y: torabuddinY + sonSpacing * 2,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: true,
      children: [],
    };

    const nidanNode: TreeNode = {
      member: MEMBERS_MAP.get('nidan')!,
      x: colX[2],
      y: torabuddinY + sonSpacing * 3,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: true,
      children: [],
    };

    const fiveSons = [haranNode, torabuddinNode, jorapNode, tamezNode, nidanNode];

    // 5. Position Dhonaulla Molla (Gen 1) centered at Torabuddin
    const dhonaullaMember = MEMBERS_MAP.get('dhonaulla')!;
    const dhonaullaNode: TreeNode = {
      member: dhonaullaMember,
      x: colX[1],
      y: torabuddinY,
      width: nodeWidth,
      height: nodeHeight,
      isExpanded: !collapsedIds.has('dhonaulla'),
      children: collapsedIds.has('dhonaulla') ? [] : fiveSons,
    };

    const maxY = Math.max(currentY, nidanNode.y + nodeHeight) + 400;

    return { rootNode: dhonaullaNode, totalHeight: maxY };
  }, [collapsedIds]);

  // Flatten nodes & links
  const { allNodes, allLinks } = useMemo(() => {
    const nodes: TreeNode[] = [];
    const links: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      fromId: string;
      toId: string;
      isHighlighted: boolean;
    }[] = [];

    function traverse(node: TreeNode) {
      nodes.push(node);
      for (const child of node.children) {
        const isHighlighted =
          highlightedPathIds.has(node.member.id) && highlightedPathIds.has(child.member.id);

        links.push({
          fromX: node.x + node.width,
          fromY: node.y + node.height / 2,
          toX: child.x,
          toY: child.y + child.height / 2,
          fromId: node.member.id,
          toId: child.member.id,
          isHighlighted,
        });
        traverse(child);
      }
    }

    if (layout.rootNode) {
      traverse(layout.rootNode);
    }
    return { allNodes: nodes, allLinks: links };
  }, [layout, highlightedPathIds]);

  // NATURAL SCROLL & ZOOM LOGIC
  const handleWheel = (e: React.WheelEvent) => {
    // If user holds Ctrl or Cmd, or pinches, ZOOM:
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.94 : 1.06;
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.2), 2.2));
    } else {
      // NATURAL PAN/SCROLL: Wheel scrolls vertically! Shift+wheel scrolls horizontally!
      setPan((prev) => ({
        x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
        y: prev.y - (e.shiftKey ? 0 : e.deltaY),
      }));
    }
  };

  // Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Jump to specific branch coordinates
  const jumpTo = (targetX: number, targetY: number, customScale = 0.75) => {
    if (!containerRef.current) return;
    const viewWidth = containerRef.current.clientWidth;
    const viewHeight = containerRef.current.clientHeight;

    setScale(customScale);
    setPan({
      x: viewWidth / 2 - targetX * customScale,
      y: viewHeight / 2 - targetY * customScale,
    });
  };

  const scrollToTop = () => {
    setPan((prev) => ({ ...prev, y: 40 }));
  };

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    const viewHeight = containerRef.current.clientHeight;
    setPan((prev) => ({
      ...prev,
      y: -(layout.totalHeight * scale - viewHeight + 200),
    }));
  };

  const resetView = () => {
    setScale(0.65);
    setPan({ x: 40, y: 30 });
  };

  const fitView = () => {
    if (!containerRef.current) return;
    const viewWidth = containerRef.current.clientWidth;
    const viewHeight = containerRef.current.clientHeight;
    const calculatedScale = Math.min(viewWidth / 2500, viewHeight / layout.totalHeight, 0.6);
    setScale(Math.max(calculatedScale, 0.28));
    setPan({ x: 20, y: 20 });
  };

  // Generation column markers
  const generationColumns = [
    { gen: 1, x: 50 },
    { gen: 2, x: 50 + (nodeWidth + colGap) },
    { gen: 3, x: 50 + (nodeWidth + colGap) * 2 },
    { gen: 4, x: 50 + (nodeWidth + colGap) * 3 },
    { gen: 5, x: 50 + (nodeWidth + colGap) * 4 },
    { gen: 6, x: 50 + (nodeWidth + colGap) * 5 },
    { gen: 7, x: 50 + (nodeWidth + colGap) * 6 },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-stone-50 dark:bg-stone-950 select-none">
      {/* Background Dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #78716c 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* QUICK BRANCH JUMPER BAR (Allows instant navigation to any branch without scrolling trouble) */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto no-scrollbar pointer-events-auto max-w-[calc(100%-240px)]">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 px-2 shrink-0 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-500" />
            <span>{lang === 'bn' ? 'দ্রুত যান:' : 'Jump to:'}</span>
          </span>

          <button
            onClick={() => jumpTo(50, layout.rootNode?.y ?? 500, 0.8)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'ধনাউল্লা ও ৫ ভাই' : 'Root & 5 Brothers'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 2, layout.rootNode?.y ?? 500, 0.85)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'ওয়াজেদ আলী ❤️ আফছুন্নাহার' : 'Wazed Ali ❤️ Afchunnahar'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 3, 200, 0.75)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '১. নজরুল ইসলাম শাখা' : '1. Nazrul Islam'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 3, 750, 0.75)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '২. সামসুল আলম শাখা' : '2. Samsul Alam'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 3, 1450, 0.75)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '৩. আবু মোস্তফা শাখা' : '3. Abu Mostofa'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 3, 1850, 0.75)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '৪. মোহাম্মদ আলী শাখা' : '4. Mohammad Ali'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 3, 2150, 0.75)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '৫. আহাম্মেদ আলী শাখা' : '5. Ahammed Ali'}
          </button>

          <button
            onClick={() => jumpTo(50 + (nodeWidth + colGap) * 5, 200, 0.85)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '👶 ইয়াদ / জায়েদ আহমেদ' : '👶 Jayed / Iyad'}
          </button>
        </div>

        {/* Scroll Up & Scroll Down Quick Buttons */}
        <div className="flex items-center gap-1 p-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm pointer-events-auto shrink-0">
          <button
            onClick={scrollToTop}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'শীর্ষে' : 'Top'}</span>
          </button>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-800" />
          <button
            onClick={scrollToBottom}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Scroll to Bottom"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Bottom'}</span>
          </button>
        </div>
      </div>

      {/* Floating Zoom & Canvas Controls */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col items-center gap-1 p-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.15, 2.2))}
          className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom percentage readout */}
        <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300 py-0.5 tabular-nums">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() => setScale((s) => Math.max(s - 0.15, 0.2))}
          className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-stone-200 dark:bg-stone-800 my-0.5" />

        <button
          onClick={fitView}
          className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          title="Fit All on Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Mouse scroll hint */}
      <div className="absolute bottom-2 left-4 z-20 pointer-events-none text-[11px] text-stone-400 dark:text-stone-500">
        {lang === 'bn'
          ? '💡 মাউস ড্র্যাগ করে টানুন বা স্ক্রল করুন। জুম করতে Ctrl চেপে মাউস চাকা ঘুরান।'
          : '💡 Click & drag to pan, or mouse scroll up/down. Hold Ctrl + wheel to zoom.'}
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            width: '3200px',
            height: `${layout.totalHeight + 500}px`,
            position: 'relative',
          }}
        >
          {/* Generation Column Header Markers */}
          {generationColumns.map(({ gen, x }) => {
            const genInfo = GENERATION_LABELS[gen];
            return (
              <div
                key={gen}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: '10px',
                  width: `${nodeWidth}px`,
                }}
                className="pointer-events-none text-left"
              >
                <div className="flex items-center gap-2 border-b-2 border-stone-300 dark:border-stone-700 pb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    {lang === 'bn' ? genInfo?.bn : genInfo?.en}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                    {lang === 'bn' ? genInfo?.subtitleBn : genInfo?.subtitleEn}
                  </span>
                </div>
              </div>
            );
          })}

          {/* SVG Links Layer */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ width: '3200px', height: `${layout.totalHeight + 500}px` }}
          >
            {allLinks.map((link, idx) => {
              // Smooth step curve (orthogonal path matching user's sketch)
              const midX = (link.fromX + link.toX) / 2;
              const pathD = `M ${link.fromX} ${link.fromY} C ${midX} ${link.fromY}, ${midX} ${link.toY}, ${link.toX} ${link.toY}`;

              return (
                <g key={`link-${idx}`}>
                  {link.isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={6}
                      strokeOpacity={0.4}
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={link.isHighlighted ? '#10b981' : '#cbd5e1'}
                    strokeWidth={link.isHighlighted ? 3 : 1.75}
                    className={
                      link.isHighlighted
                        ? 'transition-all duration-300'
                        : 'dark:stroke-stone-700 transition-all duration-300'
                    }
                  />
                  {link.isHighlighted && (
                    <circle r="3.5" fill="#10b981">
                      <animateMotion path={pathD} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {allNodes.map((node) => {
            const member = node.member;
            const isSelected = selectedMemberId === member.id;
            const isInPath = highlightedPathIds.has(member.id);
            const hasChildren = member.childrenIds.length > 0;

            let borderStyle = 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900';
            if (isSelected) {
              borderStyle =
                'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/50 shadow-lg';
            } else if (isInPath) {
              borderStyle =
                'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/40 dark:bg-amber-950/30';
            }

            // Special highlighted border for Wazed Ali Molla to emphasize Wazed Ali ❤️ Afchunnahar
            const isWazedAli = member.id === 'wazed_ali';
            if (isWazedAli && !isSelected && !isInPath) {
              borderStyle =
                'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 shadow-md';
            }

            const name = lang === 'bn' ? member.nameBn : member.nameEn;
            const spouseName = member.spouse
              ? lang === 'bn'
                ? member.spouse.nameBn
                : member.spouse.nameEn
              : null;

            return (
              <div
                key={node.member.id}
                onClick={() => onSelectMember(member.id)}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`group rounded-xl border p-2.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${borderStyle}`}
              >
                {/* Top Row: Gender Tag & Generation */}
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                        member.gender === 'male'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {member.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500 text-[10px] font-mono tabular-nums">
                      G{member.generation}
                    </span>
                  </div>

                  {hasChildren && (
                    <button
                      onClick={(e) => toggleCollapse(member.id, e)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-0.5 cursor-pointer shrink-0"
                    >
                      <span>{member.childrenIds.length}</span>
                      {node.isExpanded ? (
                        <ChevronDown className="w-2.5 h-2.5" />
                      ) : (
                        <ChevronRight className="w-2.5 h-2.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Primary Name */}
                <div className="truncate my-0.5">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {name}
                  </h4>
                </div>

                {/* Bottom Row: Spouse (❤️) or Branch info */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {spouseName ? (
                    <div className="flex items-center gap-1 truncate text-rose-600 dark:text-rose-400 font-semibold">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                      <span className="truncate">{spouseName}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                      {lang === 'bn' ? member.branchNameBn : member.branchNameEn}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
