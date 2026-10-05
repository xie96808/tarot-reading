import { describe, expect, it } from 'vitest';
import { faceUpRevealCount } from '@/lib/face-up-count';

describe('faceUpRevealCount', () => {
  it('counts sealed reveals', () => {
    expect(
      faceUpRevealCount({ stage: 'reveal', revealed: ['past'], pause: null }),
    ).toBe(1);
  });

  it('counts 过手/推门 pause card while face is in palm (not yet sealed)', () => {
    expect(
      faceUpRevealCount({
        stage: 'reveal',
        revealed: [],
        pause: { positionId: 'past' },
      }),
    ).toBe(1);
    expect(
      faceUpRevealCount({
        stage: 'reveal',
        revealed: ['past'],
        pause: { positionId: 'present' },
      }),
    ).toBe(2);
  });

  it('counts any non-back scene visual (hand-partial / door-partial)', () => {
    expect(
      faceUpRevealCount(
        { stage: 'reveal', revealed: [], pause: null },
        { past: 'hand-partial', present: 'back', future: 'back' },
      ),
    ).toBe(1);
    expect(
      faceUpRevealCount(
        { stage: 'reveal', revealed: [], pause: { positionId: 'past' } },
        { past: 'hand-partial', present: 'back', future: 'back' },
      ),
    ).toBe(1);
  });

  it('ignores non-reveal stages', () => {
    expect(faceUpRevealCount({ stage: 'deal', revealed: ['past'], pause: null })).toBe(0);
  });
});
