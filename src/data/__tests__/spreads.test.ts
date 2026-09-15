import { describe, expect, it } from 'vitest';
import { SPREADS } from '../lexicons/zh-1/spreads';

describe('spreads', () => {
  it('defines single / three / celtic with traditional position counts and no significator', () => {
    expect(SPREADS.single.positions.map((p) => p.id)).toEqual(['focus']);
    expect(SPREADS.three.positions.map((p) => p.id)).toEqual(['past', 'present', 'future']);
    expect(SPREADS.celtic.positions.map((p) => p.id)).toEqual([
      'present',
      'challenge',
      'foundation',
      'past',
      'crown',
      'future',
      'self',
      'environment',
      'hopes_fears',
      'outcome',
    ]);
    expect(SPREADS.celtic.positions).toHaveLength(10);
  });

  it('keeps drawOrder contiguous from 1', () => {
    for (const spread of Object.values(SPREADS)) {
      expect(spread.positions.map((p) => p.drawOrder)).toEqual(
        spread.positions.map((_, i) => i + 1),
      );
    }
  });
});
