'use client';

import type { FaceUrls } from '@/lib/faces';
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
}: Card3DProps) {
  return (
    <div className={`${styles.slot} ${crossing ? styles.crossing : ''}`}>
      <div className={styles.flip}>
        <div className={`${styles.inner} ${revealed ? styles.revealed : ''}`}>
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
          翻开这一张
        </button>
      ) : null}
    </div>
  );
}
