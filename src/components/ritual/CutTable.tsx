'use client';
import type { CSSProperties } from 'react';
import { visibleCutCounts } from '@/lib/motion';
import { CardBack } from './CardBack';
import styles from './CutTable.module.css';

export function CutTable({ cutIndex, gathering = false }: { cutIndex: number; gathering?: boolean }) {
  const counts = visibleCutCounts(cutIndex);
  return (
    <div className={styles.table} data-cut-index={cutIndex} data-gathering={gathering}
      style={{ '--cut': cutIndex / 78 } as CSSProperties} role="img" aria-label={`上叠 ${cutIndex} 张，下叠 ${78 - cutIndex} 张`}>
      {(['top', 'bottom'] as const).map(side => (
        <div key={side} className={`${styles.packet} ${styles[side]}`} data-cut-packet>
          {Array.from({ length: counts[side] }, (_, index) => (
            <div key={index} className={styles.card} style={{ '--n': index } as CSSProperties}><CardBack alt="" /></div>
          ))}
        </div>
      ))}
      <div className={styles.counts} aria-hidden="true"><span>上叠 · {cutIndex}</span><span>下叠 · {78 - cutIndex}</span></div>
      <span className={styles.caption} aria-hidden="true">{gathering ? '合拢牌堆 · 准备发牌' : '移动滑块 · 选择分界'}</span>
    </div>
  );
}
