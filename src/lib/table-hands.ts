import type { ShufflePhase } from '@/lib/ritual-machine';

export type TableHandMode = 'none' | 'idle' | 'riffle' | 'cut';

export type ShuffleHandFrame = 'idle' | 'split' | 'riffle' | 'seal';
export type CutHandFrame = 'lift' | 'sidebyside' | 'press';
export type ReceiveHandFrame = 'appear' | 'hold' | 'withdraw';

export const SHUFFLE_HAND_SRC: Record<ShuffleHandFrame, string> = {
  idle: '/hands/shuffle/idle.webp',
  split: '/hands/shuffle/split.webp',
  riffle: '/hands/shuffle/riffle.webp',
  seal: '/hands/shuffle/seal.webp',
};

export const CUT_HAND_SRC: Record<CutHandFrame, string> = {
  lift: '/hands/cut/lift.webp',
  sidebyside: '/hands/cut/sidebyside.webp',
  press: '/hands/cut/press.webp',
};

export const RECEIVE_HAND_SRC: Record<ReceiveHandFrame, string> = {
  appear: '/hands/receive/appear.webp',
  hold: '/hands/receive/hold.webp',
  withdraw: '/hands/receive/withdraw.webp',
};

/** Hold cycle: idle → split → riffle → split … until release seals. */
export const SHUFFLE_HOLD_CYCLE: readonly ShuffleHandFrame[] = ['idle', 'split', 'riffle'];

export function tableHandMode(input: {
  stage: 'shuffle' | 'cut' | 'deal' | 'reveal' | 'read' | 'enter' | 'question' | 'spread' | 'close';
  shufflePhase?: ShufflePhase;
  reduced: boolean;
}): TableHandMode {
  if (input.reduced) return 'none';
  if (input.stage === 'shuffle') {
    if (input.shufflePhase === 'holding' || input.shufflePhase === 'committing') return 'riffle';
    return 'idle';
  }
  if (input.stage === 'cut') return 'cut';
  return 'none';
}

export function shuffleHandFrame(phase: ShufflePhase, reduced: boolean, holdTick = 0): ShuffleHandFrame | null {
  if (reduced) return null;
  if (phase === 'committing') return 'seal';
  if (phase === 'holding') return SHUFFLE_HOLD_CYCLE[holdTick % SHUFFLE_HOLD_CYCLE.length]!;
  return 'idle';
}

export function cutHandFrame(input: { gathering: boolean; reduced: boolean; dragging?: boolean }): CutHandFrame | null {
  if (input.reduced) return null;
  if (input.gathering) return 'press';
  if (input.dragging) return 'lift';
  return 'sidebyside';
}

export function receiveHandFrame(visual: 'hand-partial' | 'hand-settled' | string | undefined, reduced: boolean): ReceiveHandFrame | null {
  if (reduced) return null;
  if (visual === 'hand-partial') return 'hold';
  if (visual === 'hand-settled') return 'withdraw';
  return null;
}

export function pointerOffset(clientX: number, clientY: number, rect: DOMRect): { x: number; y: number } {
  const x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
  const y = ((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
  return {
    x: Math.max(-1, Math.min(1, x)),
    y: Math.max(-1, Math.min(1, y)),
  };
}

/** Map horizontal pointer on the cut table to cutIndex 1..77. */
export function cutIndexFromPointer(clientX: number, rect: DOMRect): number {
  const t = (clientX - rect.left) / Math.max(rect.width, 1);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.max(1, Math.min(77, Math.round(clamped * 76) + 1));
}
