import type { CardId } from '@/data/card-ids';

export type Theme =
  | 'begin'
  | 'act'
  | 'pause'
  | 'release'
  | 'connect'
  | 'discern'
  | 'sustain'
  | 'integrate';
export type Mode = 'flow' | 'inward' | 'blocked' | 'excess';
export type Arcana = 'major' | 'minor';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type Suit = 'cups' | 'pents' | 'swords' | 'wands';
export type Rank =
  | '01_ace'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';
export type Astrology =
  | 'uranus'
  | 'mercury'
  | 'moon'
  | 'venus'
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'jupiter'
  | 'libra'
  | 'neptune'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'mars'
  | 'aquarius'
  | 'pisces'
  | 'sun'
  | 'pluto'
  | 'saturn';

export type MeaningEntry = {
  keywords: [string, string, string, ...string[]];
  meaning: string;
  reflection: string;
  theme: Theme;
  mode: Mode;
};

export type CardLexicon = {
  id: CardId;
  nameZh: string;
  nameEn: string;
  arcana: Arcana;
  number: number | null;
  suit: Suit | null;
  rank: Rank | null;
  element: Element;
  astrology: Astrology | null;
  upright: MeaningEntry;
  reversed: MeaningEntry;
};

export const THEMES: Theme[] = [
  'begin',
  'act',
  'pause',
  'release',
  'connect',
  'discern',
  'sustain',
  'integrate',
];
export const MODES: Mode[] = ['flow', 'inward', 'blocked', 'excess'];
