'use client';

import type { CSSProperties, PointerEventHandler, ReactNode } from 'react';
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
  pointer?: { x: number; y: number };
  children: ReactNode;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
  label?: string;
  layout?: 'play' | 'spread';
};

export function TableScene({
  hand,
  pointer = { x: 0, y: 0 },
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  label,
  layout = 'play',
}: TableSceneProps) {
  const interactive = Boolean(onPointerDown);
  const src = hand === 'none' ? null : HAND_SRC[hand];
  return (
    <div
      className={`${styles.scene} ${interactive ? styles.grab : ''} ${layout === 'spread' ? styles.spread : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role={interactive ? 'img' : undefined}
      aria-label={label}
      style={
        {
          '--hx': String(pointer.x),
          '--hy': String(pointer.y),
        } as CSSProperties
      }
    >
      <picture className={styles.surface}>
        <source type="image/webp" srcSet="/table/surface.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/table/surface.jpg" alt="" width={1600} height={900} />
      </picture>
      <div className={styles.lamp} aria-hidden="true" />
      <div className={styles.felt}>{children}</div>
      {src ? (
        <picture className={`${styles.hands} ${styles[hand]}`}>
          <source type="image/webp" srcSet={src.webp} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src.jpeg} alt={src.alt} width={1600} height={900} />
        </picture>
      ) : null}
    </div>
  );
}
