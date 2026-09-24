'use client';

import { useState, type CSSProperties, type PointerEventHandler, type ReactNode } from 'react';
import type { TableHandMode } from '@/lib/table-hands';
import styles from './TableScene.module.css';

type TableSceneProps = {
  hand: TableHandMode;
  children: ReactNode;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
  label?: string;
  layout?: 'play' | 'spread';
  paused?: boolean;
};

/** One stationary background; mat, light and real cards are independent layers. */
export function TableScene({ hand, children, onPointerDown, onPointerMove, onPointerUp,
  onPointerCancel, label, layout = 'play', paused = false }: TableSceneProps) {
  const [jpegFallback, setJpegFallback] = useState(false);
  return (
    <div className={`${styles.scene} ${styles[layout]} ${onPointerDown ? styles.grab : ''}`}
      data-table-scene={layout} data-hand={hand} data-paused={paused}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel} aria-label={label} role={layout === 'play' ? 'img' : undefined}>
      <picture className={styles.surface}>
        {!jpegFallback ? <source type="image/webp" srcSet="/table/wood-v3.webp" /> : null}
        <img data-table-background src="/table/wood-v3.jpg" alt="" width={1600} height={900} draggable={false} onError={(event) => {
          if (!jpegFallback) setJpegFallback(true);
          else event.currentTarget.style.opacity = '0';
        }} />
      </picture>
      <div className={styles.mat} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.motes} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => <i key={i} style={{ '--m': i } as CSSProperties} />)}
      </div>
      <span className={styles.inscription} aria-hidden="true">✦ &nbsp; 烛下 · 此刻 &nbsp; ✦</span>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
