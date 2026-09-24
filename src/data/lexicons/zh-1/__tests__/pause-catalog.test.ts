import { describe, expect, it } from 'vitest';
import { MAJOR_IDS } from '@/data/card-ids';
import { CARDS } from '@/data/lexicons/zh-1';
import { DOOR_MAJOR_OFFERS } from '../pauses/door-majors';
import type { PauseOffer } from '../pauses/types';
import { validateDoorOffers } from '../pauses/validate';

function primaryPrompt(offer: PauseOffer): string {
  return offer.pauseIndex === 1 ? offer.promptZh : offer.promptAfterActionZh;
}

describe('door major pause catalog', () => {
  it('returns no skeleton failures', () => {
    expect(validateDoorOffers(DOOR_MAJOR_OFFERS)).toEqual([]);
  });

  it('covers every major, both orientations, and both pauses', () => {
    expect(DOOR_MAJOR_OFFERS).toHaveLength(88);
    expect(DOOR_MAJOR_OFFERS.every((offer) => offer.sceneId === 'door')).toBe(true);
    const expected = MAJOR_IDS.flatMap((cardId) =>
      (['upright', 'reversed'] as const).flatMap((orientation) =>
        ([1, 2] as const).map((pauseIndex) => `${cardId}|${orientation}|${pauseIndex}`),
      ),
    );
    const actual = DOOR_MAJOR_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    expect(actual).toHaveLength(88);
    expect([...actual].sort()).toEqual([...expected].sort());
    const majors = new Set<string>(MAJOR_IDS);
    expect(DOOR_MAJOR_OFFERS.every((offer) => majors.has(offer.cardId))).toBe(true);
  });

  it('does not repeat one prompt across the majors', () => {
    const promptStrings = DOOR_MAJOR_OFFERS.map(primaryPrompt);
    expect(promptStrings).toHaveLength(88);
    expect(new Set(promptStrings).size).toBeGreaterThan(1);
    expect(new Set(promptStrings).size).toBe(88);

    const uprightPause1 = DOOR_MAJOR_OFFERS.filter(
      (offer) => offer.orientation === 'upright' && offer.pauseIndex === 1,
    ).map(primaryPrompt);
    expect(uprightPause1).toHaveLength(22);
    expect(new Set(uprightPause1).size).toBe(22);
  });

  it('rejects a door offer that breaks the skeleton', () => {
    const pause1Sample = DOOR_MAJOR_OFFERS.find((offer) => offer.pauseIndex === 1);
    const pause2Sample = DOOR_MAJOR_OFFERS.find((offer) => offer.pauseIndex === 2);
    if (!pause1Sample || pause1Sample.pauseIndex !== 1 || !pause2Sample || pause2Sample.pauseIndex !== 2) {
      throw new Error('catalog missing sample offers');
    }
    const entry = CARDS[pause1Sample.cardId][pause1Sample.orientation];
    const continued: PauseOffer = {
      ...pause1Sample,
      promptZh: `${pause1Sample.promptZh.slice(0, -1)}，沿着刚才那一步？`,
    };
    const copied: PauseOffer = {
      ...pause1Sample,
      actions: [
        pause1Sample.actions[0],
        pause1Sample.actions[1],
        { ...pause1Sample.actions[2], sentenceZh: entry.meaning },
      ],
    };
    const wrongLeave: PauseOffer = {
      ...pause1Sample,
      actions: [
        pause1Sample.actions[0],
        pause1Sample.actions[1],
        { ...pause1Sample.actions[2], labelZh: '放回桌上' },
      ],
    };
    const bracket: PauseOffer = {
      ...pause1Sample,
      actions: [
        { ...pause1Sample.actions[0], labelZh: '先看「这一步」' },
        pause1Sample.actions[1],
        pause1Sample.actions[2],
      ],
    };
    const skipped: PauseOffer = {
      ...pause2Sample,
      promptAfterSkipZh: pause2Sample.promptAfterActionZh,
    };
    expect(validateDoorOffers([continued]).length).toBeGreaterThan(0);
    expect(validateDoorOffers([copied]).length).toBeGreaterThan(0);
    expect(validateDoorOffers([wrongLeave]).length).toBeGreaterThan(0);
    expect(validateDoorOffers([bracket]).length).toBeGreaterThan(0);
    expect(validateDoorOffers([skipped]).length).toBeGreaterThan(0);
    expect(validateDoorOffers([continued]).some((failure) => failure.includes('沿着刚才那一步'))).toBe(
      true,
    );
    expect(validateDoorOffers([skipped]).some((failure) => failure.includes('沿着刚才那一步'))).toBe(
      true,
    );
  });
});
