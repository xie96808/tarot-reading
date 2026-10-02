import type { CardId } from '@/data/card-ids';

export type FaceUrls = {
  digest: string;
  variants: Record<320 | 480 | 800, { webp: string }>;
};

type Manifest = {
  cards: Array<{
    cardId: string;
    digest: string;
    variants: Record<string, { webp: string }>;
  }>;
};

let cached: Map<string, FaceUrls> | null = null;
let pending: Promise<Map<string, FaceUrls>> | null = null;
const listeners = new Set<(faces: Map<string, FaceUrls>) => void>();

async function fetchFaceIndex(): Promise<Map<string, FaceUrls>> {
  const res = await fetch('/cards/rws-1/manifest.json');
  if (!res.ok) throw new Error('deck manifest missing');
  const manifest = (await res.json()) as Manifest;
  return new Map(
    manifest.cards.map((card) => [
      card.cardId,
      {
        digest: card.digest,
        variants: card.variants as FaceUrls['variants'],
      },
    ]),
  );
}

export function loadFaceIndex(): Promise<Map<string, FaceUrls>> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetchFaceIndex()
      .then((index) => {
        cached = index;
        pending = null;
        for (const listener of [...listeners]) listener(index);
        return index;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

/** Current subscribers are told when the catalog arrives, even if an earlier caller unmounted. */
export function subscribeFaceIndex(listener: (faces: Map<string, FaceUrls>) => void): () => void {
  listeners.add(listener);
  if (cached) listener(cached);
  return () => {
    listeners.delete(listener);
  };
}

export function pictureSources(urls: FaceUrls, sizes: string) {
  return {
    sizes,
    webpSrcSet: `${urls.variants[320].webp} 320w, ${urls.variants[480].webp} 480w, ${urls.variants[800].webp} 800w`,
    webpSrc: urls.variants[480].webp,
  };
}

export function cardKey(cardId: CardId, positionId: string): string {
  return `${positionId}:${cardId}`;
}
