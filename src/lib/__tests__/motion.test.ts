import { describe, expect, it } from 'vitest';
import {
  MOTION,
  autoUprightDelayMs,
  dealDelayMs,
  dealDurationMs,
  shuffleCommitHoldMs,
  cutProportion,
  visibleCutCounts,
} from '@/lib/motion';

describe('deal timing', () => {
  it('uses flight + stagger and stays under the celtic cap', () => {
    expect(dealDurationMs(1, false)).toBe(MOTION.dealFlightMs + 80);
    expect(dealDurationMs(3, false)).toBe(MOTION.dealFlightMs + MOTION.dealGapThreeMs * 2 + 80);
    expect(dealDurationMs(10, false)).toBe(MOTION.dealFlightMs + MOTION.dealGapCelticMs * 9 + 80);
    expect(MOTION.dealCapMs).toBeLessThanOrEqual(1800);
    expect(dealDurationMs(10, false)).toBeLessThanOrEqual(MOTION.dealCapMs);
    expect(dealDurationMs(10, true)).toBe(0);
  });

  it('staggers from the first card at delay 0', () => {
    expect(dealDelayMs(0, 3)).toBe(0);
    expect(dealDelayMs(2, 3)).toBe(MOTION.dealGapThreeMs * 2);
    expect(dealDelayMs(9, 10)).toBe(MOTION.dealGapCelticMs * 9);
  });
});

describe('shuffle and cut motion helpers', () => {
  it('holds the riffle on screen while crypto finishes, unless reduced', () => {
    expect(shuffleCommitHoldMs(false)).toBe(MOTION.shuffleMinCommitMs);
    expect(shuffleCommitHoldMs(true)).toBe(0);
  });

  it('delays auto-upright until after the flip, and skips delay when reduced', () => {
    expect(autoUprightDelayMs(false, false)).toBeNull();
    expect(autoUprightDelayMs(true, true)).toBe(0);
    expect(autoUprightDelayMs(true, false)).toBe(MOTION.flipMs + MOTION.uprightPauseMs);
  });

  it('reports the real cut proportion, not the capped packet', () => {
    expect(cutProportion(1)).toEqual({ top: 1, bottom: 77, topPct: 1 / 78 });
    expect(cutProportion(39)).toEqual({ top: 39, bottom: 39, topPct: 39 / 78 });
    expect(cutProportion(77)).toEqual({ top: 77, bottom: 1, topPct: 77 / 78 });
    expect(cutProportion(0)).toBeNull();
    expect(cutProportion(78)).toBeNull();
    expect(cutProportion(1.5)).toBeNull();
  });

  it('caps visible packets so the DOM never mounts 78 faces', () => {
    expect(visibleCutCounts(1)).toEqual({ top: 1, bottom: 10 });
    expect(visibleCutCounts(39)).toEqual({ top: 10, bottom: 10 });
    expect(visibleCutCounts(77)).toEqual({ top: 10, bottom: 1 });
  });
});
