export const MOTION = {
  enterMs: 320,
  shuffleCards: 16,
  shuffleLoopMs: 1600,
  /** Auto shuffle, including gather. Crypto that runs longer keeps the real wait. */
  shuffleMinCommitMs: 1600,
  /** Cadence for hold hand-frame swaps. */
  shuffleFrameMs: 750,
  /** Release gathers from the live pose instead of replaying the auto timeline. */
  shuffleReleaseMs: 300,
  cutMs: 480,
  /** Cap of DOM edges; thickness also scales with real packet size via --stack-pct. */
  cutVisibleMax: 16,
  dealFlightMs: 480,
  dealGapThreeMs: 160,
  dealGapCelticMs: 160,
  dealFanMs: 0,
  flipMs: 480,
  uprightPauseMs: 80,
  uprightMs: 250,
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
  if (index < 0 || reduced) return 0;
  return index * dealGapMs(cardCount);
}

/** Ends when the last card has landed, plus a short settle. No cap clips the tail. */
export function dealDurationMs(cardCount: number, reduced: boolean): number {
  if (reduced) return 0;
  const n = Math.max(1, cardCount);
  return dealDelayMs(n - 1, n, false) + MOTION.dealFlightMs + 80;
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

/** Visible edge count scales with real packet size so 8 vs 70 look very different. */
export function visibleCutCounts(cutIndex: number): { top: number; bottom: number } {
  const topRaw = Math.min(77, Math.max(1, cutIndex));
  const bottomRaw = 78 - topRaw;
  const layers = (n: number) => {
    // 1→2 edges, 39→10, 77→16
    const t = n / 77;
    return Math.max(2, Math.min(MOTION.cutVisibleMax, Math.round(2 + t * (MOTION.cutVisibleMax - 2))));
  };
  return { top: layers(topRaw), bottom: layers(bottomRaw) };
}

/** Per-card edge offset in px grows with real packet thickness. */
export function cutEdgeGapPx(packetCount: number): number {
  const t = Math.min(77, Math.max(1, packetCount)) / 77;
  return 1.6 + t * 4.4;
}
