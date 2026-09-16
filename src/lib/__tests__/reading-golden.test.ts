import { describe, expect, it } from 'vitest';
import { CARDS } from '@/data/lexicons/zh-1';
import { composeReading, usedCardIds } from '@/lib/reading';
import type { Draw } from '@/lib/shuffle';

const DRAWS: Draw[] = [
  { positionId: 'past', cardId: '00_the_fool', orientation: 'upright' },
  { positionId: 'present', cardId: 'cups_08', orientation: 'upright' },
  { positionId: 'future', cardId: 'pents_queen', orientation: 'reversed' },
];

describe('reading golden fixture (appendix cards)', () => {
  const doc = composeReading('three', DRAWS, CARDS);

  it('uses locked appendix meanings and no cards outside the draw', () => {
    expect(doc.positions.map((p) => p.cardId)).toEqual([
      '00_the_fool',
      'cups_08',
      'pents_queen',
    ]);
    expect(doc.positions[0].meaning).toBe(CARDS['00_the_fool'].upright.meaning);
    expect(doc.positions[1].meaning).toBe(CARDS.cups_08.upright.meaning);
    expect(doc.positions[2].meaning).toBe(CARDS.pents_queen.reversed.meaning);
    expect(new Set(usedCardIds(doc))).toEqual(
      new Set(['00_the_fool', 'cups_08', 'pents_queen']),
    );
  });

  it('emits one relation per edge with a known rule id', () => {
    expect(doc.relations).toHaveLength(2);
    for (const rel of doc.relations) {
      expect(['R1_REPEAT', 'R2_TENSION', 'R3_TURN', 'R4_BRIDGE']).toContain(rel.ruleId);
      expect(rel.text.length).toBeGreaterThan(8);
    }
    expect(doc.takeaway).toBe(CARDS.cups_08.upright.reflection);
    expect(doc.synthesis.length).toBeGreaterThan(10);
  });
});
