import { describe, expect, it } from 'vitest';
import { CARD_IDS } from '@/data/card-ids';
import {
  CARDS,
  CARD_LEXICON_LIST,
  getCard,
  LEXICON_VERSION,
  meaningFor,
} from '../index';
import { MODES, THEMES, type CardLexicon } from '../types';

const LOCKED = {
  '00_the_fool': {
    upright:
      '你站在一条尚未命名的路的起点。这张牌不保证安全，它只指出：带着最少的行李出发，往往比带着完整计划观望，更接近你真正要去的地方。',
    reversed:
      '悬崖仍在。你或是把脚收回来，或是闭着眼跳。逆位的愚者要你分清哪一种叫勇敢，哪一种叫把责任推给「反正会有人接住」。',
  },
  cups_08: {
    upright:
      '杯还在，但已经喂不饱你。正位是转身离开那一排仍旧漂亮的杯，去走更暗、更没人保证的路。不是被赶走，是自己发现满了也不够。',
    reversed:
      '你站在该走的路口，却还在清点杯子。逆位谈的是徘徊、对空的恐惧，或把「再忍一忍」误当成忠诚。',
  },
  swords_03: {
    upright:
      '痛是具体的，往往也是可命名的。正位要你让那句话被说出来，而不是在心里反复磨。澄清本身就是这张牌给的药，尽管苦。',
    reversed:
      '伤还在，但被压到日常下面。逆位警告：不出口的剑会向内长。先承认疼，再决定要不要对谁说。',
  },
  pents_queen: {
    upright:
      '王后坐在自己建成的园子里。正位谈把照顾、金钱与身体当成同一件事来打理：稳定来自日常，而不是一次爆发。',
    reversed:
      '园子还在，园丁空了。逆位是为所有人把日子撑住、却不把自己算进预算。先恢复身体节奏，再谈慷慨。',
  },
} as const;

function collectStrings(value: unknown, path: string): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      child === null ? [] : collectStrings(child, `${path}.${key}`),
    );
  }
  return [];
}

describe('zh-1 lexicon', () => {
  it('exports lexicon version zh-1', () => {
    expect(LEXICON_VERSION).toBe('zh-1');
  });

  it('has exactly 78 unique ids matching CARD_IDS', () => {
    const ids = CARD_LEXICON_LIST.map((card) => card.id);
    expect(ids).toHaveLength(78);
    expect(new Set(ids).size).toBe(78);
    expect(Object.keys(CARDS)).toHaveLength(78);
    expect(ids.sort()).toEqual([...CARD_IDS].sort());
  });

  it('gives every entry upright and reversed with keywords, meaning, reflection, theme and mode', () => {
    for (const card of CARD_LEXICON_LIST) {
      for (const side of [card.upright, card.reversed] as const) {
        expect(side.keywords.length).toBeGreaterThanOrEqual(3);
        expect(side.keywords.length).toBeLessThanOrEqual(5);
        expect(side.meaning.trim().length).toBeGreaterThan(0);
        expect(side.reflection).toMatch(/？$/);
        expect(THEMES).toContain(side.theme);
        expect(MODES).toContain(side.mode);
      }
    }
  });

  it('has 22 majors numbered 0–21 with element and astrology', () => {
    const majors = CARD_LEXICON_LIST.filter((card) => card.arcana === 'major');
    expect(majors).toHaveLength(22);
    const numbers = majors.map((card) => card.number).sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(numbers).toEqual(Array.from({ length: 22 }, (_, i) => i));
    for (const card of majors) {
      expect(card.suit).toBeNull();
      expect(card.rank).toBeNull();
      expect(card.element).toMatch(/^(fire|water|air|earth)$/);
      expect(card.astrology).toBeTruthy();
    }
  });

  it('has 56 minors with null number and astrology', () => {
    const minors = CARD_LEXICON_LIST.filter((card) => card.arcana === 'minor');
    expect(minors).toHaveLength(56);
    for (const card of minors) {
      expect(card.number).toBeNull();
      expect(card.astrology).toBeNull();
      expect(card.suit).toMatch(/^(cups|pents|swords|wands)$/);
      expect(card.rank).toBeTruthy();
      expect(card.element).toMatch(/^(fire|water|air|earth)$/);
    }
  });

  it('keeps the four locked appendix meanings verbatim', () => {
    for (const [id, copy] of Object.entries(LOCKED)) {
      const card = getCard(id);
      expect(card.upright.meaning.trim()).toBe(copy.upright);
      expect(card.reversed.meaning.trim()).toBe(copy.reversed);
    }
  });

  it('contains no empty strings', () => {
    for (const card of CARD_LEXICON_LIST) {
      for (const [path, value] of collectStrings(card, card.id)) {
        expect(value.length, path).toBeGreaterThan(0);
      }
    }
  });

  it('resolves getCard and meaningFor', () => {
    const fool = getCard('00_the_fool');
    expect(fool.nameZh).toBe('愚者');
    expect(meaningFor(fool, 'upright')).toBe(fool.upright);
    expect(meaningFor(fool, 'reversed')).toBe(fool.reversed);
    expect(() => getCard('not_a_card')).toThrow(/Unknown card id/);
  });

  it('types every CardLexicon as a complete record entry', () => {
    const sample: CardLexicon = CARDS['00_the_fool'];
    expect(sample.id).toBe('00_the_fool');
  });
});
