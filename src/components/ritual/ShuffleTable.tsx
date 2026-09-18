'use client';

import type { CSSProperties, PointerEventHandler } from 'react';
import type { ShufflePhase } from '@/lib/ritual-machine';
import { MOTION } from '@/lib/motion';
import { COPY } from '@/i18n/zh-CN';
import { CardBack } from './CardBack';
import styles from './ShuffleTable.module.css';

type ShuffleTableProps = {
  phase: ShufflePhase;
  paused?: boolean;
  reduced?: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export function ShuffleTable({
  phase,
  paused = false,
  reduced = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: ShuffleTableProps) {
  const riffle = !reduced && !paused && (phase === 'holding' || phase === 'committing');
  return (
    <div
      className={`${styles.table} ${riffle ? styles.riffle : styles.idle} ${phase === 'committing' ? styles.sealing : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-shuffle-phase={phase}
      data-paused={paused || reduced}
      role="img"
      aria-label={phase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}
    >
      <div className={styles.halo} aria-hidden="true" />
      {Array.from({ length: MOTION.shuffleCards }, (_, index) => (
        <div
          key={index}
          className={styles.card}
          data-shuffle-card
          style={
            {
              '--i': index,
              '--layer': index % 8,
              '--fan': index - (MOTION.shuffleCards - 1) / 2,
              '--shuffle-ms': `${MOTION.shuffleLoopMs}ms`,
              '--side': index < MOTION.shuffleCards / 2 ? -1 : 1,
            } as CSSProperties
          }
        >
          <CardBack alt="" />
        </div>
      ))}
      <span className={styles.caption} aria-hidden="true">{phase === 'idle' ? '按住牌堆 · 让思绪慢下来' : phase === 'holding' ? '交错 · 混合' : '归拢 · 静候这一刻'}</span>
    </div>
  );
}
