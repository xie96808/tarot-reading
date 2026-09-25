import { CARDS } from '@/data/lexicons/zh-1';
import type { PauseOffer } from './types';

const DOOR_LEAVE_LABEL = '先把门带上';
const AFTER_ACTION = '沿着刚才那一步';
const AFTER_SKIP = '刚才你没有点';

const FORBIDDEN_SUBSTRINGS = ['人格', '命运', '结局已定', '特长', '你擅长', '哪一种手艺'] as const;

function promptsOf(offer: PauseOffer): readonly string[] {
  if (offer.pauseIndex === 1) return [offer.promptZh];
  return [offer.promptAfterActionZh, offer.promptAfterSkipZh];
}

function whereOf(offer: PauseOffer, index: number): string {
  return `${offer.cardId} ${offer.orientation} pause ${offer.pauseIndex} [${index}]`;
}

export function validateDoorOffers(offers: readonly PauseOffer[]): string[] {
  const failures: string[] = [];
  const seen = new Set<string>();

  offers.forEach((offer, index) => {
    const where = whereOf(offer, index);
    if (offer.sceneId !== 'door') failures.push(`${where}: sceneId must be door`);

    const key = `${offer.sceneId}|${offer.cardId}|${offer.orientation}|${offer.pauseIndex}`;
    if (seen.has(key)) failures.push(`${where}: duplicate offer`);
    seen.add(key);

    if (offer.actions.length !== 3) {
      failures.push(`${where}: actions must be engage, engage, leave`);
    }
    const [first, second, third] = offer.actions;
    if (
      !first ||
      !second ||
      !third ||
      first.kind !== 'engage' ||
      second.kind !== 'engage' ||
      third.kind !== 'leave'
    ) {
      failures.push(`${where}: actions must be engage, engage, leave`);
    }
    if (third && third.labelZh !== DOOR_LEAVE_LABEL) {
      failures.push(`${where}: leave label must be ${DOOR_LEAVE_LABEL}`);
    }
    if (first && second && third) {
      const ids = [first.id, second.id, third.id];
      if (ids.some((id) => id.trim() === '') || new Set(ids).size !== ids.length) {
        failures.push(`${where}: action ids must be non-empty and unique`);
      }
    }

    if (offer.pauseIndex === 1) {
      if (offer.promptZh.includes(AFTER_ACTION)) {
        failures.push(`${where}: pause 1 prompt must not contain ${AFTER_ACTION}`);
      }
    } else {
      if (!offer.promptAfterActionZh.includes(AFTER_ACTION)) {
        failures.push(`${where}: pause 2 action prompt must contain ${AFTER_ACTION}`);
      }
      if (!offer.promptAfterSkipZh.includes(AFTER_SKIP)) {
        failures.push(`${where}: pause 2 skip prompt must contain ${AFTER_SKIP}`);
      }
      if (offer.promptAfterSkipZh.includes(AFTER_ACTION)) {
        failures.push(`${where}: pause 2 skip prompt must not contain ${AFTER_ACTION}`);
      }
    }

    const entry = CARDS[offer.cardId][offer.orientation];
    const fields: Array<[string, string]> = promptsOf(offer).map((text, promptIndex) => [
      `prompt${promptIndex}`,
      text,
    ]);
    for (const action of offer.actions) {
      fields.push([`${action.id}.label`, action.labelZh], [`${action.id}.sentence`, action.sentenceZh]);
      if (
        action.labelZh.includes('「') ||
        action.labelZh.includes('」') ||
        /[\r\n]/.test(action.labelZh)
      ) {
        failures.push(`${where}: label has bracket or newline (${action.id})`);
      }
      if (!action.sentenceZh.endsWith('。')) {
        failures.push(`${where}: sentenceZh must end with 。 (${action.id})`);
      }
      if (action.sentenceZh === entry.meaning || action.sentenceZh === entry.reflection) {
        failures.push(`${where}: sentenceZh copies lexicon (${action.id})`);
      }
    }

    for (const [field, text] of fields) {
      if (text.trim() === '') failures.push(`${where}: ${field} is empty`);
      if (!field.endsWith('.label') && !field.endsWith('.sentence')) {
        const questions = text.split('？').length - 1;
        if (questions !== 1 || !text.endsWith('？')) {
          failures.push(`${where}: ${field} must be one open question`);
        }
      }
      for (const word of FORBIDDEN_SUBSTRINGS) {
        if (text.includes(word)) failures.push(`${where}: ${field} contains ${word}`);
      }
      if (text.includes('<') || text.includes('>')) {
        failures.push(`${where}: ${field} contains html`);
      }
    }
  });

  return failures;
}
