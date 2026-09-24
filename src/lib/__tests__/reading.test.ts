import { describe, expect, it } from 'vitest';
import type { CardLexicon } from '@/data/lexicons/zh-1/types';
import { CARD_IDS } from '@/data/card-ids';
import { CARDS } from '@/data/lexicons/zh-1';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { composeReading, readingGroups, relationForEdge } from '@/lib/reading';
import type { Draw } from '@/lib/shuffle';

function card(partial: Partial<CardLexicon> & Pick<CardLexicon, 'id' | 'nameZh'>): CardLexicon {
  const meaning = {
    keywords: ['甲', '乙', '丙'] as [string, string, string],
    meaning: '占位正文。',
    reflection: '我真正想靠近的是什么？',
    theme: 'begin' as const,
    mode: 'flow' as const,
  };
  return {
    nameEn: partial.nameZh,
    arcana: 'major',
    number: 0,
    suit: null,
    rank: null,
    element: 'air',
    astrology: 'uranus',
    upright: meaning,
    reversed: { ...meaning, theme: 'release', mode: 'blocked' },
    ...partial,
  };
}

describe('relation rules', () => {
  it('hits R1 then R2 then R3 then R4 in order, one rule per edge', () => {
    const a = card({
      id: '00_the_fool',
      nameZh: '愚者',
      upright: {
        keywords: ['开端', '轻装', '信任'],
        meaning: 'm',
        reflection: 'q？',
        theme: 'begin',
        mode: 'flow',
      },
    });
    const b = card({
      id: 'cups_08',
      nameZh: '圣杯八',
      upright: {
        keywords: ['离开', '放下', '转向'],
        meaning: 'm',
        reflection: 'q？',
        theme: 'begin',
        mode: 'flow',
      },
    });
    const left = {
      positionId: 'past',
      positionNameZh: '过去',
      frameZh: '',
      cardId: a.id,
      nameZh: a.nameZh,
      orientation: 'upright' as const,
      keywords: a.upright.keywords,
      meaning: 'm',
      reflection: 'q？',
    };
    const same = { ...left, positionId: 'present', positionNameZh: '现在', cardId: b.id, nameZh: b.nameZh };
    const r1 = relationForEdge('three', left, same, { [a.id]: a, [b.id]: b });
    expect(r1.ruleId).toBe('R1_REPEAT');

    const tension = card({
      id: 'pents_queen',
      nameZh: '星币王后',
      upright: {
        keywords: ['滋养', '家园', '稳定'],
        meaning: 'm',
        reflection: 'q？',
        theme: 'release',
        mode: 'flow',
      },
    });
    const r2 = relationForEdge(
      'three',
      left,
      { ...same, cardId: tension.id, nameZh: tension.nameZh },
      { [a.id]: a, [tension.id]: tension },
    );
    expect(r2.ruleId).toBe('R2_TENSION');
    expect(r2.text).toContain('过去');
    expect(r2.text).toContain('现在');
    expect(r2.text).not.toContain('一端');
  });

  it('does not invent cards outside the draw and skips stats for single', () => {
    const focus = card({ id: '00_the_fool', nameZh: '愚者' });
    const draws: Draw[] = [{ positionId: 'focus', cardId: '00_the_fool', orientation: 'upright' }];
    const doc = composeReading('single', draws, { [focus.id]: focus }, '');
    expect(doc.relations).toHaveLength(0);
    expect(doc.stats).toHaveLength(0);
    expect(doc.positions).toHaveLength(1);
    expect(doc.synthesis).toContain('愚者');
    expect(doc.synthesis).toContain('愚者');
    expect(doc.synthesis).not.toContain('圣杯');
  });

  it('keeps at most two stat lines and names the cards', () => {
    const crowded = composeReading(
      'three',
      [
        { positionId: 'past', cardId: '00_the_fool', orientation: 'reversed' },
        { positionId: 'present', cardId: '01_the_magician', orientation: 'reversed' },
        { positionId: 'future', cardId: 'cups_01_ace', orientation: 'upright' },
      ],
      CARDS,
      '',
    );
    expect(crowded.stats.map((stat) => stat.kind)).toEqual(['reversed', 'majors']);
    expect(crowded.stats[0].text).toContain('2 张逆位');
    expect(crowded.stats[0].text).toContain('愚者');
    expect(crowded.stats[1].text).toContain('2 张大阿尔卡纳');
    const elemental = composeReading(
      'three',
      [
        { positionId: 'past', cardId: 'cups_01_ace', orientation: 'upright' },
        { positionId: 'present', cardId: 'cups_02', orientation: 'upright' },
        { positionId: 'future', cardId: 'cups_03', orientation: 'upright' },
      ],
      CARDS,
      '',
    );
    expect(elemental.stats).toHaveLength(1);
    expect(elemental.stats[0].kind).toBe('element');
    expect(elemental.stats[0].text).toContain('3 张：');
  });

  it('splits celtic relations into disjoint groups and prints each sentence once', () => {
    const draws = SPREADS.celtic.positions.map((position, index) => ({
      positionId: position.id,
      cardId: CARD_IDS[index],
      orientation: 'upright' as const,
    }));
    const doc = composeReading('celtic', draws, CARDS, '');
    const groups = readingGroups(doc);
    expect(groups).toHaveLength(4);
    const edges = groups!.flatMap((group) => group.relations.map((rel) => rel.edgeId));
    expect(new Set(edges).size).toBe(edges.length);
    expect(groups!.find((group) => group.id === 'close')?.positions.map((position) => position.positionId)).toEqual([
      'hopes_fears',
      'outcome',
    ]);
    for (const rel of doc.relations) {
      expect(doc.synthesis.split(rel.text).length - 1).toBe(1);
    }
    expect(doc.takeaway).toBe(doc.positions.find((position) => position.positionId === 'self')?.reflection);
  });
});
