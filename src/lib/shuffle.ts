import { CARD_IDS, type CardId } from '@/data/card-ids';
import { ALGO_ID, DECK_VERSION } from '@/config/site';
import { uniformInt, type Uint32Source } from '@/lib/rng';

export type Orientation = 'upright' | 'reversed';
export type ShuffledCard = { cardId: CardId; orientation: Orientation };
export type Draw = ShuffledCard & { positionId: string };

export async function fisherYates<T>(items: readonly T[], rng: Uint32Source): Promise<T[]> {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = await uniformInt(rng, i + 1);
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

export async function shuffleDeck(
  rng: Uint32Source,
  reversals: boolean,
): Promise<ShuffledCard[]> {
  const order = await fisherYates(CARD_IDS, rng);
  const cards: ShuffledCard[] = [];
  for (const cardId of order) {
    const orientation: Orientation = reversals
      ? (await uniformInt(rng, 2)) === 0
        ? 'upright'
        : 'reversed'
      : 'upright';
    cards.push({ cardId, orientation });
  }
  return cards;
}

export function cutDeck(preCut: ShuffledCard[], cutIndex: number): ShuffledCard[] {
  if (!Number.isInteger(cutIndex) || cutIndex < 1 || cutIndex > 77) {
    throw new RangeError('cutIndex must be an integer in 1..77');
  }
  return preCut.slice(cutIndex).concat(preCut.slice(0, cutIndex));
}

export function drawTop(deck: ShuffledCard[], positionIds: readonly string[]): Draw[] {
  if (deck.length < positionIds.length) throw new RangeError('deck too small');
  const seen = new Set<CardId>();
  return positionIds.map((positionId, index) => {
    const card = deck[index];
    if (seen.has(card.cardId)) throw new Error('duplicate card in draw');
    seen.add(card.cardId);
    return { ...card, positionId };
  });
}

export function canonicalFingerprintBytes(cards: ShuffledCard[]): string {
  return JSON.stringify({
    algo: ALGO_ID,
    deckVersion: DECK_VERSION,
    cards: cards.map((card) => ({
      id: card.cardId,
      o: card.orientation === 'upright' ? 'u' : 'r',
    })),
  });
}

export async function fingerprint(cards: ShuffledCard[]): Promise<{ full: string; short: string }> {
  if (cards.length !== 78) throw new RangeError('fingerprint requires 78 cards');
  const bytes = new TextEncoder().encode(canonicalFingerprintBytes(cards));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const full = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { full, short: full.slice(0, 16) };
}

export function assertUniqueDeck(cards: ShuffledCard[]): void {
  if (cards.length !== 78) throw new Error('deck must have 78 cards');
  const ids = cards.map((c) => c.cardId);
  if (new Set(ids).size !== 78) throw new Error('deck has duplicate card ids');
}
