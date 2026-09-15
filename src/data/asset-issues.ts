export type AssetIssueStatus = 'reported' | 'reviewed' | 'resolved';

export type AssetIssue = {
  cardId: string;
  status: AssetIssueStatus;
  note: string;
};

export const ASSET_ISSUES: AssetIssue[] = [
  {
    cardId: 'cups_08',
    status: 'reported',
    note: 'zip README: stack 6+3 not 5+3. Lexicon still uses traditional Eight of Cups (leaving).',
  },
  {
    cardId: 'cups_09',
    status: 'reported',
    note: 'zip README: often 8 cups. Lexicon uses traditional Nine of Cups.',
  },
  {
    cardId: 'swords_10',
    status: 'reported',
    note: 'zip README: often 9 swords. Lexicon uses traditional Ten of Swords.',
  },
  {
    cardId: 'pents_10',
    status: 'reported',
    note: 'zip README: often 9 pentacles. Lexicon uses traditional Ten of Pentacles.',
  },
];
