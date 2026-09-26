import { afterEach, describe, expect, it, vi } from 'vitest';

const oneCard = {
  cards: [
    {
      cardId: '00_the_fool',
      digest: 'abc',
      variants: {
        320: { webp: '/a.webp', jpeg: '/a.jpg' },
        480: { webp: '/b.webp', jpeg: '/b.jpg' },
        800: { webp: '/c.webp', jpeg: '/c.jpg' },
      },
    },
  ],
};

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
