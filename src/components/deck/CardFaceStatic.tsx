import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CardId } from '@/data/card-ids';

type Manifest = {
  cards: Array<{
    cardId: string;
    variants: Record<string, { webp: string; jpeg: string }>;
  }>;
};

function urlsFor(cardId: CardId) {
  const file = path.join(process.cwd(), 'public/cards/rws-1/manifest.json');
  try {
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as Manifest;
    return manifest.cards.find((item) => item.cardId === cardId)?.variants ?? null;
  } catch {
    return null;
  }
}

export function CardFaceStatic({
  cardId,
  alt,
  sizes = '(max-width: 720px) 70vw, 320px',
  width = 'min(100%, 320px)',
}: {
  cardId: CardId;
  alt: string;
  sizes?: string;
  width?: string;
}) {
  const variants = urlsFor(cardId);
  if (!variants) return null;
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${variants[320].webp} 320w, ${variants[480].webp} 480w, ${variants[800].webp} 800w`}
        sizes={sizes}
      />
      <img
        src={variants[320].jpeg}
        srcSet={`${variants[320].jpeg} 320w, ${variants[480].jpeg} 480w, ${variants[800].jpeg} 800w`}
        sizes={sizes}
        width={800}
        height={1280}
        alt={alt}
        loading="lazy"
        style={{ width, height: 'auto' }}
      />
    </picture>
  );
}
