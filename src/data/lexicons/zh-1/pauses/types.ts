import type { CardId } from '@/data/card-ids';
import type { SceneId } from '@/lib/scene';
import type { Orientation } from '@/lib/shuffle';

export type PauseActionKind = 'engage' | 'leave';

export type PauseAction = {
  id: string;
  kind: PauseActionKind;
  labelZh: string;
  sentenceZh: string;
};

type PauseOfferBase = {
  sceneId: SceneId;
  cardId: CardId;
  orientation: Orientation;
  actions: readonly [PauseAction, PauseAction, PauseAction];
};

export type PauseOffer =
  | (PauseOfferBase & {
      pauseIndex: 1;
      promptZh: string;
    })
  | (PauseOfferBase & {
      pauseIndex: 2;
      promptAfterActionZh: string;
      promptAfterSkipZh: string;
    });
