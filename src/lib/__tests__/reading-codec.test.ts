import { describe, expect, it } from 'vitest';
import { CARD_IDS } from '@/data/card-ids';
import { decodeReading, encodeReading, type ReadingPayloadV1 } from '@/lib/reading-codec';

const longest = [...CARD_IDS].sort((a, b) => b.length - a.length);

function payload(partial: Partial<ReadingPayloadV1> = {}): ReadingPayloadV1 {
  return {
    v: 1,
    deckVersion: 'rws-1',
    lexiconVersion: 'zh-1',
    algo: 'fy-hkdf-2',
    spreadId: 'three',
    q: null,
    reversals: true,
    cutIndex: 23,
    commit: 'a3f2c91b0d44e17f',
    draws: [
      { positionId: 'past', cardId: longest[0], orientation: 'reversed' },
      { positionId: 'present', cardId: longest[1], orientation: 'upright' },
      { positionId: 'future', cardId: longest[2], orientation: 'reversed' },
    ],
    ts: 1_800_000_000,
    ...partial,
  };
}

describe('reading codec', () => {
  it('round-trips single, three and celtic without a question', () => {
    const single = payload({
      spreadId: 'single',
      draws: [{ positionId: 'focus', cardId: longest[0], orientation: 'upright' }],
    });
    const celticDraws = [
      'present',
      'challenge',
      'foundation',
      'past',
      'crown',
      'future',
      'self',
      'environment',
      'hopes_fears',
      'outcome',
    ].map((positionId, i) => ({
      positionId,
      cardId: longest[i],
      orientation: 'reversed' as const,
    }));
    for (const item of [single, payload(), payload({ spreadId: 'celtic', draws: celticDraws, cutIndex: 77 })]) {
      const id = encodeReading(item);
      expect(id.length).toBeLessThanOrEqual(1500);
      const decoded = decodeReading(id);
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.payload).toEqual(item);
    }
  });

  it('rejects oversized questions instead of silently trimming', () => {
    expect(() => encodeReading(payload({ q: '问'.repeat(201) }))).toThrow('QUESTION_TOO_LONG');
    const celticDraws = payload({ spreadId: 'celtic' });
    const draws = [
      'present',
      'challenge',
      'foundation',
      'past',
      'crown',
      'future',
      'self',
      'environment',
      'hopes_fears',
      'outcome',
    ].map((positionId, i) => ({
      positionId,
      cardId: longest[i],
      orientation: 'reversed' as const,
    }));
    expect(() =>
      encodeReading({ ...celticDraws, spreadId: 'celtic', draws, q: '问'.repeat(200), cutIndex: 77 }),
    ).toThrow('READING_ID_TOO_LONG');
  });

  it('rejects extra fields, unknown versions and duplicate cards', () => {
    const ok = encodeReading(payload());
    expect(decodeReading(ok.replace('1.', '2.')).ok).toBe(false);
    const json = Buffer.from(ok.slice(2), 'base64url').toString('utf8');
    const obj = JSON.parse(json);
    obj.extra = true;
    const extra = `1.${Buffer.from(JSON.stringify(obj)).toString('base64url')}`;
    expect(decodeReading(extra).ok).toBe(false);
    obj.extra = undefined;
    delete obj.extra;
    obj.draws[1].cardId = obj.draws[0].cardId;
    const dup = `1.${Buffer.from(JSON.stringify(obj)).toString('base64url')}`;
    expect(decodeReading(dup).ok).toBe(false);
  });
});
