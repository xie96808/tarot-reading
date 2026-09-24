import type { PauseActionKind, PauseOffer } from '@/data/lexicons/zh-1/pauses/types';

export function shouldOpenPauseText(kind: PauseActionKind): boolean {
  return kind === 'engage';
}

export function promptForPause(
  offer: PauseOffer,
  previous: 'action' | 'skip' | 'missing' | null,
): string {
  if (offer.pauseIndex === 1) return offer.promptZh;
  if (previous === 'action') return offer.promptAfterActionZh;
  return offer.promptAfterSkipZh;
}

const GATED_POSITIONS = ['past', 'present', 'future'] as const;
export type GatedPositionId = (typeof GATED_POSITIONS)[number];

export function nextGatedPosition(state: {
  pause: { positionId: 'past' | 'present' } | null;
  pauseAnswers: readonly { positionId: string }[];
  revealed: readonly string[];
}): GatedPositionId | null {
  if (state.pause) return state.pause.positionId;
  const answered = new Set(state.pauseAnswers.map((answer) => answer.positionId));
  const revealed = new Set(state.revealed);
  const done = (positionId: 'past' | 'present') => answered.has(positionId) || revealed.has(positionId);
  for (const positionId of GATED_POSITIONS) {
    if (positionId === 'future') {
      if (done('past') && done('present') && !revealed.has('future')) return 'future';
      continue;
    }
    if (!answered.has(positionId) && !revealed.has(positionId)) return positionId;
  }
  return null;
}
