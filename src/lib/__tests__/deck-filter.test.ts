import { describe, expect, it } from 'vitest';
import { CARD_LEXICON_LIST } from '@/data/lexicons/zh-1';
import { DECK_FILTERS, filterDeck, searchDeck } from '@/lib/deck-filter';

describe('deck catalog filters', () => {
  it('keeps 78, 22 majors, and 14 of each suit', () => {
    expect(filterDeck(CARD_LEXICON_LIST, 'all')).toHaveLength(78);
    expect(filterDeck(CARD_LEXICON_LIST, 'major')).toHaveLength(22);
    expect(filterDeck(CARD_LEXICON_LIST, 'cups')).toHaveLength(14);
    expect(filterDeck(CARD_LEXICON_LIST, 'pents')).toHaveLength(14);
    expect(filterDeck(CARD_LEXICON_LIST, 'swords')).toHaveLength(14);
    expect(filterDeck(CARD_LEXICON_LIST, 'wands')).toHaveLength(14);
    expect(DECK_FILTERS.map((item) => item.id)).toEqual([
      'all',
      'major',
      'cups',
      'pents',
      'swords',
      'wands',
    ]);
  });

  it('filters by Chinese name, English name, or id', () => {
    const fools = searchDeck(CARD_LEXICON_LIST, '愚者');
    expect(fools.some((card) => card.id === '00_the_fool')).toBe(true);
    const byEn = searchDeck(CARD_LEXICON_LIST, 'fool');
    expect(byEn.some((card) => card.id === '00_the_fool')).toBe(true);
    expect(searchDeck(CARD_LEXICON_LIST, '  ')).toHaveLength(78);
  });

});
