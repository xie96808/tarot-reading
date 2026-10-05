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
  it('uses fan + flight + stagger and stays under the celtic cap', () => {
    expect(dealDurationMs(1, false)).toBe(MOTION.dealFanMs + MOTION.dealFlightMs + 160);
    expect(dealDurationMs(3, false)).toBe(MOTION.dealFanMs + MOTION.dealFlightMs + MOTION.dealGapThreeMs * 2 + 160);
    expect(dealDurationMs(10, false)).toBe(
      Math.min(MOTION.dealFanMs + MOTION.dealFlightMs + MOTION.dealGapCelticMs * 9 + 160, MOTION.dealCapMs),
    );
    expect(MOTION.dealCapMs).toBeLessThanOrEqual(3200);
    expect(dealDurationMs(10, false)).toBeLessThanOrEqual(MOTION.dealCapMs);
    expect(dealDurationMs(10, true)).toBe(0);
  });

  it('staggers after a short fan lead, first card at fan Ms', () => {
    expect(dealDelayMs(0, 3)).toBe(MOTION.dealFanMs);
    expect(dealDelayMs(2, 3)).toBe(MOTION.dealFanMs + MOTION.dealGapThreeMs * 2);
    expect(dealDelayMs(9, 10)).toBe(MOTION.dealFanMs + MOTION.dealGapCelticMs * 9);
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
