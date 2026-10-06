export const MOTION = {
  enterMs: 320,
  shuffleCards: 16,
  shuffleLoopMs: 1600,
  shuffleMinCommitMs: 2800,
  /** Cadence for hold hand-frame + packet pose swaps (readable in screenshots). */
  shuffleFrameMs: 750,
  cutMs: 560,
  /** Cap of DOM edges; thickness also scales with real packet size via --stack-pct. */
  cutVisibleMax: 16,
  dealFlightMs: 1200,
  dealGapThreeMs: 280,
  dealGapCelticMs: 140,
  dealCapMs: 3200,
  dealFanMs: 450,
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
  const total = MOTION.dealFanMs + MOTION.dealFlightMs + dealGapMs(n) * (n - 1) + 160;
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
