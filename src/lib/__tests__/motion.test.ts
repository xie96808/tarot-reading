import { describe, expect, it } from 'vitest';
import {
  MOTION,
  autoUprightDelayMs,
  cutEdgeGapPx,
  dealDelayMs,
  dealDurationMs,
  shuffleCommitHoldMs,
  cutProportion,
  visibleCutCounts,
} from '@/lib/motion';

describe('deal timing', () => {
  it('ends when the last card lands, plus a short settle', () => {
    expect(MOTION.dealFlightMs).toBe(480);
    expect(MOTION.dealGapThreeMs).toBe(160);
    expect(dealDurationMs(1, false)).toBe(480 + 80);
    expect(dealDurationMs(3, false)).toBe(160 * 2 + 480 + 80);
    expect(dealDurationMs(10, false)).toBe(160 * 9 + 480 + 80);
    expect(dealDurationMs(10, false)).toBe(dealDelayMs(9, 10) + MOTION.dealFlightMs + 80);
    expect(dealDurationMs(10, true)).toBe(0);
  });

  it('starts the first card immediately and staggers the rest', () => {
    expect(dealDelayMs(0, 3)).toBe(0);
    expect(dealDelayMs(2, 3)).toBe(MOTION.dealGapThreeMs * 2);
    expect(dealDelayMs(9, 10)).toBe(MOTION.dealGapCelticMs * 9);
    expect(dealDelayMs(0, 3, true)).toBe(0);
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

  it('scales visible packet edges with real thickness so thin ≠ thick', () => {
    const thin = visibleCutCounts(8);
    const mid = visibleCutCounts(39);
    const thick = visibleCutCounts(70);
    expect(thin.top).toBeLessThan(thick.top);
    expect(thin.bottom).toBeGreaterThan(thick.bottom);
    expect(mid.top).toBeGreaterThan(thin.top);
    expect(cutEdgeGapPx(8)).toBeLessThan(cutEdgeGapPx(70));
    expect(thick.top).toBeLessThanOrEqual(MOTION.cutVisibleMax);
  });
});
