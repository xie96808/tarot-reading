'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { cutEdgeGapPx, cutProportion, visibleCutCounts } from '@/lib/motion';
import { CUT_HAND_SRC, cutHandFrame, cutIndexFromPointer, type CutHandFrame } from '@/lib/table-hands';
import { CardBack } from './CardBack';
import { CutHands } from './RitualHands';
import styles from './CutTable.module.css';

type CutTableProps = {
  cutIndex: number;
  gathering?: boolean;
  reduced?: boolean;
  disabled?: boolean;
  onCutChange?: (cutIndex: number) => void;
  onHandFrame?: (frame: CutHandFrame | null) => void;
};

export function CutTable({
  cutIndex,
  gathering = false,
  reduced = false,
  disabled = false,
  onCutChange,
  onHandFrame,
}: CutTableProps) {
  const dragging = useRef(false);
  const [dragVisual, setDragVisual] = useState(false);
  // Local cut mirrors parent but updates in the same pointer event for zero-lag labels.
  const [localCut, setLocalCut] = useState(cutIndex);
  if (!dragVisual && localCut !== cutIndex) {
    setLocalCut(cutIndex);
  }

  useEffect(() => {
    for (const src of Object.values(CUT_HAND_SRC)) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  const frame = cutHandFrame({ gathering, dragging: dragVisual, reduced });
  useEffect(() => {
    onHandFrame?.(frame);
    return () => onHandFrame?.(null);
  }, [frame, onHandFrame]);

  const counts = visibleCutCounts(localCut);
  const topGap = cutEdgeGapPx(localCut);
  const bottomGap = cutEdgeGapPx(78 - localCut);
  const proportion = cutProportion(localCut);

  const applyPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || gathering || !onCutChange) return;
    const next = cutIndexFromPointer(event.clientX, event.currentTarget.getBoundingClientRect());
    setLocalCut(next);
    onCutChange(next);
  };

  return (
    <div
      className={styles.table}
      data-cut-index={localCut}
      data-gathering={gathering}
      data-dragging={dragVisual || undefined}
      data-hand-frame={frame ?? undefined}
      style={
        {
          '--cut': localCut / 78,
          '--top-n': counts.top,
          '--bottom-n': counts.bottom,
          '--top-edge': `${topGap}px`,
          '--bottom-edge': `${bottomGap}px`,
          '--top-pct': proportion?.topPct ?? 0.5,
          '--bottom-pct': 1 - (proportion?.topPct ?? 0.5),
        } as CSSProperties
      }
      role="img"
      aria-label={`上叠 ${localCut} 张，下叠 ${78 - localCut} 张`}
      onPointerDown={(event) => {
        if (disabled || gathering || !onCutChange) return;
        event.preventDefault();
        dragging.current = true;
        setDragVisual(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        applyPointer(event);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        event.preventDefault();
        applyPointer(event);
      }}
      onPointerUp={() => {
        dragging.current = false;
        setDragVisual(false);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        setDragVisual(false);
      }}
    >
      {frame ? <CutHands frame={frame} /> : null}
      {(['top', 'bottom'] as const).map((side) => (
        <div key={side} className={`${styles.packet} ${styles[side]}`} data-cut-packet data-cut-side={side}>
          {Array.from({ length: counts[side] }, (_, index) => (
            <div
              key={index}
              className={styles.card}
              style={
                {
                  '--n': index,
                  '--edge': side === 'top' ? 'var(--top-edge)' : 'var(--bottom-edge)',
                } as CSSProperties
              }
            >
              <CardBack alt="" />
            </div>
          ))}
        </div>
      ))}
      <span className={styles.caption} aria-hidden="true">
        {gathering ? '合拢牌堆 · 准备发牌' : '在桌上左右拖动 · 或用滑块选择分界'}
      </span>
    </div>
  );
}
