import type { ShufflePhase } from '@/lib/ritual-machine';

export type TableHandMode = 'none' | 'idle' | 'riffle' | 'cut';

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

export function pointerOffset(clientX: number, clientY: number, rect: DOMRect): { x: number; y: number } {
  const x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
  const y = ((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
  return {
    x: Math.max(-1, Math.min(1, x)),
    y: Math.max(-1, Math.min(1, y)),
  };
}
