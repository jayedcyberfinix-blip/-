import React, { useState, useRef, useMemo, useLayoutEffect, useEffect, useCallback } from 'react';
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
  ArrowLeft,
  ArrowRight,
  Navigation,
} from 'lucide-react';

interface HorizontalTreeProps {
  lang: Language;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  highlightedPathIds: Set<string>;
  highlightFitKey?: number;
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
  highlightFitKey = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(0.65);
  const hasMovedRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  // Collapsed state
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Node Dimensions
  const nodeWidth = 240;
  const nodeHeight = 82;
  const colGap = 72;
  const rowGap = 16;

  // Custom Hand-Sketch Oriented Layout Engine
  const layout = useMemo(() => {
    const colX = {
      1: 30, // Dhonaulla Molla
      2: 30 + (nodeWidth + colGap), // 5 Sons
      3: 30 + (nodeWidth + colGap) * 2, // Wazed Ali Molla
      4: 30 + (nodeWidth + colGap) * 3, // Wazed Ali's children
      5: 30 + (nodeWidth + colGap) * 4, // Grandchildren
      6: 30 + (nodeWidth + colGap) * 5, // Great-grandchildren
      7: 30 + (nodeWidth + colGap) * 6, // Great-great-grandchildren
    };

    let currentY = 64;

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

      const xPos = colX[depth as keyof typeof colX] || depth * (nodeWidth + colGap) + 30;

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

    const torabuddinDaughterMember = MEMBERS_MAP.get('torabuddin_daughter');
    const torabuddinDaughterNode: TreeNode | null = torabuddinDaughterMember
      ? {
          member: torabuddinDaughterMember,
          x: colX[3],
          y: wazedAliY + nodeHeight + 24,
          width: nodeWidth,
          height: nodeHeight,
          isExpanded: true,
          children: [],
        }
      : null;

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

    const sonSpacing = nodeHeight + 20;
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

    const maxY = Math.max(currentY, nidanNode.y + nodeHeight) + 200;

    return {
      rootNode: dhonaullaNode,
      totalHeight: maxY,
      torabuddinY,
      haranY: haranNode.y,
      wazedAliY,
      colX,
    };
  }, [collapsedIds]);

  // Flatten nodes & links + lookup map
  const { allNodes, allLinks, nodeMap } = useMemo(() => {
    const nodes: TreeNode[] = [];
    const map = new Map<string, TreeNode>();
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
      map.set(node.member.id, node);
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
    return { allNodes: nodes, allLinks: links, nodeMap: map };
  }, [layout, highlightedPathIds]);

  // Frame initial view cleanly on the core diagram (Dhonaulla -> 5 Sons -> Wazed Ali -> Branches)
  const centerCoreDiagram = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;
    const viewWidth = el.clientWidth;
    const viewHeight = el.clientHeight;
    if (viewWidth === 0 || viewHeight === 0) return false;

    const isMobile = viewWidth < 768;
    // Target width: columns 1..3 (920px) on mobile, columns 1..4 (1300px) on desktop
    const targetSpanWidth = isMobile ? 930 : 1320;
    const targetScale = isMobile
      ? Math.min(Math.max((viewWidth - 20) / targetSpanWidth, 0.34), 0.55)
      : Math.min(Math.max((viewWidth - 40) / targetSpanWidth, 0.52), 0.78);

    // Center vertically around the 5-sons / root / Wazed Ali cluster
    const clusterCenterY = layout.torabuddinY + nodeHeight * 0.9;
    const topBarOffset = 28; // space below the quick-jumper bar

    setScale(targetScale);
    setPan({
      x: isMobile ? 10 : 24,
      y: viewHeight / 2 - clusterCenterY * targetScale + topBarOffset,
    });
    return true;
  }, [layout.torabuddinY]);

  useLayoutEffect(() => {
    if (hasInitializedRef.current) return;
    if (centerCoreDiagram()) {
      hasInitializedRef.current = true;
      return;
    }

    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!hasInitializedRef.current && centerCoreDiagram()) {
        hasInitializedRef.current = true;
        ro.disconnect();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [centerCoreDiagram]);

  const lastFittedKeyRef = useRef<number>(0);

  // Expand any collapsed nodes on highlighted path and frame the highlighted relationship
  useEffect(() => {
    if (!highlightFitKey || highlightFitKey === lastFittedKeyRef.current || highlightedPathIds.size === 0) {
      return;
    }

    let expandedAny = false;
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      highlightedPathIds.forEach((id) => {
        if (next.has(id)) {
          next.delete(id);
          expandedAny = true;
        }
      });
      return expandedAny ? next : prev;
    });

    // If nodes were just expanded, wait for next layout/nodeMap pass before framing
    if (expandedAny) return;

    const el = containerRef.current;
    if (!el) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let count = 0;

    highlightedPathIds.forEach((id) => {
      const n = nodeMap.get(id);
      if (n) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
        count++;
      }
    });

    if (count === 0) return;

    const viewWidth = el.clientWidth;
    const viewHeight = el.clientHeight;
    if (viewWidth === 0 || viewHeight === 0) return;

    const padX = viewWidth < 768 ? 48 : 96;
    const padY = viewWidth < 768 ? 110 : 120;
    const boxW = Math.max(maxX - minX, nodeWidth);
    const boxH = Math.max(maxY - minY, nodeHeight);

    const targetScale = Math.min(
      Math.max(Math.min((viewWidth - padX) / boxW, (viewHeight - padY) / boxH), 0.24),
      0.92
    );

    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    lastFittedKeyRef.current = highlightFitKey;
    hasInitializedRef.current = true;
    setScale(targetScale);
    setPan({
      x: viewWidth / 2 - boxCenterX * targetScale,
      y: viewHeight / 2 - boxCenterY * targetScale - 12,
    });
  }, [highlightFitKey, highlightedPathIds, nodeMap]);

  // WHEEL PAN & ZOOM
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.94 : 1.06;
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.18), 2.2));
    } else {
      setPan((prev) => ({
        x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
        y: prev.y - (e.shiftKey ? 0 : e.deltaY),
      }));
    }
  };

  // MOUSE DRAG
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if (
      Math.abs(e.clientX - dragStartRef.current.x - pan.x) > 3 ||
      Math.abs(e.clientY - dragStartRef.current.y - pan.y) > 3
    ) {
      hasMovedRef.current = true;
    }
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // MOBILE TOUCH HANDLING (Single Finger Pan + Two Finger Pinch Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    hasMovedRef.current = false;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const nextX = e.touches[0].clientX - dragStartRef.current.x;
      const nextY = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.abs(nextX - pan.x) > 4 || Math.abs(nextY - pan.y) > 4) {
        hasMovedRef.current = true;
      }
      setPan({ x: nextX, y: nextY });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      hasMovedRef.current = true;
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = newDist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * ratio, 0.18), 2.2);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Jump dynamically to any member node by ID
  const jumpToMember = (memberId: string, customScale?: number) => {
    const node = nodeMap.get(memberId);
    if (!node || !containerRef.current) return;
    const viewWidth = containerRef.current.clientWidth;
    const viewHeight = containerRef.current.clientHeight;
    const targetScale = customScale ?? (viewWidth < 768 ? 0.55 : 0.8);

    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;

    setScale(targetScale);
    setPan({
      x: viewWidth / 2 - centerX * targetScale,
      y: viewHeight / 2 - centerY * targetScale,
    });
  };

  const panDelta = (dx: number, dy: number) => {
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const fitView = () => {
    if (!containerRef.current) return;
    const viewWidth = containerRef.current.clientWidth;
    const viewHeight = containerRef.current.clientHeight;
    const calculatedScale = Math.min((viewWidth - 32) / 2200, (viewHeight - 80) / layout.totalHeight);
    setScale(Math.max(calculatedScale, 0.2));
    setPan({ x: 16, y: 52 });
  };

  const resetView = () => {
    centerCoreDiagram();
  };

  // Place generation column headers right above the topmost nodes in each column
  const generationColumns = [
    { gen: 1, x: layout.colX[1], y: layout.torabuddinY - 38 },
    { gen: 2, x: layout.colX[2], y: layout.haranY - 38 },
    { gen: 3, x: layout.colX[3], y: layout.wazedAliY - 38 },
    { gen: 4, x: layout.colX[4], y: 18 },
    { gen: 5, x: layout.colX[5], y: 18 },
    { gen: 6, x: layout.colX[6], y: 18 },
    { gen: 7, x: layout.colX[7], y: 18 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-50 dark:bg-stone-950 select-none touch-none">
      {/* Background Dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #78716c 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* QUICK BRANCH JUMPER BAR */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto no-scrollbar pointer-events-auto max-w-full">
          <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 dark:text-stone-500 px-1.5 sm:px-2 shrink-0 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-500" />
            <span className="hidden xs:inline">{lang === 'bn' ? 'যান:' : 'Jump:'}</span>
          </span>

          <button
            type="button"
            onClick={() => centerCoreDiagram()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? 'ধনাউল্লা ও ৫ ভাই' : 'Patriarch & Sons'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('wazed_ali')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? 'ওয়াজেদ আলী ❤️ আফছুন্নাহার' : 'Wazed Ali ❤️ Afchunnahar'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('nazrul_islam')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '১. নজরুল ইসলাম' : '1. Nazrul'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('samsul_alam')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '২. সামসুল আলম' : '2. Samsul'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('abu_mostofa')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '৩. আবু মোস্তফা' : '3. Abu Mostofa'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('mohammad_ali')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '৪. মোহাম্মদ আলী' : '4. Mohammad Ali'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('ahammed_ali')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '৫. আহাম্মেদ আলী' : '5. Ahammed Ali'}
          </button>

          <button
            type="button"
            onClick={() => jumpToMember('jayed_ahmed')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[32px] flex items-center"
          >
            {lang === 'bn' ? '👶 ইয়াদ / জায়েদ' : '👶 Jayed / Iyad'}
          </button>
        </div>
      </div>

      {/* MOBILE & DESKTOP FLOATING CONTROLLER (Bottom Right) */}
      <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-5 z-20 flex flex-col items-center gap-1.5 p-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl pointer-events-auto">
        <div className="flex flex-col items-center gap-1 pb-1 border-b border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => panDelta(0, 150)}
            className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Pan Up"
            aria-label="Pan Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => panDelta(150, 0)}
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Pan Left"
              aria-label="Pan Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => panDelta(-150, 0)}
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Pan Right"
              aria-label="Pan Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => panDelta(0, -150)}
            className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Pan Down"
            aria-label="Pan Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(s + 0.15, 2.2))}
          className="w-8 h-8 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300 py-0.5 tabular-nums">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={() => setScale((s) => Math.max(s - 0.15, 0.18))}
          className="w-8 h-8 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-stone-200 dark:bg-stone-800 my-0.5" />

        <button
          type="button"
          onClick={fitView}
          className="w-8 h-8 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Fit Full Tree"
          aria-label="Fit Full Tree"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={resetView}
          className="w-8 h-8 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Touch & Scroll Hint */}
      <div className="hidden sm:block absolute bottom-2 left-4 z-20 pointer-events-none text-[11px] text-stone-400 dark:text-stone-500">
        {lang === 'bn'
          ? '💡 মাউস বা আঙুল দিয়ে টেনে প্যান করুন। দুই আঙুলে পিঞ্চ বা Ctrl+স্ক্রল করে জুম করুন।'
          : '💡 Drag or swipe to pan. Pinch or Ctrl+scroll to zoom.'}
      </div>

      {/* Main Touch-Friendly Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing touch-none ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            width: '2600px',
            height: `${layout.totalHeight + 300}px`,
            position: 'relative',
          }}
        >
          {/* Generation Column Header Markers */}
          {generationColumns.map(({ gen, x, y }) => {
            const genInfo = GENERATION_LABELS[gen];
            return (
              <div
                key={gen}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${nodeWidth}px`,
                }}
                className="pointer-events-none text-left"
              >
                <div className="flex items-center gap-2 border-b-2 border-stone-300 dark:border-stone-700 pb-1">
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
            style={{ width: '2600px', height: `${layout.totalHeight + 300}px` }}
          >
            {allLinks.map((link, idx) => {
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
                onClick={() => {
                  if (!hasMovedRef.current) {
                    onSelectMember(member.id);
                  }
                }}
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
                      type="button"
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
