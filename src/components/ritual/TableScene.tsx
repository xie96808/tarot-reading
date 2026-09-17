'use client';

import type { PointerEventHandler, ReactNode } from 'react';
import type { TableHandMode } from '@/lib/table-hands';
import styles from './TableScene.module.css';

const HAND_SRC: Record<Exclude<TableHandMode, 'none'>, { webp: string; jpeg: string; alt: string }> = {
  idle: {
    webp: '/table/hands-idle.webp',
    jpeg: '/table/hands-idle.jpg',
    alt: '',
  },
  riffle: {
    webp: '/table/hands-riffle.webp',
    jpeg: '/table/hands-riffle.jpg',
    alt: '',
  },
  cut: {
    webp: '/table/hands-cut.webp',
    jpeg: '/table/hands-cut.jpg',
    alt: '',
  },
};

type TableSceneProps = {
  hand: TableHandMode;
  children: ReactNode;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
  label?: string;
  feedbackLabel?: string;
  layout?: 'play' | 'spread';
};

export function TableScene({
  hand,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  label,
  feedbackLabel = '查看牌堆示意',
  layout = 'play',
}: TableSceneProps) {
  const interactive = Boolean(onPointerDown);
  const src = hand === 'none' ? null : HAND_SRC[hand];
  const photograph = (
    <picture className={styles.surface}>
      <source type="image/webp" srcSet={src?.webp ?? '/table/surface.webp'} />
      <img src={src?.jpeg ?? '/table/surface.jpg'} alt="" width={1600} height={900} draggable={false} />
    </picture>
  );

  if (layout === 'spread') {
    return (
      <div className={`${styles.scene} ${styles.spread}`} data-table-scene="spread">
        {photograph}
        <div className={styles.felt}>{children}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.scene} ${styles.photo} ${interactive ? styles.grab : ''}`}
        data-table-scene="photo"
        data-hand={hand}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        role="img"
        aria-label={label}
      >
        {photograph}
      </div>
      <details className={styles.feedback}>
        <summary>{feedbackLabel}</summary>
        <div className={styles.diagram}>{children}</div>
      </details>
    </div>
  );
}
