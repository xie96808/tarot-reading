import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CARD_IDS } from '@/data/card-ids';
import { createHkdfRng, uniformInt } from '@/lib/rng';
import {
  assertUniqueDeck,
  canonicalFingerprintBytes,
  cutDeck,
  drawTop,
  fingerprint,
  shuffleDeck,
} from '@/lib/shuffle';

describe('shuffle and cut', () => {
  it('matches the design-contract reference vector', async () => {
    const rng = await createHkdfRng(new Uint8Array(32), new Uint8Array(), 'shuffle');
    const cards = await shuffleDeck(rng, true);
    assertUniqueDeck(cards);
    expect(new Set(cards.map((c) => c.cardId)).size).toBe(78);
    const hash = createHash('sha256').update(canonicalFingerprintBytes(cards)).digest('hex');
    expect(hash).toBe('0ac93c7f14a812cad31bc63e8cb06ac56d6a075567954e79f499907ea9f0190f');
    const fp = await fingerprint(cards);
    expect(fp.full).toBe(hash);
    expect(fp.short).toBe(hash.slice(0, 16));
  });

  it('does not mutate CARD_IDS', async () => {
    const snapshot = [...CARD_IDS];
    const rng = await createHkdfRng(new Uint8Array(32), new Uint8Array(), 'shuffle');
    await shuffleDeck(rng, false);
    expect(CARD_IDS).toEqual(snapshot);
  });

  it('forces upright when reversals are off', async () => {
    const rng = await createHkdfRng(new Uint8Array(32), new Uint8Array(), 'shuffle');
    const cards = await shuffleDeck(rng, false);
    expect(cards.every((c) => c.orientation === 'upright')).toBe(true);
  });

  it('rotates at 1, 23, 39, 77 and rejects illegal cuts', async () => {
    const rng = await createHkdfRng(new Uint8Array(32), new Uint8Array(), 'shuffle');
    const cards = await shuffleDeck(rng, true);
    for (const cut of [1, 23, 39, 77]) {
      const deck = cutDeck(cards, cut);
      expect(deck[0]).toEqual(cards[cut]);
      expect(new Set(deck.map((c) => c.cardId)).size).toBe(78);
    }
    expect(() => cutDeck(cards, 0)).toThrow(RangeError);
    expect(() => cutDeck(cards, 78)).toThrow(RangeError);
    expect(() => cutDeck(cards, 1.5)).toThrow(RangeError);
  });

  it('draws unique cards into spread positions', async () => {
    const rng = await createHkdfRng(new Uint8Array(32), new Uint8Array(), 'shuffle');
    const cards = await shuffleDeck(rng, true);
    const deck = cutDeck(cards, 23);
    const draws = drawTop(deck, ['past', 'present', 'future']);
    expect(draws.map((d) => d.positionId)).toEqual(['past', 'present', 'future']);
    expect(new Set(draws.map((d) => d.cardId)).size).toBe(3);
    expect(draws[0].cardId).toBe(deck[0].cardId);
  });
});

describe('auto cut range', () => {
  it('maps uniformInt(77)+1 into 1..77', async () => {
    const rng = {
      async nextUint32() {
        return 76;
      },
    };
    const cut = 1 + (await uniformInt(rng, 77));
    expect(cut).toBe(77);
  });
});
