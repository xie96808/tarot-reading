export const MOTION = {
  enterMs: 320,
  shuffleCards: 16,
  shuffleLoopMs: 1500,
  shuffleMinCommitMs: 1900,
  shuffleFrameMs: 420,
  cutMs: 560,
  cutVisibleMax: 10,
  dealFlightMs: 720,
  dealGapThreeMs: 190,
  dealGapCelticMs: 110,
  dealCapMs: 1900,
  dealFanMs: 280,
  flipMs: 640,
  uprightPauseMs: 220,
  uprightMs: 780,
  readFadeMs: 420,
  seamLeadMs: 80,
  seamMs: 260,
  sceneCompleteMs: 260,
  palmMs: 520,
  settleMs: 360,
  seamPx: 12,
  partialTurnDeg: 126,
  palmShiftPct: 12,
  revealPressMs: 120,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function dealGapMs(cardCount: number): number {
  return cardCount >= 10 ? MOTION.dealGapCelticMs : MOTION.dealGapThreeMs;
}

export function dealDelayMs(index: number, cardCount: number, reduced = false): number {
  if (index < 0) return 0;
  const fan = reduced ? 0 : MOTION.dealFanMs;
  return fan + index * dealGapMs(cardCount);
}

export function dealDurationMs(cardCount: number, reduced: boolean): number {
  if (reduced) return 0;
  const n = Math.max(1, cardCount);
  const total = MOTION.dealFanMs + MOTION.dealFlightMs + dealGapMs(n) * (n - 1) + 80;
  return Math.min(total, MOTION.dealCapMs);
}

export function shuffleCommitHoldMs(reduced: boolean): number {
  return reduced ? 0 : MOTION.shuffleMinCommitMs;
}

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function autoUprightDelayMs(reversed: boolean, reduced: boolean): number | null {
  if (!reversed) return null;
  if (reduced) return 0;
  return MOTION.flipMs + MOTION.uprightPauseMs;
}

export function cutProportion(cutIndex: number): { top: number; bottom: number; topPct: number } | null {
  if (!Number.isInteger(cutIndex) || cutIndex < 1 || cutIndex > 77) return null;
  return { top: cutIndex, bottom: 78 - cutIndex, topPct: cutIndex / 78 };
}

export function visibleCutCounts(cutIndex: number): { top: number; bottom: number } {
  const topRaw = Math.min(77, Math.max(1, cutIndex));
  const bottomRaw = 78 - topRaw;
  return {
    top: Math.min(MOTION.cutVisibleMax, topRaw),
    bottom: Math.min(MOTION.cutVisibleMax, bottomRaw),
  };
}
