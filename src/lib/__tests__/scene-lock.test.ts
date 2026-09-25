import { beforeEach, describe, expect, it } from 'vitest';
import { SESSION_STORAGE_KEY } from '@/config/site';
import { createSession, reduce, type RitualSession } from '@/lib/ritual-machine';
import { HAND_SCENE_ENABLED, SCENE_PAUSE_ENABLED } from '@/lib/scene';
import { clearSession, loadSession, normalizeSession } from '@/lib/storage';

const sceneOn = { scenePause: true } as const;

function toSpread(): RitualSession {
  let state = createSession();
  state = reduce(state, { type: 'ACK_ENTER' }, sceneOn);
  state = reduce(state, { type: 'SUBMIT_QUESTION' }, sceneOn);
  return state;
}

function lockDoor(): RitualSession {
  const chosen = reduce(toSpread(), { type: 'SET_SCENE', sceneId: 'door' }, sceneOn);
  return reduce(chosen, { type: 'CONFIRM_SPREAD' }, sceneOn);
}

describe('scene lock', () => {
  beforeEach(() => {
    clearSession();
  });

  it('accepts door on a three-card spread and ignores hand while that scene is disabled', () => {
    expect(HAND_SCENE_ENABLED).toBe(false);
    const early = createSession();
    expect(reduce(early, { type: 'SET_SCENE', sceneId: 'door' }, sceneOn)).toBe(early);
    const state = toSpread();
    expect(state.stage).toBe('spread');
    expect(state.spreadId).toBe('three');
    expect(state.sceneId).toBeNull();
    expect(state.sceneLocked).toBe(false);
    expect(reduce(state, { type: 'SET_SCENE', sceneId: 'hand' }, sceneOn)).toBe(state);
    const door = reduce(state, { type: 'SET_SCENE', sceneId: 'door' }, sceneOn);
    expect(door.sceneId).toBe('door');
    expect(door.sceneLocked).toBe(false);
    expect(door.stage).toBe('spread');
  });

  it('does not leave a three-card spread until a scene is chosen', () => {
    const state = toSpread();
    expect(reduce(state, { type: 'CONFIRM_SPREAD' }, sceneOn)).toBe(state);
  });

  it('locks the chosen scene when the three-card spread starts shuffling', () => {
    const state = lockDoor();
    expect(state.stage).toBe('shuffle');
    expect(state.sceneId).toBe('door');
    expect(state.sceneLocked).toBe(true);
    if (state.stage === 'shuffle') expect(state.shufflePhase).toBe('idle');
    expect(reduce(state, { type: 'SET_SCENE', sceneId: 'hand' }, sceneOn)).toBe(state);
  });

  it('keeps the lock when an idle shuffle returns to the spread', () => {
    let state = lockDoor();
    state = reduce(state, { type: 'BACK' }, sceneOn);
    expect(state.stage).toBe('spread');
    expect(state.sceneId).toBe('door');
    expect(state.sceneLocked).toBe(true);
    state = reduce(state, { type: 'SET_SPREAD', spreadId: 'celtic' }, sceneOn);
    expect(state.spreadId).toBe('celtic');
    expect(state.sceneId).toBe('door');
    expect(state.sceneLocked).toBe(true);
    state = reduce(state, { type: 'SET_REVERSALS', reversals: false }, sceneOn);
    expect(state.reversals).toBe(false);
    expect(state.sceneId).toBe('door');
    expect(state.sceneLocked).toBe(true);
    expect(reduce(state, { type: 'SET_SCENE', sceneId: 'hand' }, sceneOn)).toBe(state);
    expect(reduce(state, { type: 'SET_SCENE', sceneId: 'door' }, sceneOn)).toBe(state);
  });

  it('clears the scene when the reading is abandoned', () => {
    let state = lockDoor();
    state = reduce(state, { type: 'ABANDON_REQUEST' }, sceneOn);
    state = reduce(state, { type: 'ABANDON_CONFIRM' }, sceneOn);
    expect(state.stage).toBe('enter');
    expect(state.sceneId).toBeNull();
    expect(state.sceneLocked).toBe(false);
  });

  it('does not require a scene for single or celtic', () => {
    let single = toSpread();
    single = reduce(single, { type: 'SET_SPREAD', spreadId: 'single' }, sceneOn);
    single = reduce(single, { type: 'CONFIRM_SPREAD' }, sceneOn);
    expect(single.stage).toBe('shuffle');
    expect(single.sceneId).toBeNull();
    expect(single.sceneLocked).toBe(false);

    let celtic = toSpread();
    celtic = reduce(celtic, { type: 'SET_SPREAD', spreadId: 'celtic' }, sceneOn);
    celtic = reduce(celtic, { type: 'CONFIRM_SPREAD' }, sceneOn);
    expect(celtic.stage).toBe('shuffle');
    expect(celtic.sceneId).toBeNull();
    expect(celtic.sceneLocked).toBe(false);
  });

  it('follows the production pause flag, and ignores scene selection when that flag is off', () => {
    expect(SCENE_PAUSE_ENABLED).toBe(true);
    let state = createSession();
    state = reduce(state, { type: 'ACK_ENTER' });
    state = reduce(state, { type: 'SUBMIT_QUESTION' });
    expect(reduce(state, { type: 'CONFIRM_SPREAD' })).toBe(state);
    const door = reduce(state, { type: 'SET_SCENE', sceneId: 'door' });
    expect(door.sceneId).toBe('door');
    const shuffling = reduce(door, { type: 'CONFIRM_SPREAD' });
    expect(shuffling.stage).toBe('shuffle');
    expect(shuffling.sceneId).toBe('door');
    expect(shuffling.sceneLocked).toBe(true);

    const off = { scenePause: false } as const;
    let explicit = createSession();
    explicit = reduce(explicit, { type: 'ACK_ENTER' }, off);
    explicit = reduce(explicit, { type: 'SUBMIT_QUESTION' }, off);
    expect(reduce(explicit, { type: 'SET_SCENE', sceneId: 'door' }, off)).toBe(explicit);
    const offShuffle = reduce(explicit, { type: 'CONFIRM_SPREAD' }, off);
    expect(offShuffle.stage).toBe('shuffle');
    expect(offShuffle.sceneLocked).toBe(false);
  });

  it('fills missing scene fields without rejecting the session', () => {
    const missing = normalizeSession({
      sessionId: 'legacy',
      stage: 'spread',
      question: '旧问题',
      spreadId: 'three',
      reversals: true,
      abandonOpen: false,
    } as RitualSession);
    expect(missing.sessionId).toBe('legacy');
    expect(missing.question).toBe('旧问题');
    expect(missing.sceneId).toBeNull();
    expect(missing.sceneLocked).toBe(false);

    const unrecognized = normalizeSession({
      ...createSession(),
      sceneId: 'other',
      sceneLocked: 'true',
    } as unknown as RitualSession);
    expect(unrecognized.sceneId).toBeNull();
    expect(unrecognized.sceneLocked).toBe(false);

    const storedHand = normalizeSession({ ...createSession(), sceneId: 'hand', sceneLocked: true });
    expect(storedHand.sceneId).toBe('hand');
    expect(storedHand.sceneLocked).toBe(true);
  });

  it('still loads an old session that has no scene fields', () => {
    const mem = globalThis as typeof globalThis & { __tarotMemory?: Map<string, string | null> };
    if (!mem.__tarotMemory) mem.__tarotMemory = new Map();
    const key = `session:${SESSION_STORAGE_KEY}`;
    mem.__tarotMemory.set(
      key,
      JSON.stringify({
        sessionId: 'legacy',
        stage: 'question',
        question: '旧问题',
        spreadId: 'three',
        reversals: true,
        abandonOpen: false,
      }),
    );
    const loaded = loadSession();
    expect(loaded?.sessionId).toBe('legacy');
    expect(loaded?.stage).toBe('question');
    expect(loaded?.question).toBe('旧问题');
    expect(loaded?.sceneId).toBeNull();
    expect(loaded?.sceneLocked).toBe(false);
    expect(mem.__tarotMemory.get(key)).toContain('legacy');

    mem.__tarotMemory.set(
      key,
      JSON.stringify({
        ...createSession(),
        sessionId: 'kept',
        sceneId: 'hand',
        sceneLocked: true,
      }),
    );
    const kept = loadSession();
    expect(kept?.sessionId).toBe('kept');
    expect(kept?.sceneId).toBe('hand');
    expect(kept?.sceneLocked).toBe(true);
    expect(mem.__tarotMemory.has(key)).toBe(true);
  });
});
