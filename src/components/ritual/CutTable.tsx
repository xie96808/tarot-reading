'use client';

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { visibleCutCounts } from '@/lib/motion';
import { cutIndexFromPointer } from '@/lib/table-hands';
import { CardBack } from './CardBack';
import { CutHands } from './RitualHands';
import styles from './CutTable.module.css';

type CutTableProps = {
  cutIndex: number;
  gathering?: boolean;
  reduced?: boolean;
  disabled?: boolean;
  onCutChange?: (cutIndex: number) => void;
};

export function CutTable({
  cutIndex,
  gathering = false,
  reduced = false,
  disabled = false,
  onCutChange,
}: CutTableProps) {
  const counts = visibleCutCounts(cutIndex);
  const dragging = useRef(false);
  const [dragVisual, setDragVisual] = useState(false);

  const applyPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || gathering || !onCutChange) return;
    const next = cutIndexFromPointer(event.clientX, event.currentTarget.getBoundingClientRect());
    onCutChange(next);
  };

  return (
    <div
      className={styles.table}
      data-cut-index={cutIndex}
      data-gathering={gathering}
      data-dragging={dragVisual || undefined}
      style={{ '--cut': cutIndex / 78, '--top-n': counts.top, '--bottom-n': counts.bottom } as CSSProperties}
      role="img"
      aria-label={`上叠 ${cutIndex} 张，下叠 ${78 - cutIndex} 张`}
      onPointerDown={(event) => {
        if (disabled || gathering || !onCutChange) return;
        dragging.current = true;
        setDragVisual(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        applyPointer(event);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
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
      <CutHands gathering={gathering} dragging={dragVisual} reduced={reduced} />
      {(['top', 'bottom'] as const).map((side) => (
        <div key={side} className={`${styles.packet} ${styles[side]}`} data-cut-packet>
          {Array.from({ length: counts[side] }, (_, index) => (
            <div key={index} className={styles.card} style={{ '--n': index } as CSSProperties}>
              <CardBack alt="" />
            </div>
          ))}
        </div>
      ))}
      <div className={styles.counts} aria-hidden="true">
        <span>上叠 · {cutIndex}</span>
        <span>下叠 · {78 - cutIndex}</span>
      </div>
      <span className={styles.caption} aria-hidden="true">
        {gathering ? '合拢牌堆 · 准备发牌' : '在桌上左右拖动 · 或用滑块选择分界'}
      </span>
    </div>
  );
}
