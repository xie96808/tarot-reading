import { describe, expect, it } from 'vitest';
import { decodeReading } from '@/lib/reading-codec';
import { buildHistoryHref, formatHistoryCards, formatHistoryWhen, historyHasQuestion } from '@/lib/history-href';
import type { HistoryEntry } from '@/lib/storage';

function entry(question?: string): HistoryEntry {
  return {
    question,
    note: '',
    savedAt: new Date(2026, 8, 24, 21, 4).getTime(),
    receipt: {
      sessionId: 'history-private',
      spreadId: 'single',
      question: question ?? '',
      reversals: true,
      cutIndex: 1,
      commitShort: 'a'.repeat(16),
      draws: [
        { positionId: 'focus', cardId: '00_the_fool', orientation: 'upright' },
      ],
      revealedOrder: ['focus'],
      completedAt: new Date(2026, 8, 24, 21, 4).getTime(),
      saved: true,
      savePrivate: true,
      note: '',
    },
  };
}

describe('history links', () => {
  it('omits the question unless includeQuestion is set', () => {
    const hidden = buildHistoryHref(entry('不应出现在地址栏'), { includeQuestion: false });
    const shown = buildHistoryHref(entry('  我在这段关系里忽略了什么？  '), { includeQuestion: true });
    expect(decodeReading(hidden.slice(3)).ok && decodeReading(hidden.slice(3)).ok && (decodeReading(hidden.slice(3)) as { ok: true; payload: { q: string | null } }).payload.q).toBeNull();
    const decoded = decodeReading(shown.slice(3));
    expect(decoded.ok && decoded.payload.q).toBe('我在这段关系里忽略了什么？');
  });

  it('formats the local time, card names, and question presence', () => {
    expect(formatHistoryWhen(new Date(2026, 8, 24, 21, 4).getTime())).toBe('2026年9月24日 21:04');
    expect(formatHistoryWhen(Number.NaN)).toBe('时间未知');
    expect(formatHistoryCards([
      { positionId: 'past', cardId: '00_the_fool', orientation: 'upright' },
      { positionId: 'present', cardId: '07_the_chariot', orientation: 'reversed' },
    ])).toBe('愚者、战车（逆位）');
    expect(historyHasQuestion(entry(''))).toBe(false);
    expect(historyHasQuestion(entry('   '))).toBe(false);
    expect(historyHasQuestion(entry('有'))).toBe(true);
    expect(historyHasQuestion({ ...entry(undefined), question: undefined })).toBe(false);
  });
});
