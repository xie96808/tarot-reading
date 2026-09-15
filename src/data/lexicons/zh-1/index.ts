import { CARD_IDS, type CardId } from '@/data/card-ids';
import { CUPS } from './cups';
import { MAJORS } from './majors';
import { PENTS } from './pents';
import { SWORDS } from './swords';
import type { CardLexicon, MeaningEntry } from './types';
import { WANDS } from './wands';

export const LEXICON_VERSION = 'zh-1' as const;

export const CARD_LEXICON_LIST: readonly CardLexicon[] = [
  ...MAJORS,
  ...CUPS,
  ...PENTS,
  ...SWORDS,
  ...WANDS,
];

export const CARDS = Object.fromEntries(
  CARD_LEXICON_LIST.map((card) => [card.id, card]),
) as { readonly [K in CardId]: CardLexicon };

export function getCard(id: string): CardLexicon {
  const card = CARDS[id as CardId];
  if (!card || card.id !== id) {
    throw new Error(`Unknown card id: ${id}`);
  }
  return card;
}

export function meaningFor(
  card: CardLexicon,
  orientation: 'upright' | 'reversed',
): MeaningEntry {
  return card[orientation];
}

export function assertLexiconComplete(): void {
  if (CARD_LEXICON_LIST.length !== 78) {
    throw new Error(`lexicon size ${CARD_LEXICON_LIST.length}`);
  }
  for (const id of CARD_IDS) {
    if (!CARDS[id]) throw new Error(`missing lexicon ${id}`);
  }
}

export type {
  Arcana,
  Astrology,
  CardLexicon,
  Element,
  MeaningEntry,
  Mode,
  Rank,
  Suit,
  Theme,
} from './types';
