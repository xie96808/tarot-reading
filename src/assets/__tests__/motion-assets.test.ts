import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { MOTION, dealDurationMs } from '@/lib/motion';

describe('layered ritual assets and timing', () => {
  it.each(['webp', 'jpg'])('ships an optimized background with %s fallback', async format => {
    const file = `public/table/wood-v3.${format}`;
    expect(await sharp(file).metadata()).toMatchObject({ width:1600, height:900 });
    expect(statSync(file).size).toBeLessThan(160000);
  });
  it('does not use invalid JavaScript modulo in CSS animation transforms', () => {
    const css = readFileSync('src/components/ritual/ShuffleTable.module.css', 'utf8');
    expect(css).not.toMatch(/var\(--i\)\s*%/);
    expect(css).toContain('var(--layer)');
  });
  it('keeps the seal and final staggered flight onscreen until settled', () => {
    expect(MOTION.shuffleMinCommitMs).toBeGreaterThanOrEqual(1700 + 7 * 12);
    expect(dealDurationMs(10, false)).toBeGreaterThanOrEqual(MOTION.dealFlightMs + 9 * MOTION.dealGapCelticMs);
    expect(MOTION.cutMs).toBeGreaterThanOrEqual(440);
  });
});
