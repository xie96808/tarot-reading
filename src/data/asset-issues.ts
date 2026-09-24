export type AssetIssueStatus = 'reported' | 'reviewed' | 'resolved';

export type AssetIssue = {
  cardId: string;
  status: AssetIssueStatus;
  note: string;
};

export const ASSET_ISSUES: AssetIssue[] = [
  {
    cardId: 'cups_08',
    status: 'resolved',
    note: '480px face counted 2026-09-24: five cups over three, traditional eight. Lexicon unchanged.',
  },
  {
    cardId: 'cups_09',
    status: 'resolved',
    note: '480px face counted 2026-09-24: nine cups on the shelf. Lexicon unchanged.',
  },
  {
    cardId: 'swords_10',
    status: 'resolved',
    note: '480px face counted 2026-09-24: ten swords. Lexicon unchanged.',
  },
  {
    cardId: 'pents_10',
    status: 'resolved',
    note: '480px face counted 2026-09-24: ten pentacles. Lexicon unchanged.',
  },
  {
    cardId: '01_the_magician',
    status: 'reported',
    note: 'Painted English title includes a trailing period (THE MAGICIAN.). Lexicon nameEn stays without the period.',
  },
  {
    cardId: '03_the_empress',
    status: 'reported',
    note: 'Painted English title includes a trailing period (THE EMPRESS.). Lexicon nameEn stays without the period.',
  },
];
