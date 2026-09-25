import { CARD_IDS } from '@/data/card-ids';
import type { SceneId } from '@/lib/scene';
import type { Orientation } from '@/lib/shuffle';
import { DOOR_CUPS_OFFERS } from './door-cups';
import { DOOR_MAJOR_OFFERS } from './door-majors';
import { DOOR_PENTS_OFFERS } from './door-pents';
import { DOOR_SWORDS_OFFERS } from './door-swords';
import { DOOR_WANDS_OFFERS } from './door-wands';
import { PAUSE_EXAMPLES } from './examples';
import type { PauseOffer } from './types';

const DOOR_OFFERS: readonly PauseOffer[] = [
  ...DOOR_MAJOR_OFFERS,
  ...DOOR_CUPS_OFFERS,
  ...DOOR_PENTS_OFFERS,
  ...DOOR_SWORDS_OFFERS,
  ...DOOR_WANDS_OFFERS,
];

export function lookupPauseOffer(
  sceneId: SceneId | null,
  cardId: string,
  orientation: Orientation,
  pauseIndex: 1 | 2,
): PauseOffer | null {
  if (sceneId !== 'door') return null;
  return (
    DOOR_OFFERS.find(
      (offer) =>
        offer.cardId === cardId &&
        offer.orientation === orientation &&
        offer.pauseIndex === pauseIndex,
    ) ?? null
  );
}

function samePauseOffer(left: PauseOffer, right: PauseOffer): boolean {
  if (
    left.sceneId !== right.sceneId ||
    left.cardId !== right.cardId ||
    left.orientation !== right.orientation ||
    left.pauseIndex !== right.pauseIndex
  ) {
    return false;
  }
  if (left.pauseIndex === 1 || right.pauseIndex === 1) {
    if (left.pauseIndex !== 1 || right.pauseIndex !== 1) return false;
    if (left.promptZh !== right.promptZh) return false;
  } else if (
    left.promptAfterActionZh !== right.promptAfterActionZh ||
    left.promptAfterSkipZh !== right.promptAfterSkipZh
  ) {
    return false;
  }
  return left.actions.every((item, index) => {
    const other = right.actions[index];
    return (
      other !== undefined &&
      item.id === other.id &&
      item.kind === other.kind &&
      item.labelZh === other.labelZh &&
      item.sentenceZh === other.sentenceZh
    );
  });
}

export function assertPauseCatalogComplete(sceneId: 'door' | 'hand'): void {
  if (sceneId !== 'door') {
    throw new Error('hand catalog is not part of this check');
  }
  if (DOOR_OFFERS.length !== CARD_IDS.length * 4) {
    throw new Error(`expected ${CARD_IDS.length * 4} door offers, got ${DOOR_OFFERS.length}`);
  }
  const seen = new Set<string>();
  for (const offer of DOOR_OFFERS) {
    if (offer.sceneId !== 'door') throw new Error(`non-door offer ${offer.cardId}`);
    const key = `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`;
    if (seen.has(key)) throw new Error(`duplicate door offer ${key}`);
    seen.add(key);
  }
  for (const cardId of CARD_IDS) {
    for (const orientation of ['upright', 'reversed'] as const) {
      for (const pauseIndex of [1, 2] as const) {
        const key = `${cardId}|${orientation}|${pauseIndex}`;
        if (!seen.has(key)) throw new Error(`missing door offer ${key}`);
      }
    }
  }
  for (const example of PAUSE_EXAMPLES) {
    if (example.sceneId !== 'door') continue;
    const found = lookupPauseOffer('door', example.cardId, example.orientation, example.pauseIndex);
    if (!found || !samePauseOffer(found, example)) {
      throw new Error(
        `door example ${example.cardId} ${example.orientation} pause ${example.pauseIndex} is not in the catalog`,
      );
    }
  }
}
