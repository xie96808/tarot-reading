import { describe, expect, it } from 'vitest';
import { buildHistoryHref } from '@/lib/history-href';
import { decodeReading, encodeReading } from '@/lib/reading-codec';
import type { ReadingReceipt } from '@/lib/ritual-machine';
import { toSharePayload } from '@/lib/share-payload';
import type { HistoryEntry } from '@/lib/storage';

const SECRET = '秘密的一句停留';

function receipt(): ReadingReceipt {
  return {
    sessionId: 'share-pause',
    spreadId: 'three',
    question: '公开的问题',
    reversals: true,
    cutIndex: 23,
    commitShort: 'a3f2c91b0d44e17f',
    draws: [
      { positionId: 'past', cardId: 'cups_01_ace', orientation: 'upright' },
      { positionId: 'present', cardId: 'cups_02', orientation: 'upright' },
      { positionId: 'future', cardId: 'wands_01_ace', orientation: 'upright' },
    ],
    revealedOrder: ['past', 'present', 'future'],
    completedAt: 1_800_000_000_000,
    saved: true,
    savePrivate: true,
    note: SECRET,
    sceneId: 'door',
    pauseAnswers: [
      { index: 1, positionId: 'past', kind: 'action', actionId: 'name', custom: SECRET },
      { index: 2, positionId: 'present', kind: 'skip' },
    ],
    keptPauseIndex: 1,
  };
}

function entry(): HistoryEntry {
  return {
    receipt: receipt(),
    question: '公开的问题',
    note: SECRET,
    savedAt: 1_800_000_000_000,
  };
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

describe('share payloads omit pause text', () => {
  it('keeps the secret sentence out of the encoded reading', () => {
    const encoded = encodeReading(toSharePayload(receipt(), true));
    const decoded = decodeReading(encoded);
    expect(decoded.ok).toBe(true);
    expect(JSON.stringify(decoded)).not.toContain(SECRET);
    if (decoded.ok) expect(decoded.payload.q).toBe('公开的问题');
    const hidden = decodeReading(encodeReading(toSharePayload(receipt(), false)));
    expect(JSON.stringify(hidden)).not.toContain(SECRET);
    if (hidden.ok) expect(hidden.payload.q).toBeNull();
  });

  it('rejects a payload that still carries a pause key', () => {
    const json = JSON.stringify({ ...toSharePayload(receipt(), false), pause: SECRET });
    expect(decodeReading(`1.${toBase64Url(json)}`).ok).toBe(false);
  });

  it('leaves the secret out of the history href', () => {
    const href = buildHistoryHref(entry(), { includeQuestion: true });
    expect(href).not.toContain(SECRET);
    const decoded = decodeReading(href.slice(3));
    expect(JSON.stringify(decoded)).not.toContain(SECRET);
    if (decoded.ok) expect(decoded.payload.q).toBe('公开的问题');
  });
});
