import type { CardId } from '@/data/card-ids';

export type FaceUrls = {
  digest: string;
  variants: Record<320 | 480 | 800, { webp: string; jpeg: string }>;
};

type Manifest = {
  cards: Array<{
    cardId: string;
    digest: string;
    variants: Record<string, { webp: string; jpeg: string }>;
  }>;
};

let cached: Map<string, FaceUrls> | null = null;

export async function loadFaceIndex(): Promise<Map<string, FaceUrls>> {
  if (cached) return cached;
  const res = await fetch('/cards/rws-1/manifest.json');
  if (!res.ok) throw new Error('deck manifest missing');
  const manifest = (await res.json()) as Manifest;
  cached = new Map(
    manifest.cards.map((card) => [
      card.cardId,
      {
        digest: card.digest,
        variants: card.variants as FaceUrls['variants'],
      },
    ]),
  );
  return cached;
}

export function pictureSources(urls: FaceUrls, sizes: string) {
  return {
    sizes,
    webpSrcSet: `${urls.variants[320].webp} 320w, ${urls.variants[480].webp} 480w, ${urls.variants[800].webp} 800w`,
    jpegSrcSet: `${urls.variants[320].jpeg} 320w, ${urls.variants[480].jpeg} 480w, ${urls.variants[800].jpeg} 800w`,
    jpegSrc: urls.variants[480].jpeg,
  };
}

export function cardKey(cardId: CardId, positionId: string): string {
  return `${positionId}:${cardId}`;
}
