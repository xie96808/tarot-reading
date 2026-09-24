import { describe, expect, it } from 'vitest';
import { MAJOR_IDS, MINOR_IDS } from '@/data/card-ids';
import { CARDS } from '@/data/lexicons/zh-1';
import { assertPauseCatalogComplete } from '../pauses';
import { DOOR_CUPS_OFFERS } from '../pauses/door-cups';
import { DOOR_MAJOR_OFFERS } from '../pauses/door-majors';
import { DOOR_PENTS_OFFERS } from '../pauses/door-pents';
import { DOOR_SWORDS_OFFERS } from '../pauses/door-swords';
import { DOOR_WANDS_OFFERS } from '../pauses/door-wands';
import { HAND_CUPS_OFFERS } from '../pauses/hand-cups';
import { HAND_MAJOR_OFFERS } from '../pauses/hand-majors';
import { lookupPauseOffer } from '../pauses/examples';
import type { PauseOffer } from '../pauses/types';
import { validateDoorOffers } from '../pauses/validate';

const CUP_IDS = MINOR_IDS.filter((id) => id.startsWith('cups_'));
const PENT_IDS = MINOR_IDS.filter((id) => id.startsWith('pents_'));
const SWORD_IDS = MINOR_IDS.filter((id) => id.startsWith('swords_'));
const WAND_IDS = MINOR_IDS.filter((id) => id.startsWith('wands_'));
const CUP_NUMBER_IDS = new Set(
  (['01_ace', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const).map((rank) => `cups_${rank}`),
);
const CRAFT_WORDS = ['特长', '你擅长', '哪一种手艺', '手艺'] as const;

function offerBlob(offer: PauseOffer): string {
  const prompts =
    offer.pauseIndex === 1
      ? [offer.promptZh]
      : [offer.promptAfterActionZh, offer.promptAfterSkipZh];
  return [...prompts, ...offer.actions.flatMap((item) => [item.labelZh, item.sentenceZh])].join('\n');
}

function coverKeys(ids: readonly string[]): string[] {
  return ids.flatMap((cardId) =>
    (['upright', 'reversed'] as const).flatMap((orientation) =>
      ([1, 2] as const).map((pauseIndex) => `${cardId}|${orientation}|${pauseIndex}`),
    ),
  );
}

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

describe('door cups and pents pause catalog', () => {
  it('returns no skeleton failures', () => {
    expect(validateDoorOffers(DOOR_CUPS_OFFERS)).toEqual([]);
    expect(validateDoorOffers(DOOR_PENTS_OFFERS)).toEqual([]);
  });

  it('covers every cup and every pent, both orientations, and both pauses', () => {
    expect(DOOR_MAJOR_OFFERS).toHaveLength(88);
    expect(DOOR_CUPS_OFFERS).toHaveLength(56);
    expect(DOOR_PENTS_OFFERS).toHaveLength(56);
    expect(DOOR_CUPS_OFFERS.every((offer) => offer.sceneId === 'door')).toBe(true);
    expect(DOOR_PENTS_OFFERS.every((offer) => offer.sceneId === 'door')).toBe(true);
    const cupKeys = DOOR_CUPS_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    const pentKeys = DOOR_PENTS_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    expect([...cupKeys].sort()).toEqual([...coverKeys(CUP_IDS)].sort());
    expect([...pentKeys].sort()).toEqual([...coverKeys(PENT_IDS)].sort());
  });

  it('deep-equals the four locked door examples', () => {
    const locked = [
      ['cups_01_ace', 'upright', 1, DOOR_CUPS_OFFERS],
      ['cups_01_ace', 'reversed', 1, DOOR_CUPS_OFFERS],
      ['cups_02', 'upright', 2, DOOR_CUPS_OFFERS],
      ['pents_page', 'upright', 2, DOOR_PENTS_OFFERS],
    ] as const;
    for (const [cardId, orientation, pauseIndex, catalog] of locked) {
      const offer = catalog.find(
        (item) =>
          item.cardId === cardId &&
          item.orientation === orientation &&
          item.pauseIndex === pauseIndex,
      );
      expect(offer).toEqual(lookupPauseOffer('door', cardId, orientation, pauseIndex));
    }
  });

  it('keeps craft words out of cup number cards and every door pent', () => {
    const cupNumbers = DOOR_CUPS_OFFERS.filter((offer) => CUP_NUMBER_IDS.has(offer.cardId));
    expect(cupNumbers).toHaveLength(40);
    for (const offer of [...cupNumbers, ...DOOR_PENTS_OFFERS]) {
      const blob = offerBlob(offer);
      for (const word of CRAFT_WORDS) {
        expect(blob, `${offer.cardId} ${offer.orientation} pause ${offer.pauseIndex}`).not.toContain(word);
      }
    }
  });
});

describe('door swords and wands pause catalog', () => {
  it('returns no skeleton failures', () => {
    expect(validateDoorOffers(DOOR_SWORDS_OFFERS)).toEqual([]);
    expect(validateDoorOffers(DOOR_WANDS_OFFERS)).toEqual([]);
  });

  it('covers every sword and every wand, both orientations, and both pauses', () => {
    expect(DOOR_SWORDS_OFFERS).toHaveLength(56);
    expect(DOOR_WANDS_OFFERS).toHaveLength(56);
    expect(DOOR_SWORDS_OFFERS.every((offer) => offer.sceneId === 'door')).toBe(true);
    expect(DOOR_WANDS_OFFERS.every((offer) => offer.sceneId === 'door')).toBe(true);
    const swordKeys = DOOR_SWORDS_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    const wandKeys = DOOR_WANDS_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    expect([...swordKeys].sort()).toEqual([...coverKeys(SWORD_IDS)].sort());
    expect([...wandKeys].sort()).toEqual([...coverKeys(WAND_IDS)].sort());
  });
});

const CUP_COURT_IDS = new Set(['cups_page', 'cups_knight', 'cups_queen', 'cups_king']);

describe('hand majors and cups pause catalog', () => {
  it('returns no skeleton failures', () => {
    expect(validateDoorOffers(HAND_MAJOR_OFFERS, 'hand')).toEqual([]);
    expect(validateDoorOffers(HAND_CUPS_OFFERS, 'hand')).toEqual([]);
  });

  it('covers every major and every cup, both orientations, and both pauses', () => {
    expect(HAND_MAJOR_OFFERS).toHaveLength(88);
    expect(HAND_CUPS_OFFERS).toHaveLength(56);
    expect(HAND_MAJOR_OFFERS.every((offer) => offer.sceneId === 'hand')).toBe(true);
    expect(HAND_CUPS_OFFERS.every((offer) => offer.sceneId === 'hand')).toBe(true);
    const majorKeys = HAND_MAJOR_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    const cupKeys = HAND_CUPS_OFFERS.map(
      (offer) => `${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`,
    );
    expect([...majorKeys].sort()).toEqual([...coverKeys(MAJOR_IDS)].sort());
    expect([...cupKeys].sort()).toEqual([...coverKeys(CUP_IDS)].sort());
  });

  it('keeps craft words off majors and cup number cards', () => {
    const cupNumbers = HAND_CUPS_OFFERS.filter((offer) => CUP_NUMBER_IDS.has(offer.cardId));
    expect(cupNumbers).toHaveLength(40);
    for (const offer of [...HAND_MAJOR_OFFERS, ...cupNumbers]) {
      const blob = offerBlob(offer);
      for (const word of CRAFT_WORDS) {
        expect(blob, `${offer.cardId} ${offer.orientation} pause ${offer.pauseIndex}`).not.toContain(
          word,
        );
      }
    }
    const withCraft = HAND_CUPS_OFFERS.filter((offer) => offerBlob(offer).includes('哪一种手艺'));
    expect(withCraft.length).toBeGreaterThan(0);
    expect(withCraft.every((offer) => CUP_COURT_IDS.has(offer.cardId))).toBe(true);
  });

  it('forbids craft words on a hand major and allows them on a cup court', () => {
    const major = HAND_MAJOR_OFFERS.find((offer) => offer.pauseIndex === 1);
    const number = HAND_CUPS_OFFERS.find(
      (offer) => offer.cardId === 'cups_01_ace' && offer.pauseIndex === 1,
    );
    const court = HAND_CUPS_OFFERS.find(
      (offer) => offer.cardId === 'cups_page' && offer.orientation === 'upright' && offer.pauseIndex === 2,
    );
    if (!major || major.pauseIndex !== 1 || !number || number.pauseIndex !== 1 || !court) {
      throw new Error('catalog missing hand samples');
    }
    const majorCraft: PauseOffer = {
      ...major,
      promptZh: `${major.promptZh.slice(0, -1)}，哪一种手艺？`,
    };
    const numberCraft: PauseOffer = {
      ...number,
      promptZh: `${number.promptZh.slice(0, -1)}，哪一种手艺？`,
    };
    const wrongLeave: PauseOffer = {
      ...major,
      actions: [
        major.actions[0],
        major.actions[1],
        { ...major.actions[2], labelZh: '先把门带上' },
      ],
    };
    expect(validateDoorOffers([majorCraft], 'hand').some((failure) => failure.includes('哪一种手艺'))).toBe(
      true,
    );
    expect(validateDoorOffers([numberCraft], 'hand').some((failure) => failure.includes('哪一种手艺'))).toBe(
      true,
    );
    expect(validateDoorOffers([court], 'hand')).toEqual([]);
    expect(validateDoorOffers([wrongLeave], 'hand').some((failure) => failure.includes('放回桌上'))).toBe(
      true,
    );
  });

  it('does not require the full hand deck yet', () => {
    expect(() => assertPauseCatalogComplete('hand')).toThrow();
  });
});

describe('complete door pause catalog', () => {
  it('requires every card, both orientations, and both pauses', () => {
    expect(() => assertPauseCatalogComplete('door')).not.toThrow();
  });
});
