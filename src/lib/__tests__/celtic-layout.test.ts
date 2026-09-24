import { describe, expect, it } from 'vitest';
import { celticSlotLayout, rectsIntersect, type Rect } from '@/lib/celtic-layout';

const CELTIC_IDS = ['present', 'challenge', 'foundation', 'past', 'crown', 'future', 'self', 'environment', 'hopes_fears', 'outcome'];

function slot(layout: ReturnType<typeof celticSlotLayout>, id: string) {
  const found = layout.slots.find((item) => item.positionId === id);
  if (!found) throw new Error(id);
  return found;
}

function gap(above: Rect, below: Rect): number {
  return below.y - (above.y + above.h);
}

function assertClearance(width: number, interactive: boolean) {
  const layout = celticSlotLayout(width, { interactive });
  expect(layout.board.w).toBeLessThanOrEqual(width);
  expect(layout.slots.map((item) => item.positionId).sort()).toEqual([...CELTIC_IDS].sort());
  const present = slot(layout, 'present');
  const challenge = slot(layout, 'challenge');
  expect(rectsIntersect(present.face, challenge.face)).toBe(true);
  for (const item of layout.slots) {
    expect(item.face.x).toBeGreaterThanOrEqual(0);
    expect(item.face.y).toBeGreaterThanOrEqual(0);
    expect(item.face.x + item.face.w).toBeLessThanOrEqual(layout.board.w + 0.01);
    expect(item.face.y + item.face.h).toBeLessThanOrEqual(layout.board.h + 0.01);
    expect(rectsIntersect(item.label, item.face)).toBe(false);
    if (!interactive) expect(item.reveal).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  }
  for (const left of layout.slots) {
    for (const right of layout.slots) {
      if (left.positionId >= right.positionId) continue;
      const crossingPair = new Set([left.positionId, right.positionId]);
      if (crossingPair.has('present') && crossingPair.has('challenge')) continue;
      expect(rectsIntersect(left.face, right.face)).toBe(false);
    }
  }
  const vertical: Array<[string, string]> = [
    ['crown', 'present'],
    ['present', 'foundation'],
    ['outcome', 'hopes_fears'],
    ['hopes_fears', 'environment'],
    ['environment', 'self'],
  ];
  for (const [aboveId, belowId] of vertical) {
    const above = slot(layout, aboveId);
    const below = slot(layout, belowId);
    expect(rectsIntersect(above.label, below.face)).toBe(false);
    if (interactive) {
      expect(rectsIntersect(above.reveal, below.face)).toBe(false);
      expect(gap(above.reveal, below.face)).toBeGreaterThanOrEqual(8);
    }
  }
  expect(rectsIntersect(challenge.face, present.label)).toBe(false);
  expect(rectsIntersect(challenge.face, challenge.label)).toBe(false);
  if (interactive) {
    expect(rectsIntersect(challenge.face, present.reveal)).toBe(false);
    expect(rectsIntersect(challenge.face, challenge.reveal)).toBe(false);
  }
}

describe('celticSlotLayout', () => {
  it('locks the 720 interactive rectangles', () => {
    const layout = celticSlotLayout(720);
    expect(slot(layout, 'present').face).toEqual({ x: 258, y: 254, w: 90, h: 144 });
    expect(slot(layout, 'challenge').face).toEqual({ x: 231, y: 281, w: 144, h: 90 });
    expect(slot(layout, 'crown').label).toEqual({ x: 258, y: 176, w: 90, h: 22 });
    expect(slot(layout, 'outcome').label).toEqual({ x: 505, y: 176, w: 90, h: 22 });
    expect(slot(layout, 'self').reveal).toEqual({ x: 505, y: 892, w: 90, h: 44 });
    expect(layout.board.h).toBe(960);
    const quiet = celticSlotLayout(720, { interactive: false });
    expect(slot(quiet, 'present').face).toEqual(slot(layout, 'present').face);
    expect(slot(quiet, 'crown').label).toEqual(slot(layout, 'crown').label);
    for (const item of quiet.slots) expect(item.reveal).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it('keeps an 8px gap at the desktop widths and on the mobile deal board', () => {
    for (const width of [520, 640, 680, 760]) assertClearance(width, true);
    assertClearance(320, false);
    assertClearance(360, false);
    expect(rectsIntersect({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });
});
