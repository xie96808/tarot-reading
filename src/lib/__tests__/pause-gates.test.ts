import { beforeEach, describe, expect, it } from 'vitest';
import { SESSION_STORAGE_KEY } from '@/config/site';
import type { CardId } from '@/data/card-ids';
import { lookupPauseOffer } from '@/data/lexicons/zh-1/pauses/examples';
import { promptForPause } from '@/lib/pause';
import { createSession, persistable, reduce, type RitualSession } from '@/lib/ritual-machine';
import { clearSession, loadSession, normalizeSession } from '@/lib/storage';
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

function revealFixture(input: {
  spreadId?: RitualSession['spreadId'];
  sceneId?: RitualSession['sceneId'];
  sceneLocked?: boolean;
  draws: Draw[];
  revealed?: string[];
  selectedPositionId?: string;
}): Extract<RitualSession, { stage: 'reveal' }> {
  return {
    ...createSession(),
    stage: 'reveal',
    spreadId: input.spreadId ?? 'three',
    sceneId: input.sceneId === undefined ? 'door' : input.sceneId,
    sceneLocked: input.sceneLocked ?? false,
    deckPreCut: [],
    commitFull: 'a'.repeat(64),
    commitShort: 'a'.repeat(16),
    cutIndex: 1,
    draws: input.draws,
    revealed: input.revealed ?? [],
    selectedPositionId: input.selectedPositionId ?? 'past',
    note: '',
    saveDevice: false,
    savePrivate: false,
    view: 'table',
  };
}

function lockedThree(draws: Draw[] = threeDraws()): Extract<RitualSession, { stage: 'reveal' }> {
  return revealFixture({ sceneId: 'door', sceneLocked: true, draws, selectedPositionId: 'past' });
}

function openFuture(state: RitualSession = lockedThree()): RitualSession {
  let next = reduce(state, { type: 'REVEAL_NEXT' }, sceneOn);
  next = reduce(next, { type: 'SKIP_PAUSE' }, sceneOn);
  next = reduce(next, { type: 'REVEAL_NEXT' }, sceneOn);
  next = reduce(next, { type: 'SKIP_PAUSE' }, sceneOn);
  return reduce(next, { type: 'REVEAL_NEXT' }, sceneOn);
}

const lintPartial = {
  sessionId: 'orientation-test',
  stage: 'reveal',
  question: '',
  spreadId: 'three',
  reversals: true,
  abandonOpen: false,
  deckPreCut: [],
  commitFull: 'a'.repeat(64),
  commitShort: 'a'.repeat(16),
  cutIndex: 1,
  draws: [
    { positionId: 'past', cardId: '00_the_fool', orientation: 'reversed' },
    { positionId: 'present', cardId: '01_the_magician', orientation: 'reversed' },
    { positionId: 'future', cardId: '02_the_high_priestess', orientation: 'reversed' },
  ],
  revealed: ['past', 'present'],
  selectedPositionId: 'past',
  note: '',
  saveDevice: false,
  savePrivate: false,
  view: 'table',
};

describe('pause gates', () => {
  beforeEach(() => {
    clearSession();
  });

  it('does not open a pause on the future card, single, celtic, or an unlocked three-card spread', () => {
    const future = openFuture();
    expect(future.stage).toBe('reveal');
    if (future.stage === 'reveal') {
      expect(future.pause).toBeNull();
      expect(future.futureBeat).toBe('open');
      expect(future.revealed).toEqual(['past', 'present', 'future']);
    }

    const single = revealFixture({
      spreadId: 'single',
      sceneId: null,
      sceneLocked: false,
      draws: [card('focus', 'swords_01_ace')],
      selectedPositionId: 'focus',
    });
    const singleRevealed = reduce(single, { type: 'REVEAL_NEXT' }, sceneOn);
    expect(singleRevealed.stage).toBe('read');
    if (singleRevealed.stage === 'read') expect(singleRevealed.pause).toBeNull();

    const celtic = revealFixture({
      spreadId: 'celtic',
      sceneId: null,
      sceneLocked: false,
      draws: [card('present', 'swords_01_ace'), card('challenge', 'cups_02')],
      selectedPositionId: 'challenge',
    });
    const celticRevealed = reduce(celtic, { type: 'REVEAL_NEXT' }, sceneOn);
    expect(celticRevealed.stage).toBe('reveal');
    if (celticRevealed.stage === 'reveal') {
      expect(celticRevealed.pause).toBeNull();
      expect(celticRevealed.revealed).toEqual(['challenge']);
    }

    const unlocked = revealFixture({ sceneId: 'door', sceneLocked: false, draws: threeDraws() });
    const unlockedFuture = reduce(unlocked, { type: 'REVEAL_POSITION', positionId: 'future' }, sceneOn);
    expect(unlockedFuture.stage).toBe('reveal');
    if (unlockedFuture.stage === 'reveal') {
      expect(unlockedFuture.pause).toBeNull();
      expect(unlockedFuture.pauseAnswers).toEqual([]);
      expect(unlockedFuture.revealed).toEqual(['future']);
    }
  });

  it('reveals a locked three in past, present, future order and uses drawOrder for the pause index', () => {
    const state = lockedThree();
    expect(state.draws[0]?.positionId).toBe('present');
    expect(reduce(state, { type: 'REVEAL_POSITION', positionId: 'present' }, sceneOn)).toBe(state);
    expect(reduce(state, { type: 'REVEAL_POSITION', positionId: 'future' }, sceneOn)).toBe(state);
    const selected = reduce(state, { type: 'SELECT_POSITION', positionId: 'present' }, sceneOn);
    const past = reduce(selected, { type: 'REVEAL_NEXT' }, sceneOn);
    expect(past.stage).toBe('reveal');
    if (past.stage !== 'reveal' || !past.pause) throw new Error('expected a past draft');
    expect(past.pause).toEqual({ positionId: 'past', index: 1, phase: 'choosing', actionId: null, custom: '' });
    expect(past.revealed).toEqual([]);
    const skipped = reduce(past, { type: 'SKIP_PAUSE' }, sceneOn);
    if (skipped.stage !== 'reveal') throw new Error('expected reveal');
    expect(reduce(skipped, { type: 'REVEAL_POSITION', positionId: 'future' }, sceneOn)).toBe(skipped);
    const present = reduce(skipped, { type: 'REVEAL_NEXT' }, sceneOn);
    if (present.stage !== 'reveal' || !present.pause) throw new Error('expected a present draft');
    expect(present.pause.index).toBe(2);
    expect(present.pause.positionId).toBe('present');
  });

  it('ignores reveal and selection while a draft is open', () => {
    const draft = reduce(lockedThree(), { type: 'REVEAL_NEXT' }, sceneOn);
    expect(reduce(draft, { type: 'REVEAL_POSITION', positionId: 'past' }, sceneOn)).toBe(draft);
    expect(reduce(draft, { type: 'REVEAL_NEXT' }, sceneOn)).toBe(draft);
    expect(reduce(draft, { type: 'STEP_SELECTION', delta: 1 }, sceneOn)).toBe(draft);
    expect(reduce(draft, { type: 'SELECT_POSITION', positionId: 'future' }, sceneOn)).toBe(draft);
    if (draft.stage === 'reveal' && draft.pause) {
      const answered = {
        ...draft,
        pauseAnswers: [{ index: draft.pause.index, positionId: draft.pause.positionId, kind: 'skip' as const }],
      };
      expect(reduce(answered, { type: 'CHOOSE_PAUSE', actionId: 'name' }, sceneOn)).toBe(answered);
      expect(reduce(answered, { type: 'SKIP_PAUSE' }, sceneOn)).toBe(answered);
    }
  });

  it('appends the position when the pause is skipped, confirmed, or left', () => {
    const draft = reduce(lockedThree(), { type: 'REVEAL_POSITION', positionId: 'past' }, sceneOn);
    const skipped = reduce(draft, { type: 'SKIP_PAUSE' }, sceneOn);
    expect(skipped.stage === 'reveal' && skipped.revealed).toEqual(['past']);
    expect(skipped.stage === 'reveal' && skipped.pause).toBeNull();

    const writing = reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'name' }, sceneOn);
    const confirmed = reduce(writing, { type: 'CONFIRM_PAUSE' }, sceneOn);
    expect(confirmed.stage === 'reveal' && confirmed.revealed).toEqual(['past']);
    expect(confirmed.stage === 'reveal' && confirmed.pauseAnswers[0]).toEqual({
      index: 1,
      positionId: 'past',
      kind: 'action',
      actionId: 'name',
      custom: '',
    });

    const left = reduce(draft, { type: 'CHOOSE_PAUSE', actionId: 'leave' }, sceneOn);
    expect(left.stage === 'reveal' && left.revealed).toEqual(['past']);
    expect(left.stage === 'reveal' && left.pause).toBeNull();
    expect(left.stage === 'reveal' && left.pauseAnswers[0]).toMatchObject({ kind: 'action', actionId: 'leave', custom: '' });
  });

  it('keeps the future beat on reveal until FUTURE_BEAT_DONE, and parks a readable copy', () => {
    const future = openFuture();
    expect(future.stage).toBe('reveal');
    if (future.stage !== 'reveal') return;
    expect(future.futureBeat).toBe('open');
    expect(future.pause).toBeNull();
    expect(reduce(future, { type: 'REVEAL_NEXT' }, sceneOn)).toBe(future);
    expect(reduce(future, { type: 'STEP_SELECTION', delta: -1 }, sceneOn)).toBe(future);
    expect(reduce(future, { type: 'SELECT_POSITION', positionId: 'past' }, sceneOn)).toBe(future);
    const read = reduce(future, { type: 'FUTURE_BEAT_DONE' }, sceneOn);
    expect(read.stage).toBe('read');
    if (read.stage === 'read') expect(read.futureBeat).toBeNull();

    const parked = persistable(future);
    expect(parked.stage).toBe('read');
    if (parked.stage === 'read') expect(parked.futureBeat).toBeNull();
    expect(future.stage).toBe('reveal');
    expect(future.futureBeat).toBe('open');
    expect(parked).not.toBe(future);
  });

  it('writes missing instead of skip when the card has no offer', () => {
    const state = lockedThree(threeDraws({ cardId: 'not_in_door_catalog' as CardId }, { cardId: 'cups_02' }));
    const past = reduce(state, { type: 'REVEAL_NEXT' }, sceneOn);
    expect(past.stage).toBe('reveal');
    if (past.stage !== 'reveal') return;
    expect(past.pause).toBeNull();
    expect(past.revealed).toEqual(['past']);
    expect(past.pauseAnswers).toEqual([{ index: 1, positionId: 'past', kind: 'missing' }]);
    expect(past.keptPauseIndex).toBeNull();
    const offer = lookupPauseOffer('door', 'cups_02', 'upright', 2);
    expect(offer).not.toBeNull();
    if (!offer) return;
    const prompt = promptForPause(offer, 'missing');
    expect(prompt).toBe('刚才你没有点。门又开了一线。两只杯在同一高度。你要怎么待这次交换？');
    expect(prompt).not.toContain('沿着刚才那一步');
    expect(promptForPause(offer, 'skip')).toBe(prompt);
    expect(promptForPause(offer, 'action')).toContain('沿着刚才那一步');
  });

  it('keeps a partial reveal and promotes a fully revealed one', () => {
    const partial = normalizeSession(lintPartial as unknown as RitualSession);
    expect(partial.stage).toBe('reveal');
    expect(partial.sceneId).toBeNull();
    expect(partial.sceneLocked).toBe(false);
    if (partial.stage === 'reveal') {
      expect(partial.pause).toBeNull();
      expect(partial.pauseAnswers).toEqual([]);
      expect(partial.keptPauseIndex).toBeNull();
      expect(partial.futureBeat).toBeNull();
      expect(partial.revealed).toEqual(['past', 'present']);
      expect(partial.revealed).not.toContain('future');
      expect(partial.draws).toEqual(lintPartial.draws);
    }

    const mem = globalThis as typeof globalThis & { __tarotMemory?: Map<string, string | null> };
    if (!mem.__tarotMemory) mem.__tarotMemory = new Map();
    const key = `session:${SESSION_STORAGE_KEY}`;
    mem.__tarotMemory.set(key, JSON.stringify(lintPartial));
    const loaded = loadSession();
    expect(loaded?.stage).toBe('reveal');
    expect(loaded?.sessionId).toBe('orientation-test');
    expect(mem.__tarotMemory.has(key)).toBe(true);

    const promoted = normalizeSession({
      ...lintPartial,
      revealed: ['past', 'present', 'future'],
      futureBeat: 'open',
    } as unknown as RitualSession);
    expect(promoted.stage).toBe('read');
    if (promoted.stage === 'read') {
      expect(promoted.futureBeat).toBeNull();
      expect(promoted.draws).toEqual(lintPartial.draws);
      expect(promoted.revealed).toEqual(['past', 'present', 'future']);
    }
  });

  it('resets a bad pause draft and bad answers without dropping the draw', () => {
    const draws = threeDraws();
    const deckPreCut = [{ cardId: 'cups_01_ace' as const, orientation: 'upright' as const }];
    const broken = normalizeSession({
      ...lockedThree(draws),
      deckPreCut,
      pause: { positionId: 'future', index: 3 },
      pauseAnswers: [{ index: 1, positionId: 'past', kind: 'skip' }],
    } as unknown as RitualSession);
    expect(broken.stage).toBe('reveal');
    if (broken.stage === 'reveal') {
      expect(broken.pause).toBeNull();
      expect(broken.pauseAnswers).toEqual([]);
      expect(broken.draws).toEqual(draws);
      expect(broken.deckPreCut).toEqual(deckPreCut);
    }

    const draft = reduce(lockedThree(), { type: 'REVEAL_NEXT' }, sceneOn);
    expect(normalizeSession(draft)).toEqual(draft);

    const unlockedDraft = normalizeSession({
      ...lockedThree(),
      sceneLocked: false,
      pause: { positionId: 'past', index: 1, phase: 'choosing', actionId: null, custom: '' },
      pauseAnswers: [{ index: 1, positionId: 'past', kind: 'skip' }],
    });
    expect(unlockedDraft.stage === 'reveal' && unlockedDraft.pause).toBeNull();
    expect(unlockedDraft.stage === 'reveal' && unlockedDraft.pauseAnswers).toEqual([
      { index: 1, positionId: 'past', kind: 'skip' },
    ]);
  });

  it('does not pause when reduce is called with two arguments', () => {
    const state = lockedThree();
    const present = reduce(state, { type: 'REVEAL_POSITION', positionId: 'present' });
    expect(present.stage).toBe('reveal');
    if (present.stage === 'reveal') {
      expect(present.pause).toBeNull();
      expect(present.revealed).toEqual(['present']);
    }
    expect(reduce(state, { type: 'CHOOSE_PAUSE', actionId: 'name' })).toBe(state);
    expect(reduce(state, { type: 'SKIP_PAUSE' })).toBe(state);
    expect(reduce(state, { type: 'FUTURE_BEAT_DONE' })).toBe(state);
    let walked = state as RitualSession;
    walked = reduce(walked, { type: 'REVEAL_NEXT' });
    walked = reduce(walked, { type: 'REVEAL_NEXT' });
    walked = reduce(walked, { type: 'REVEAL_NEXT' });
    expect(walked.stage).toBe('read');
    if (walked.stage === 'read') expect(walked.pause).toBeNull();
  });
});
