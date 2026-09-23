import { describe, expect, it } from 'vitest';
import type { CardLexicon } from '@/data/lexicons/zh-1/types';
import { composeReading, relationForEdge } from '@/lib/reading';
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
  });

  it('does not invent cards outside the draw and skips stats for single', () => {
    const focus = card({ id: '00_the_fool', nameZh: '愚者' });
    const draws: Draw[] = [{ positionId: 'focus', cardId: '00_the_fool', orientation: 'upright' }];
    const doc = composeReading('single', draws, { [focus.id]: focus });
    expect(doc.relations).toHaveLength(0);
    expect(doc.stats).toHaveLength(0);
    expect(doc.positions).toHaveLength(1);
    expect(doc.synthesis).toContain('愚者');
    expect(doc.synthesis).not.toContain('圣杯');
  });


  it('prefers R4 over R3 when only one side is a charged mode', () => {
    const flow = card({
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
    const blocked = card({
      id: 'cups_08',
      nameZh: '圣杯八',
      upright: {
        keywords: ['离开', '放下', '转向'],
        meaning: 'm',
        reflection: 'q？',
        theme: 'act',
        mode: 'blocked',
      },
    });
    const left = {
      positionId: 'past',
      positionNameZh: '过去',
      frameZh: '',
      cardId: flow.id,
      nameZh: flow.nameZh,
      orientation: 'upright' as const,
      keywords: flow.upright.keywords,
      meaning: 'm',
      reflection: 'q？',
    };
    const right = {
      ...left,
      positionId: 'present',
      positionNameZh: '现在',
      cardId: blocked.id,
      nameZh: blocked.nameZh,
      keywords: blocked.upright.keywords,
    };
    const hit = relationForEdge('three', left, right, { [flow.id]: flow, [blocked.id]: blocked });
    expect(hit.ruleId).toBe('R4_BRIDGE');
  });

  it('weaves position into meaning and softens reverse majority copy', () => {
    const a = card({ id: '00_the_fool', nameZh: '愚者' });
    const b = card({ id: 'cups_08', nameZh: '圣杯八' });
    const c = card({ id: 'pents_queen', nameZh: '星币王后' });
    const draws: Draw[] = [
      { positionId: 'past', cardId: a.id, orientation: 'reversed' },
      { positionId: 'present', cardId: b.id, orientation: 'reversed' },
      { positionId: 'future', cardId: c.id, orientation: 'upright' },
    ];
    const doc = composeReading('three', draws, { [a.id]: a, [b.id]: b, [c.id]: c });
    expect(doc.positions[0].meaning.startsWith('在「过去」这个位置上，')).toBe(true);
    expect(doc.positions[0].frameZh.length).toBeGreaterThan(0);
    const reverseStat = doc.stats.find((s) => s.kind === 'reversed');
    expect(reverseStat?.text).toContain('逆位偏多');
    expect(reverseStat?.text).not.toContain('内在、受阻或过度');
  });

});
