import { describe, expect, it } from 'vitest';
import {
  cutHandFrame,
  cutIndexFromPointer,
  pointerOffset,
  receiveHandFrame,
  shuffleHandFrame,
  tableHandMode,
} from '@/lib/table-hands';

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

describe('shuffle and cut hand frames', () => {
  it('cycles idle → split → riffle while holding, then seals on commit', () => {
    expect(shuffleHandFrame('idle', false)).toBe('idle');
    expect(shuffleHandFrame('holding', false, 0)).toBe('idle');
    expect(shuffleHandFrame('holding', false, 1)).toBe('split');
    expect(shuffleHandFrame('holding', false, 2)).toBe('riffle');
    expect(shuffleHandFrame('holding', false, 3)).toBe('idle');
    expect(shuffleHandFrame('committing', false)).toBe('seal');
    expect(shuffleHandFrame('holding', true)).toBeNull();
  });

  it('uses lift while dragging, side-by-side at rest, press while gathering', () => {
    expect(cutHandFrame({ gathering: false, reduced: false })).toBe('sidebyside');
    expect(cutHandFrame({ gathering: false, dragging: true, reduced: false })).toBe('lift');
    expect(cutHandFrame({ gathering: true, reduced: false })).toBe('press');
    expect(cutHandFrame({ gathering: true, reduced: true })).toBeNull();
  });

  it('maps receive palm frames for 过手', () => {
    expect(receiveHandFrame('hand-partial', false)).toBe('hold');
    expect(receiveHandFrame('hand-settled', false)).toBe('withdraw');
    expect(receiveHandFrame('hand-partial', true)).toBeNull();
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

describe('cutIndexFromPointer', () => {
  it('maps left→1 and right→77 across the table', () => {
    const rect = { left: 0, top: 0, width: 100, height: 40 } as DOMRect;
    expect(cutIndexFromPointer(0, rect)).toBe(1);
    expect(cutIndexFromPointer(100, rect)).toBe(77);
    expect(cutIndexFromPointer(50, rect)).toBeGreaterThan(30);
    expect(cutIndexFromPointer(50, rect)).toBeLessThan(50);
  });
});
