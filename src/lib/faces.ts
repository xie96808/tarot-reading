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

/** Sizes shared by the reveal preload and the card that actually flips. */
export const FACE_SIZES = {
  step: '220px',
  row: '(max-width: 720px) 220px, 170px',
} as const;

export function revealFaceSizes(compact: boolean): string {
  return compact ? FACE_SIZES.step : FACE_SIZES.row;
}

export function faceSlotKey(digest: string, sizes: string): string {
  return `${digest}|${sizes}`;
}

export function pictureSources(urls: FaceUrls, sizes: string) {
  return {
    sizes,
    webpSrcSet: `${urls.variants[320].webp} 320w, ${urls.variants[480].webp} 480w, ${urls.variants[800].webp} 800w`,
    webpSrc: urls.variants[480].webp,
  };
}

const decodedSlots = new Set<string>();
const decodingSlots = new Map<string, Promise<boolean>>();

export function isFaceDecoded(digest: string, sizes: string): boolean {
  return decodedSlots.has(faceSlotKey(digest, sizes));
}

export function forgetFaceDecode(digest: string, sizes: string): void {
  const key = faceSlotKey(digest, sizes);
  decodedSlots.delete(key);
  decodingSlots.delete(key);
}

/** Resolves true only after the same candidate the card will paint has decoded. */
export function decodeFace(urls: FaceUrls, sizes: string): Promise<boolean> {
  const key = faceSlotKey(urls.digest, sizes);
  if (decodedSlots.has(key)) return Promise.resolve(true);
  const pendingDecode = decodingSlots.get(key);
  if (pendingDecode) return pendingDecode;
  if (typeof Image === 'undefined') return Promise.resolve(false);
  const task = new Promise<boolean>((resolve) => {
    const image = new Image();
    const sources = pictureSources(urls, sizes);
    image.sizes = sizes;
    image.srcset = sources.webpSrcSet;
    image.src = sources.webpSrc;
    const finish = (ok: boolean) => {
      if (ok) decodedSlots.add(key);
      decodingSlots.delete(key);
      resolve(ok);
    };
    if (typeof image.decode === 'function') {
      image.decode().then(() => finish(true), () => finish(false));
      return;
    }
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
  });
  decodingSlots.set(key, task);
  return task;
}

export function cardKey(cardId: CardId, positionId: string): string {
  return `${positionId}:${cardId}`;
}
