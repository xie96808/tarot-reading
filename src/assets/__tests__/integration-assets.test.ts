import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const assets = [
  ['og/og-cover.jpg', 1200, 630, false],
  ['share/parchment-strip.jpg', 1200, 400, false],
  ['ui/bookmark.png', 72, 200, true],
  ['ui/card-glow.png', 400, 400, true],
  ['ui/empty-lexicon.jpg', 480, 320, false],
] as const;

describe('integrated visual assets', () => {
  it.each(assets)('%s has the expected dimensions and transparency', async (file, width, height, hasAlpha) => {
    const meta = await sharp(`public/${file}`).metadata();
    expect(meta).toMatchObject({ width, height, hasAlpha });
  });
  it.each(['surface', 'hands-idle', 'hands-riffle', 'hands-cut'])('%s is a complete opaque photograph, not a hand cutout', async (name) => {
    for (const ext of ['jpg', 'webp']) {
      expect(await sharp(`public/table/${name}.${ext}`).metadata()).toMatchObject({ width: 1600, height: 900, hasAlpha: false });
    }
  });
});
