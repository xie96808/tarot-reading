'use client';

import { useState } from 'react';
import type { FaceUrls } from '@/lib/faces';
import { pictureSources } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
import styles from './CardFace.module.css';

type CardFaceProps = {
  urls: FaceUrls;
  sizes: string;
  alt: string;
};

export function CardFace({ urls, sizes, alt }: CardFaceProps) {
  const sources = pictureSources(urls, sizes);
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);
  if (failed) {
    return (
      <div className={styles.fallback}>
        <p>{alt}</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setNonce((n) => n + 1);
          }}
        >
          {COPY.imageRetry}
        </button>
      </div>
    );
  }
  return (
    <picture>
      <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes} />
      <img
        key={nonce}
        className={styles.face}
        src={sources.jpegSrc}
        srcSet={sources.jpegSrcSet}
        sizes={sizes}
        alt={alt}
        width={800}
        height={1280}
        onError={() => setFailed(true)}
        draggable={false}
      />
    </picture>
  );
}
