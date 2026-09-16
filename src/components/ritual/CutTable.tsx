'use client';

import type { CSSProperties } from 'react';
import { visibleCutCounts } from '@/lib/motion';
import { CardBack } from './CardBack';
import styles from './CutTable.module.css';

export function CutTable({ cutIndex }: { cutIndex: number }) {
  const counts = visibleCutCounts(cutIndex);
  return (
    <div className={styles.table} aria-hidden="true">
      <div className={`${styles.packet} ${styles.top}`}>
        {Array.from({ length: counts.top }, (_, index) => (
          <div
            key={`t-${index}`}
            className={styles.card}
            style={{ '--n': index } as CSSProperties}
          >
            <CardBack alt="" />
          </div>
        ))}
      </div>
      <div className={`${styles.packet} ${styles.bottom}`}>
        {Array.from({ length: counts.bottom }, (_, index) => (
          <div
            key={`b-${index}`}
            className={styles.card}
            style={{ '--n': index } as CSSProperties}
          >
            <CardBack alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
