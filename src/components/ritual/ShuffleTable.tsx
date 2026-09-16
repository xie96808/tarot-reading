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
      className={`${styles.table} ${riffle ? styles.riffle : ''} ${phase === 'committing' ? styles.sealing : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role="img"
      aria-label={phase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}
    >
      {Array.from({ length: MOTION.shuffleCards }, (_, index) => (
        <div
          key={index}
          className={styles.card}
          style={
            {
              '--i': index,
              '--side': index < MOTION.shuffleCards / 2 ? -1 : 1,
            } as CSSProperties
          }
        >
          <CardBack alt="" />
        </div>
      ))}
    </div>
  );
}
