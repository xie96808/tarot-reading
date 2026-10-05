import { existsSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { MOTION, dealDurationMs } from '@/lib/motion';

describe('layered ritual assets and timing', () => {
  it.each(['webp', 'jpg'])('ships an optimized background with %s fallback', async format => {
    const file = `public/table/wood-v3.${format}`;
    expect(await sharp(file).metadata()).toMatchObject({ width:1600, height:900 });
    expect(statSync(file).size).toBeLessThan(160000);
  });

  it('ships felt mat as webp only (no fat png in public)', async () => {
    const webp = await sharp('public/table/felt-mat-oval.webp').metadata();
    expect(webp.width).toBeGreaterThanOrEqual(1600);
    expect(webp.height).toBeGreaterThanOrEqual(1000);
    expect(statSync('public/table/felt-mat-oval.webp').size).toBeLessThan(200000);
    expect(existsSync('public/table/felt-mat-oval.png')).toBe(false);
  });

  it.each([
    'public/hands/shuffle/idle.webp',
    'public/hands/shuffle/split.webp',
    'public/hands/shuffle/riffle.webp',
    'public/hands/shuffle/seal.webp',
    'public/hands/cut/lift.webp',
    'public/hands/cut/sidebyside.webp',
    'public/hands/cut/press.webp',
    'public/hands/receive/appear.webp',
    'public/hands/receive/hold.webp',
    'public/hands/receive/withdraw.webp',
    'public/cards/back.svg',
    'public/cards/back-legacy.svg',
  ])('ships ritual frame %s', (file) => {
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeGreaterThan(500);
  });

  it('does not ship redundant hand PNGs in public', () => {
    expect(existsSync('public/hands/shuffle/idle.png')).toBe(false);
    expect(existsSync('public/hands/cut/lift.png')).toBe(false);
    expect(existsSync('public/hands/receive/hold.png')).toBe(false);
    expect(existsSync('public/hands/1.png')).toBe(false);
  });

  it('does not use invalid JavaScript modulo in CSS animation transforms', () => {
    const css = readFileSync('src/components/ritual/ShuffleTable.module.css', 'utf8');
    expect(css).not.toMatch(/var\(--i\)\s*%/);
    expect(css).toContain('var(--layer)');
    expect(css).toContain("data-hand-frame='split'");
    expect(css).toContain("data-hand-frame='riffle'");
  });

  it('keeps the seal and final staggered flight onscreen until settled', () => {
    expect(MOTION.shuffleMinCommitMs).toBeGreaterThanOrEqual(1700 + 7 * 12);
    expect(dealDurationMs(10, false)).toBeGreaterThanOrEqual(MOTION.dealFlightMs + 9 * MOTION.dealGapCelticMs);
    expect(MOTION.cutMs).toBeGreaterThanOrEqual(440);
    expect(MOTION.dealFlightMs).toBeGreaterThanOrEqual(1200);
    expect(MOTION.dealCapMs).toBeLessThanOrEqual(3200);
    expect(MOTION.shuffleFrameMs).toBeGreaterThanOrEqual(700);
    expect(MOTION.shuffleMinCommitMs).toBeGreaterThanOrEqual(2500);
  });
});
