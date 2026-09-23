export const MOTION = {
  enterMs: 320,
  shuffleCards: 16,
  shuffleLoopMs: 1600,
  shuffleMinCommitMs: 1900,
  cutMs: 500,
  cutVisibleMax: 10,
  dealFlightMs: 620,
  dealGapThreeMs: 180,
  dealGapCelticMs: 120,
  dealCapMs: 1800,
  flipMs: 640,
  uprightPauseMs: 240,
  uprightMs: 780,
  readFadeMs: 420,
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

export function dealDelayMs(index: number, cardCount: number): number {
  if (index < 0) return 0;
  return index * dealGapMs(cardCount);
}

export function dealDurationMs(cardCount: number, reduced: boolean): number {
  if (reduced) return 0;
  const n = Math.max(1, cardCount);
  const total = MOTION.dealFlightMs + dealGapMs(n) * (n - 1) + 80;
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

export function visibleCutCounts(cutIndex: number): { top: number; bottom: number } {
  const topRaw = Math.min(77, Math.max(1, cutIndex));
  const bottomRaw = 78 - topRaw;
  return {
    top: Math.min(MOTION.cutVisibleMax, topRaw),
    bottom: Math.min(MOTION.cutVisibleMax, bottomRaw),
  };
}
