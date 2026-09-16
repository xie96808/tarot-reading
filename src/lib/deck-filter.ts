import type { CardLexicon, Suit } from '@/data/lexicons/zh-1/types';

export type DeckFilter = 'all' | 'major' | Suit;

export const DECK_FILTERS: Array<{ id: DeckFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'major', label: '大阿尔卡纳' },
  { id: 'cups', label: '圣杯' },
  { id: 'pents', label: '星币' },
  { id: 'swords', label: '宝剑' },
  { id: 'wands', label: '权杖' },
];

export function filterDeck(cards: readonly CardLexicon[], filter: DeckFilter): CardLexicon[] {
  if (filter === 'all') return [...cards];
  if (filter === 'major') return cards.filter((card) => card.arcana === 'major');
  return cards.filter((card) => card.suit === filter);
}

export function isDeckFilter(value: string): value is DeckFilter {
  return DECK_FILTERS.some((item) => item.id === value);
}
