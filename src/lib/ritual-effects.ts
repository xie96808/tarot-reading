import { packSamples, createProductionRng, uniformInt, type PointerSample } from '@/lib/rng';
import { fingerprint, shuffleDeck } from '@/lib/shuffle';

export function newOperationId(): string {
  return globalThis.crypto.randomUUID();
}

export async function commitShuffle(
  samples: PointerSample[],
  reversals: boolean,
) {
  const rng = await createProductionRng(packSamples(samples), 'shuffle');
  const deckPreCut = await shuffleDeck(rng, reversals);
  const commit = await fingerprint(deckPreCut);
  return { deckPreCut, commitFull: commit.full, commitShort: commit.short };
}

export async function randomCutIndex(): Promise<number> {
  const rng = await createProductionRng(new Uint8Array(), 'cut');
  return 1 + (await uniformInt(rng, 77));
}
