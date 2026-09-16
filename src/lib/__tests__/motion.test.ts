import { describe, expect, it } from 'vitest';
import {
  MOTION,
  autoUprightDelayMs,
  dealDelayMs,
  dealDurationMs,
  shuffleCommitHoldMs,
  visibleCutCounts,
} from '@/lib/motion';

describe('deal timing', () => {
  it('uses flight + stagger and stays under the celtic cap', () => {
    expect(dealDurationMs(1, false)).toBe(MOTION.dealFlightMs + 80);
    expect(dealDurationMs(3, false)).toBe(360 + 120 * 2 + 80);
    expect(dealDurationMs(10, false)).toBe(360 + 100 * 9 + 80);
    expect(dealDurationMs(10, false)).toBeLessThanOrEqual(MOTION.dealCapMs);
    expect(dealDurationMs(10, true)).toBe(0);
  });

  it('staggers from the first card at delay 0', () => {
    expect(dealDelayMs(0, 3)).toBe(0);
    expect(dealDelayMs(2, 3)).toBe(240);
    expect(dealDelayMs(9, 10)).toBe(900);
  });
});

describe('shuffle and cut motion helpers', () => {
  it('holds the riffle on screen while crypto finishes, unless reduced', () => {
    expect(shuffleCommitHoldMs(false)).toBe(900);
    expect(shuffleCommitHoldMs(true)).toBe(0);
  });

  it('delays auto-upright until after the flip, and skips delay when reduced', () => {
    expect(autoUprightDelayMs(false, false)).toBeNull();
    expect(autoUprightDelayMs(true, true)).toBe(0);
    expect(autoUprightDelayMs(true, false)).toBe(MOTION.flipMs + MOTION.uprightPauseMs);
  });

  it('caps visible packets so the DOM never mounts 78 faces', () => {
    expect(visibleCutCounts(1)).toEqual({ top: 1, bottom: 10 });
    expect(visibleCutCounts(39)).toEqual({ top: 10, bottom: 10 });
    expect(visibleCutCounts(77)).toEqual({ top: 10, bottom: 1 });
  });
});
