'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { FaceUrls } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
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
  reversed,
  sizes,
  onReveal,
  label,
  crossing,
  dealDelayMs = 0,
  dealing = false,
}: Card3DProps) {
  const [flipped, setFlipped] = useState(revealed);

  useEffect(() => {
    if (!revealed) {
      setFlipped(false);
      return;
    }
    const frame = requestAnimationFrame(() => setFlipped(true));
    return () => cancelAnimationFrame(frame);
  }, [revealed]);

  return (
    <div
      className={`${styles.slot} ${crossing ? styles.crossing : ''} ${dealing ? styles.dealing : ''}`}
      style={{ '--deal-delay': `${dealDelayMs}ms` } as CSSProperties}
    >
      <div className={styles.flip}>
        <div className={`${styles.inner} ${flipped ? styles.revealed : ''}`}>
          <div className={styles.back}>
            <CardBack alt={revealed ? '' : alt} />
          </div>
          <div className={styles.front}>
            {revealed && urls ? (
              <CardFace urls={urls} sizes={sizes} alt={alt} reversed={reversed} />
            ) : null}
          </div>
        </div>
      </div>
      {label ? <p className={styles.label}>{label}</p> : null}
      {!revealed && onReveal ? (
        <button type="button" className={styles.action} onClick={onReveal}>
          {COPY.revealAction}
        </button>
      ) : null}
    </div>
  );
}
