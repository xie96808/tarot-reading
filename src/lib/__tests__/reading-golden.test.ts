import { describe, expect, it } from 'vitest';
import { CARDS } from '@/data/lexicons/zh-1';
import { composeReading, whyForRelation, usedCardIds } from '@/lib/reading';
import type { Draw } from '@/lib/shuffle';

const DRAWS: Draw[] = [
  { positionId: 'past', cardId: '00_the_fool', orientation: 'upright' },
  { positionId: 'present', cardId: 'cups_08', orientation: 'upright' },
  { positionId: 'future', cardId: 'pents_queen', orientation: 'reversed' },
];

describe('reading golden fixture (appendix cards)', () => {
  const doc = composeReading('three', DRAWS, CARDS, '');
  const asked = composeReading('three', DRAWS, CARDS, '我在这段关系里忽略了什么？');

  it('uses locked appendix meanings and no cards outside the draw', () => {
    expect(doc.positions.map((p) => p.cardId)).toEqual([
      '00_the_fool',
      'cups_08',
      'pents_queen',
    ]);
    expect(doc.positions[0].meaning).toBe(`在「过去」这个位置上，${CARDS['00_the_fool'].upright.meaning}`);
    expect(doc.positions[1].meaning).toBe(`在「现在」这个位置上，${CARDS.cups_08.upright.meaning}`);
    expect(doc.positions[2].meaning).toBe(`在「未来」这个位置上，${CARDS.pents_queen.reversed.meaning}`);
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
    expect(doc.framing).toBe('这次没有写下问题。下面是按牌位读这组牌，不是对某个具体问题的回答。');
    expect(doc.synthesis).toBe(
      '过去关乎开端，现在关乎放下；先读作需要协调的两种需求，而不是互相抵消。\n现在关乎放下，未来关乎维持；先读作需要协调的两种需求，而不是互相抵消。',
    );
    expect(doc.takeaway).toBe(CARDS.cups_08.upright.reflection);
    expect(whyForRelation(doc.relations[0], doc.positions)).toBe(
      '过去与现在：这两张牌的主题是一对需要协调的张力，所以先并置两种需求，不把它们读成互相抵消。',
    );
    expect(whyForRelation(doc.relations[0], doc.positions)).not.toMatch(/R[1-4]_/);
  });

  it('frames a question without changing the relations or the stock reflection', () => {
    expect(asked.relations).toEqual(doc.relations);
    expect(asked.stats).toEqual(doc.stats);
    expect(asked.framing).toBe(
      '你问的是「我在这段关系里忽略了什么？」。下面不回答这个问题，只把这组牌当作看它的一副镜片：牌义来自词库，不根据问题改写。',
    );
    expect(asked.takeaway).toBe(
      `若把「我在这段关系里忽略了什么？」放在「现在」这个位置上看，圣杯八（正位）留给你的仍是词库里的这句自问。「${CARDS.cups_08.upright.reflection}」牌没有根据问题改写这句，也没有替你作答。`,
    );
  });
});
