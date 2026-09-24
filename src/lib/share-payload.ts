import type { ReadingPayloadV1 } from '@/lib/reading-codec';
import type { ReadingReceipt } from '@/lib/ritual-machine';

export function toSharePayload(receipt: ReadingReceipt, includeQuestion: boolean): ReadingPayloadV1 {
  const question = includeQuestion ? receipt.question.trim() : '';
  return {
    v: 1,
    deckVersion: 'rws-1',
    lexiconVersion: 'zh-1',
    algo: 'fy-hkdf-2',
    spreadId: receipt.spreadId,
    q: question ? question : null,
    reversals: receipt.reversals,
    cutIndex: receipt.cutIndex,
    commit: receipt.commitShort,
    draws: receipt.draws,
    ts: Math.floor(receipt.completedAt / 1000),
  };
}
