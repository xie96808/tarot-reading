'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { FaceUrls } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
import { autoUprightDelayMs, MOTION, prefersReducedMotion } from '@/lib/motion';
import { faceImageRotation, type FaceView } from '@/lib/transforms';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';
import styles from './Card3D.module.css';

type Card3DProps = {
  revealed: boolean;
  urls?: FaceUrls | null;
  alt: string;
  reversed?: boolean;
  sizes: string;
  onReveal?: () => void;
  label?: string;
  crossing?: boolean;
  dealDelayMs?: number;
  dealing?: boolean;
};

export function Card3D({
  revealed,
  urls,
  alt,
  reversed = false,
  sizes,
  onReveal,
  label,
  crossing,
  dealDelayMs = 0,
  dealing = false,
}: Card3DProps) {
  const [presentation, setPresentation] = useState({
    revealed,
    flipped: revealed,
    view: (revealed && reversed ? 'readable' : 'as-dealt') as FaceView,
    manual: false,
  });

  // Reset on the prop transition during render, before children commit stale state.
  if (presentation.revealed !== revealed) {
    setPresentation({ revealed, flipped: false, view: 'as-dealt', manual: false });
  }
  const { flipped, view } = presentation;

  useEffect(() => {
    if (!revealed) return;
    const frame = requestAnimationFrame(() => setPresentation((current) => ({ ...current, flipped: true })));
    const delay = autoUprightDelayMs(reversed, prefersReducedMotion());
    const timer = delay === null ? undefined : window.setTimeout(() => {
      setPresentation((current) => current.manual ? current : { ...current, view: 'readable' });
    }, delay);
    return () => {
      cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [revealed, reversed]);

  const rotation = faceImageRotation(reversed, view);

  return (
    <div
      className={`${styles.slot} ${crossing ? styles.crossing : ''} ${dealing ? styles.dealing : ''}`}
      style={
        {
          '--deal-delay': `${dealDelayMs}ms`,
          '--upright-ms': `${MOTION.uprightMs}ms`,
        } as CSSProperties
      }
    >
      <div className={styles.flip}>
        <span className={`${styles.glow} ${flipped ? styles.glowing : ''}`} aria-hidden="true" />
        <div className={`${styles.inner} ${flipped ? styles.revealed : ''}`}>
          <div className={styles.back}>
            <CardBack alt={revealed ? '' : alt} />
          </div>
          <div className={styles.front}>
            <div className={styles.orient} style={{ transform: `rotate(${rotation}deg)` }}>
              {revealed && urls ? <CardFace urls={urls} sizes={sizes} alt={alt} /> : null}
            </div>
            {revealed && reversed ? <span className={styles.badge}>{COPY.reversed}</span> : null}
          </div>
        </div>
      </div>
      {label ? <p className={styles.label}>{label}</p> : null}
      {!revealed && onReveal ? (
        <button type="button" className={styles.action} onClick={onReveal}>
          {COPY.revealAction}
        </button>
      ) : null}
      {revealed && reversed ? (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            setPresentation((current) => ({ ...current, manual: true, view: current.view === 'readable' ? 'as-dealt' : 'readable' }));
          }}
        >
          {view === 'readable' ? COPY.viewAsDealt : COPY.viewReadable}
        </button>
      ) : null}
    </div>
  );
}
