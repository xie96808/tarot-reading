import { afterEach, describe, expect, it, vi } from 'vitest';

const oneCard = {
  cards: [
    {
      cardId: '00_the_fool',
      digest: 'abc',
      variants: {
        320: { webp: '/a.webp' },
        480: { webp: '/b.webp' },
        800: { webp: '/c.webp' },
      },
    },
  ],
};

describe('reveal face sizes', () => {
  it('keeps the preload sizes on the same candidates the visible card declares', async () => {
    const { FACE_SIZES, revealFaceSizes } = await import('../faces');
    expect(revealFaceSizes(true)).toBe(FACE_SIZES.step);
    expect(revealFaceSizes(false)).toBe(FACE_SIZES.row);
    expect(FACE_SIZES.step).toBe('220px');
    expect(FACE_SIZES.row).toBe('(max-width: 720px) 220px, 170px');
  });
});

describe('decodeFace', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('decodes the same sizes and srcset the card image uses', async () => {
    const seen: Array<{ sizes: string; srcset: string; src: string }> = [];
    class FakeImage {
      sizes = '';
      srcset = '';
      src = '';
      decode(): Promise<void> {
        seen.push({ sizes: this.sizes, srcset: this.srcset, src: this.src });
        return Promise.resolve();
      }
    }
    vi.stubGlobal('Image', FakeImage);
    const { decodeFace, isFaceDecoded, pictureSources } = await import('../faces');
    const urls = {
      digest: 'abc',
      variants: {
        320: { webp: '/a.webp' },
        480: { webp: '/b.webp' },
        800: { webp: '/c.webp' },
      },
    } as const;
    const sources = pictureSources(urls, '220px');
    await expect(decodeFace(urls, '220px')).resolves.toBe(true);
    expect(seen).toEqual([{ sizes: '220px', srcset: sources.webpSrcSet, src: sources.webpSrc }]);
    expect(isFaceDecoded('abc', '220px')).toBe(true);
    await decodeFace(urls, '220px');
    expect(seen).toHaveLength(1);
  });
});

describe('loadFaceIndex', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('shares one request and still notifies a subscriber if the first caller went away', async () => {
    let resolveJson: (value: unknown) => void = () => {};
    const body = new Promise((resolve) => {
      resolveJson = resolve;
    });
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => body }));
    vi.stubGlobal('fetch', fetchMock);
    const { loadFaceIndex, subscribeFaceIndex } = await import('../faces');
    const seen: number[] = [];
    const stop = subscribeFaceIndex((faces) => seen.push(faces.size));
    const first = loadFaceIndex();
    const second = loadFaceIndex();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveJson(oneCard);
    const [map] = await Promise.all([first, second]);
    expect(map.get('00_the_fool')?.digest).toBe('abc');
    expect(seen).toEqual([1]);
    stop();
    await loadFaceIndex();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
