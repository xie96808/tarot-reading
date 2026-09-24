import { describe, expect, it } from 'vitest';
import { MAX_PAUSE_LINE_CODEPOINTS } from '@/config/site';
import type { CardId } from '@/data/card-ids';
import { lookupPauseOffer, PAUSE_EXAMPLES } from '@/data/lexicons/zh-1/pauses/examples';
import type { PauseOffer } from '@/data/lexicons/zh-1/pauses/types';
import { promptForPause, shouldOpenPauseText } from '@/lib/pause';
import { createSession, reduce, type RitualSession } from '@/lib/ritual-machine';
import type { Draw, Orientation } from '@/lib/shuffle';

const sceneOn = { scenePause: true } as const;

function card(positionId: string, cardId: CardId, orientation: Orientation = 'upright'): Draw {
  return { positionId, cardId, orientation };
}

function threeDraws(
  past: { cardId: CardId; orientation?: Orientation } = { cardId: 'cups_01_ace' },
  present: { cardId: CardId; orientation?: Orientation } = { cardId: 'cups_02' },
  future: { cardId: CardId; orientation?: Orientation } = { cardId: 'wands_01_ace' },
): Draw[] {
  return [
    card('present', present.cardId, present.orientation),
    card('future', future.cardId, future.orientation),
    card('past', past.cardId, past.orientation),
  ];
}

function locked(input?: {
  sceneId?: 'door' | 'hand';
  draws?: Draw[];
}): Extract<RitualSession, { stage: 'reveal' }> {
  return {
    ...createSession(),
    stage: 'reveal',
    sceneId: input?.sceneId ?? 'door',
    sceneLocked: true,
    deckPreCut: [],
    commitFull: 'a'.repeat(64),
    commitShort: 'a'.repeat(16),
    cutIndex: 1,
    draws: input?.draws ?? threeDraws(),
    revealed: [],
    selectedPositionId: 'past',
    note: '',
    saveDevice: false,
    savePrivate: false,
    view: 'table',
  };
}

function asReveal(state: RitualSession): Extract<RitualSession, { stage: 'reveal' }> {
  if (state.stage !== 'reveal') throw new Error(`expected reveal, got ${state.stage}`);
  return state;
}

function openPast(state: RitualSession = locked()): Extract<RitualSession, { stage: 'reveal' }> {
  return asReveal(reduce(state, { type: 'REVEAL_NEXT' }, sceneOn));
}

function confirm(state: RitualSession, actionId: string, custom = ''): RitualSession {
  let next = reduce(state, { type: 'CHOOSE_PAUSE', actionId }, sceneOn);
  if (custom) next = reduce(next, { type: 'SET_PAUSE_CUSTOM', custom }, sceneOn);
  return reduce(next, { type: 'CONFIRM_PAUSE' }, sceneOn);
}

describe('pause text', () => {
  it('opens writing only for engage, and ignores skip while writing', () => {
    expect(shouldOpenPauseText('engage')).toBe(true);
    expect(shouldOpenPauseText('leave')).toBe(false);

    const draft = openPast();
    const skipped = reduce(draft, { type: 'SKIP_PAUSE' }, sceneOn);
    expect(asReveal(skipped).pause).toBeNull();
    expect(asReveal(skipped).pauseAnswers[0]).toEqual({ index: 1, positionId: 'past', kind: 'skip' });

    const left = reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'leave' }, sceneOn);
    expect(asReveal(left).pause).toBeNull();
    expect(asReveal(left).pauseAnswers[0]).toMatchObject({ kind: 'action', actionId: 'leave', custom: '' });

    const writing = reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'name' }, sceneOn);
    expect(asReveal(writing).pause).toEqual({
      positionId: 'past',
      index: 1,
      phase: 'writing',
      actionId: 'name',
      custom: '',
    });
    expect(reduce(writing, { type: 'SKIP_PAUSE' }, sceneOn)).toBe(writing);
    expect(reduce(writing, { type: 'CHOOSE_PAUSE', actionId: 'sip' }, sceneOn)).toBe(writing);

    const edited = reduce(writing, { type: 'SET_PAUSE_CUSTOM', custom: '先叫它水' }, sceneOn);
    const reverted = reduce(edited, { type: 'REVERT_PAUSE' }, sceneOn);
    expect(asReveal(reverted).pause).toEqual({
      positionId: 'past',
      index: 1,
      phase: 'choosing',
      actionId: null,
      custom: '',
    });
    expect(asReveal(reverted).revealed).toEqual([]);
    expect(reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'unknown' }, sceneOn)).toBe(draft);
  });

  it('uses the card orientation and scene when it looks up an offer', () => {
    const reversed = openPast(locked({
      draws: threeDraws({ cardId: 'cups_01_ace', orientation: 'reversed' }),
    }));
    expect(reduce(reversed, { type: 'CHOOSE_PAUSE', actionId: 'sip' }, sceneOn)).toBe(reversed);
    const writing = reduce(reversed, { type: 'CHOOSE_PAUSE', actionId: 'cover' }, sceneOn);
    expect(asReveal(writing).pause?.phase).toBe('writing');

    const hand = locked({
      sceneId: 'hand',
      draws: threeDraws({ cardId: 'pents_01_ace' }, { cardId: 'pents_page' }),
    });
    const past = openPast(hand);
    expect(past.pause).toBeNull();
    expect(past.pauseAnswers[0]).toMatchObject({ index: 1, positionId: 'past', kind: 'missing' });
    const present = openPast(past);
    expect(present.pause).toBeNull();
    expect(present.pauseAnswers[1]).toMatchObject({ index: 2, positionId: 'present', kind: 'missing' });
    expect(reduce(present, { type: 'CHOOSE_PAUSE', actionId: 'look' }, sceneOn)).toBe(present);
    expect(reduce(present, { type: 'CHOOSE_PAUSE', actionId: 'craft' }, sceneOn)).toBe(present);
  });

  it('sets keptPauseIndex only when exactly one answer can be kept', () => {
    const pastAction = confirm(openPast(), 'name');
    expect(asReveal(pastAction).keptPauseIndex).toBe(1);
    const oneKept = reduce(openPast(asReveal(pastAction)), { type: 'SKIP_PAUSE' }, sceneOn);
    expect(asReveal(oneKept).keptPauseIndex).toBe(1);
    expect(asReveal(oneKept).pauseAnswers.map((answer) => answer.kind)).toEqual(['action', 'skip']);

    const missingPast = openPast(locked({ draws: threeDraws({ cardId: 'not_in_door_catalog' as CardId }) }));
    expect(missingPast.pauseAnswers[0]?.kind).toBe('missing');
    const presentAction = confirm(openPast(missingPast), 'level', '');
    expect(asReveal(presentAction).keptPauseIndex).toBe(2);

    const custom = '我只递到能看见对方眼睛的高度';
    const first = confirm(openPast(), 'name', custom);
    const second = confirm(openPast(asReveal(first)), 'level');
    expect(asReveal(second).keptPauseIndex).toBeNull();
    expect(asReveal(second).pauseAnswers.filter((answer) => answer.kind === 'action')).toHaveLength(2);

    const future = reduce(second, { type: 'REVEAL_NEXT' }, sceneOn);
    const read = reduce(future, { type: 'FUTURE_BEAT_DONE' }, sceneOn);
    expect(read.stage).toBe('read');
    if (read.stage !== 'read') return;
    expect(read.keptPauseIndex).toBeNull();
    expect(reduce(read, { type: 'CLOSE_ACK' }, sceneOn)).toBe(read);
    const chosen = reduce(read, { type: 'SET_KEPT_PAUSE', index: 1 }, sceneOn);
    if (chosen.stage !== 'read') return;
    expect(chosen.keptPauseIndex).toBe(1);

    const closed = reduce(chosen, { type: 'CLOSE_ACK' }, sceneOn);
    expect(closed.stage).toBe('close');
    if (closed.stage !== 'close') return;
    expect(closed.pauseAnswers[0]).toMatchObject({ kind: 'action', custom });
    expect(closed.keptPauseIndex).toBe(1);
    expect(closed.receipt.sceneId).toBeNull();
    expect(closed.receipt.pauseAnswers).toEqual([]);
    expect(closed.receipt.keptPauseIndex).toBeNull();
    expect(JSON.stringify(closed.receipt)).not.toContain(custom);
    expect(reduce(closed, { type: 'SET_KEPT_PAUSE', index: 2 }, sceneOn)).toBe(closed);

    const privateRead = reduce(chosen, { type: 'SET_SAVE_OPTIONS', saveDevice: true, savePrivate: true }, sceneOn);
    const privateClosed = reduce(privateRead, { type: 'CLOSE_ACK' }, sceneOn);
    if (privateClosed.stage !== 'close') return;
    expect(privateClosed.receipt.sceneId).toBe('door');
    expect(privateClosed.receipt.keptPauseIndex).toBe(1);
    expect(privateClosed.receipt.pauseAnswers[0]).toMatchObject({ custom });
    expect(privateClosed.pauseAnswers).toEqual(privateClosed.receipt.pauseAnswers);
  });

  it('ignores a custom line longer than 40 code points and keeps one of exactly 40', () => {
    const draft = openPast();
    const writing = reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'sip' }, sceneOn);
    const forty = '字'.repeat(MAX_PAUSE_LINE_CODEPOINTS);
    const accepted = reduce(writing, { type: 'SET_PAUSE_CUSTOM', custom: forty }, sceneOn);
    expect(asReveal(accepted).pause?.custom).toBe(forty);
    expect(reduce(accepted, { type: 'SET_PAUSE_CUSTOM', custom: `${forty}多` }, sceneOn)).toBe(accepted);
    const faces = '🙂'.repeat(MAX_PAUSE_LINE_CODEPOINTS);
    expect([...faces].length).toBe(40);
    expect(faces.length).toBeGreaterThan(40);
    const emoji = reduce(writing, { type: 'SET_PAUSE_CUSTOM', custom: faces }, sceneOn);
    expect(asReveal(emoji).pause?.custom).toBe(faces);
    expect(reduce(emoji, { type: 'SET_PAUSE_CUSTOM', custom: `${faces}🙂` }, sceneOn)).toBe(emoji);
    const committed = reduce(emoji, { type: 'CONFIRM_PAUSE' }, sceneOn);
    expect(asReveal(committed).pauseAnswers[0]).toMatchObject({ kind: 'action', custom: faces });
  });

  it('keeps the six locked offers verbatim', () => {
    expect(PAUSE_EXAMPLES).toHaveLength(6);
    const expected: PauseOffer[] = [
      {
        sceneId: 'door',
        cardId: 'cups_01_ace',
        orientation: 'upright',
        pauseIndex: 1,
        promptZh: '门缝里是一只还没被命名的杯。你要先怎么待它？',
        actions: [
          { id: 'name', kind: 'engage', labelZh: '先给它起名', sentenceZh: '我先给这只杯起一个名字，不急着喝。' },
          { id: 'sip', kind: 'engage', labelZh: '先喝一口', sentenceZh: '我先喝一口，名字以后再说。' },
          { id: 'leave', kind: 'leave', labelZh: '先把门带上', sentenceZh: '我先把门带上，杯子留在门缝那边。' },
        ],
      },
      {
        sceneId: 'door',
        cardId: 'cups_02',
        orientation: 'upright',
        pauseIndex: 2,
        promptAfterActionZh: '沿着刚才那一步，门又开了一线。两只杯在同一高度。你要怎么待这次交换？',
        promptAfterSkipZh: '刚才你没有点。门又开了一线。两只杯在同一高度。你要怎么待这次交换？',
        actions: [
          { id: 'level', kind: 'engage', labelZh: '把杯子递到同一高度', sentenceZh: '我把杯子递到和对方同一高度，不把对方当成答案。' },
          { id: 'wait', kind: 'engage', labelZh: '先看清谁的杯子更高', sentenceZh: '我先看清两只杯子是不是同一高度，再决定递不递。' },
          { id: 'leave', kind: 'leave', labelZh: '先把门带上', sentenceZh: '我先把门带上，这次交换留在门口。' },
        ],
      },
      {
        sceneId: 'door',
        cardId: 'cups_01_ace',
        orientation: 'reversed',
        pauseIndex: 1,
        promptZh: '门缝里这只杯口朝下。你要先怎么待这份没接住的开口？',
        actions: [
          { id: 'cover', kind: 'engage', labelZh: '先把杯口转上来', sentenceZh: '我先把杯口转上来，不急着解释它会打乱什么。' },
          { id: 'name', kind: 'engage', labelZh: '先给堵住的地方起名', sentenceZh: '我先给堵住的地方起一个名字。' },
          { id: 'leave', kind: 'leave', labelZh: '先把门带上', sentenceZh: '我先把门带上，杯口朝下的那只留在门缝那边。' },
        ],
      },
      {
        sceneId: 'hand',
        cardId: 'pents_01_ace',
        orientation: 'upright',
        pauseIndex: 1,
        promptZh: '掌心里是一枚还有重量的星币。你要先怎么待这颗种子？',
        actions: [
          { id: 'plant', kind: 'engage', labelZh: '先把种子放进土里', sentenceZh: '我先把这颗种子放进一块具体的土里。' },
          { id: 'weigh', kind: 'engage', labelZh: '先称一称它的重量', sentenceZh: '我先称一称手里的重量，不急着下锹。' },
          { id: 'leave', kind: 'leave', labelZh: '放回桌上', sentenceZh: '我把这枚星币放回桌上，没有接进手里。' },
        ],
      },
      {
        sceneId: 'hand',
        cardId: 'pents_page',
        orientation: 'upright',
        pauseIndex: 2,
        promptAfterActionZh: '沿着刚才那一步，掌心又多了一枚被端详的星币。你身上哪一种手艺够用在这一步？',
        promptAfterSkipZh: '刚才你没有点。掌心又多了一枚被端详的星币。你身上哪一种手艺够用在这一步？',
        actions: [
          { id: 'craft', kind: 'engage', labelZh: '用正在学的那门手艺', sentenceZh: '我用正在学的那门手艺，把第一步做完。' },
          { id: 'small', kind: 'engage', labelZh: '先只做一个最小的动作', sentenceZh: '我先做一个小到今天能做完的动作。' },
          { id: 'leave', kind: 'leave', labelZh: '放回桌上', sentenceZh: '我把侍从端详的这枚放回桌上。' },
        ],
      },
      {
        sceneId: 'door',
        cardId: 'pents_page',
        orientation: 'upright',
        pauseIndex: 2,
        promptAfterActionZh: '沿着刚才那一步，门缝里是一个把星币拿到眼前的人。你要怎么待这第一步？',
        promptAfterSkipZh: '刚才你没有点。门缝里是一个把星币拿到眼前的人。你要怎么待这第一步？',
        actions: [
          { id: 'look', kind: 'engage', labelZh: '让他先把星币看清', sentenceZh: '我让他把星币看清，再决定要不要进门。' },
          { id: 'step', kind: 'engage', labelZh: '请他跨进门来', sentenceZh: '我请他跨进门来，第一步在门槛里边。' },
          { id: 'leave', kind: 'leave', labelZh: '先把门带上', sentenceZh: '我先把门带上，侍从还在门外。' },
        ],
      },
    ];
    expect(PAUSE_EXAMPLES).toEqual(expected);
    for (const offer of expected) {
      expect(lookupPauseOffer(offer.sceneId, offer.cardId, offer.orientation, offer.pauseIndex)).toEqual(offer);
      if (offer.pauseIndex === 1) {
        expect(promptForPause(offer, 'action')).toBe(offer.promptZh);
        expect(offer.promptZh).not.toContain('沿着刚才那一步');
      } else {
        expect(promptForPause(offer, 'action')).toBe(offer.promptAfterActionZh);
        expect(offer.promptAfterActionZh).toContain('沿着刚才那一步');
        expect(promptForPause(offer, 'missing')).toBe(offer.promptAfterSkipZh);
        expect(offer.promptAfterSkipZh).toContain('刚才你没有点');
        expect(offer.promptAfterSkipZh).not.toContain('沿着刚才那一步');
      }
      expect(offer.actions[2]?.kind).toBe('leave');
      for (const action of offer.actions) {
        expect(action.labelZh).not.toContain('「');
        expect(action.labelZh).not.toContain('\n');
        expect(action.sentenceZh.endsWith('。')).toBe(true);
      }
    }
    expect(lookupPauseOffer('door', 'swords_01_ace', 'upright', 1)).toBeNull();
    expect(lookupPauseOffer('hand', 'cups_01_ace', 'upright', 1)).toBeNull();
    expect(lookupPauseOffer(null, 'cups_01_ace', 'upright', 1)).toBeNull();
    const doorPage = lookupPauseOffer('door', 'pents_page', 'upright', 2);
    expect(doorPage?.pauseIndex === 2 && doorPage.promptAfterActionZh.includes('手艺')).toBe(false);
  });
});
