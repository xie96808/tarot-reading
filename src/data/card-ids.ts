export const MAJOR_IDS = [
  '00_the_fool',
  '01_the_magician',
  '02_the_high_priestess',
  '03_the_empress',
  '04_the_emperor',
  '05_the_hierophant',
  '06_the_lovers',
  '07_the_chariot',
  '08_strength',
  '09_the_hermit',
  '10_wheel_of_fortune',
  '11_justice',
  '12_the_hanged_man',
  '13_death',
  '14_temperance',
  '15_the_devil',
  '16_the_tower',
  '17_the_star',
  '18_the_moon',
  '19_the_sun',
  '20_judgement',
  '21_the_world',
] as const;

export const SUITS = ['cups', 'pents', 'swords', 'wands'] as const;
export const RANKS = [
  '01_ace',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  'page',
  'knight',
  'queen',
  'king',
] as const;

export const MINOR_IDS = SUITS.flatMap((suit) =>
  RANKS.map((rank) => `${suit}_${rank}` as const),
);

export const CARD_IDS = [...MAJOR_IDS, ...MINOR_IDS] as const;

export type CardId = (typeof CARD_IDS)[number];
export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export const CARD_ID_SET: ReadonlySet<string> = new Set(CARD_IDS);

export function isCardId(value: string): value is CardId {
  return CARD_ID_SET.has(value);
}

export function assertCardId(value: string): CardId {
  if (!isCardId(value)) {
    throw new Error(`Unknown CardId: ${value}`);
  }
  return value;
}

export function zipFilenameFor(cardId: CardId): string {
  return `${cardId}.jpg`;
}
