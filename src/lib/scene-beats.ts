import { MOTION } from '@/lib/motion';
import type { SceneId } from '@/lib/scene';

export type SceneVisual = 'back' | 'door-partial' | 'door-full' | 'hand-partial' | 'hand-settled';

export type SceneBeatDurations = {
  seamMs: number;
  partialFlipMs: number;
  completeMs: number;
  palmMs: number;
  settleMs: number;
};

export function sceneBeatDurations(reduced: boolean): SceneBeatDurations {
  if (reduced) {
    return { seamMs: 0, partialFlipMs: 0, completeMs: 0, palmMs: 0, settleMs: 0 };
  }
  return {
    seamMs: MOTION.seamMs,
    partialFlipMs: MOTION.flipMs,
    completeMs: MOTION.sceneCompleteMs,
    palmMs: MOTION.palmMs,
    settleMs: MOTION.settleMs,
  };
}

/** Past and present choices stay disabled until the opening motion finishes. */
export function pauseActionsReadyMs(sceneId: SceneId, reduced: boolean): number {
  if (reduced) return 0;
  if (sceneId === 'hand') return MOTION.palmMs;
  return MOTION.seamLeadMs + MOTION.seamMs + MOTION.flipMs;
}

export function futureBeatSchedule(sceneId: SceneId, reduced: boolean): {
  sentenceAtMs: number;
  meaningAtMs: number;
  doneAtMs: number;
} {
  if (reduced) {
    return { sentenceAtMs: 0, meaningAtMs: 0, doneAtMs: MOTION.readFadeMs };
  }
  const sentenceAtMs = sceneId === 'door' ? MOTION.seamMs + MOTION.flipMs : MOTION.palmMs + MOTION.settleMs;
  return {
    sentenceAtMs,
    meaningAtMs: sentenceAtMs + MOTION.readFadeMs,
    doneAtMs: sentenceAtMs + MOTION.readFadeMs * 2,
  };
}

/** Lexicon copy fades in only after the partial visual has finished opening. */
export function meaningAfterPauseMs(sceneId: SceneId, reduced: boolean): number {
  if (reduced) return 0;
  return sceneId === 'hand' ? MOTION.settleMs : MOTION.sceneCompleteMs;
}

export function lockedSceneVisual(input: {
  sceneId: SceneId;
  positionId: string;
  revealed: readonly string[];
  pausePositionId: string | null;
  futureOpen: boolean;
  handFutureSettled: boolean;
}): SceneVisual {
  const open = input.revealed.includes(input.positionId);
  if (input.pausePositionId === input.positionId && !open) {
    return input.sceneId === 'door' ? 'door-partial' : 'hand-partial';
  }
  if (input.positionId === 'future' && input.futureOpen) {
    if (input.sceneId === 'door') return 'door-full';
    return input.handFutureSettled ? 'hand-settled' : 'hand-partial';
  }
  if (open) return input.sceneId === 'door' ? 'door-full' : 'hand-settled';
  return 'back';
}
