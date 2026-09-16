import { describe, expect, it } from 'vitest';
import { pointerOffset, tableHandMode } from '@/lib/table-hands';

describe('tableHandMode', () => {
  it('shows idle hands waiting, riffle while holding, and cut on the cut stage', () => {
    expect(tableHandMode({ stage: 'shuffle', shufflePhase: 'idle', reduced: false })).toBe('idle');
    expect(tableHandMode({ stage: 'shuffle', shufflePhase: 'holding', reduced: false })).toBe('riffle');
    expect(tableHandMode({ stage: 'shuffle', shufflePhase: 'committing', reduced: false })).toBe('riffle');
    expect(tableHandMode({ stage: 'cut', reduced: false })).toBe('cut');
    expect(tableHandMode({ stage: 'deal', reduced: false })).toBe('none');
  });

  it('hides the photographed hands when motion is reduced', () => {
    expect(tableHandMode({ stage: 'shuffle', shufflePhase: 'holding', reduced: true })).toBe('none');
    expect(tableHandMode({ stage: 'cut', reduced: true })).toBe('none');
  });
});

describe('pointerOffset', () => {
  it('maps the table rect to a clamped -1..1 pair', () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 } as DOMRect;
    expect(pointerOffset(50, 50, rect)).toEqual({ x: 0, y: 0 });
    expect(pointerOffset(100, 0, rect)).toEqual({ x: 1, y: -1 });
    expect(pointerOffset(-20, 200, rect)).toEqual({ x: -1, y: 1 });
  });
});
