import { isCardId } from '@/data/card-ids';
import { CARDS } from '@/data/lexicons/zh-1';
import { encodeReading } from '@/lib/reading-codec';
import type { HistoryEntry } from '@/lib/storage';
import type { Draw } from '@/lib/shuffle';

export function buildHistoryHref(entry: HistoryEntry, options: { includeQuestion: boolean }): string {
  const q = options.includeQuestion ? entry.question?.trim() || null : null;
  const id = encodeReading({
    v: 1,
    deckVersion: 'rws-1',
    lexiconVersion: 'zh-1',
    algo: 'fy-hkdf-2',
    spreadId: entry.receipt.spreadId,
    q,
    reversals: entry.receipt.reversals,
    cutIndex: entry.receipt.cutIndex,
    commit: entry.receipt.commitShort,
    draws: entry.receipt.draws,
    ts: Math.floor(entry.receipt.completedAt / 1000),
  });
  return `/r/${id}`;
}

export function formatHistoryWhen(ms: number): string {
  if (!Number.isFinite(ms)) return '时间未知';
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatHistoryCards(draws: Draw[]): string {
  return draws
    .flatMap((draw) => {
      if (!isCardId(draw.cardId)) return [];
      const card = CARDS[draw.cardId];
      const orient = draw.orientation === 'reversed' ? '（逆位）' : '';
      return [`${card.nameZh}${orient}`];
    })
    .join('、');
}

export function historyHasQuestion(entry: HistoryEntry): boolean {
  return Boolean(entry.question?.trim());
}
