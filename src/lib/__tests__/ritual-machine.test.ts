import { describe, expect, it } from 'vitest';
import { CARD_IDS } from '@/data/card-ids';
import { createSession, reduce, type RitualSession } from '@/lib/ritual-machine';
import type { ShuffledCard } from '@/lib/shuffle';

function fakeDeck(): ShuffledCard[] {
  return CARD_IDS.map((cardId, i) => ({
    cardId,
    orientation: i % 2 === 0 ? 'upright' : 'reversed',
  }));
}

function walkToShuffle(): RitualSession {
  let state = createSession();
  state = reduce(state, { type: 'ACK_ENTER' });
  state = reduce(state, { type: 'SUBMIT_QUESTION' });
  state = reduce(state, { type: 'CONFIRM_SPREAD' });
  return state;
}

describe('ritual machine', () => {
  it('ignores illegal events: no deal before seal, no read before all revealed, no back after seal', () => {
    let state = createSession();
    expect(reduce(state, { type: 'CONFIRM_CUT' }).stage).toBe('enter');
    state = walkToShuffle();
    expect(state.stage).toBe('shuffle');
    state = reduce(state, { type: 'AUTO_SHUFFLE', operationId: 'op-1' });
    state = reduce(state, {
      type: 'SHUFFLE_COMMITTED',
      sessionId: state.sessionId,
      operationId: 'op-1',
      deckPreCut: fakeDeck(),
      commitFull: 'a'.repeat(64),
      commitShort: 'a'.repeat(16),
    });
    expect(state.stage).toBe('cut');
    expect(reduce(state, { type: 'BACK' }).stage).toBe('cut');
    expect(reduce(state, { type: 'SET_SPREAD', spreadId: 'single' }).stage).toBe('cut');
  });

  it('drops stale shuffle callbacks from another operation', () => {
    let state = walkToShuffle();
    state = reduce(state, { type: 'AUTO_SHUFFLE', operationId: 'live' });
    const stale = reduce(state, {
      type: 'SHUFFLE_COMMITTED',
      sessionId: state.sessionId,
      operationId: 'old',
      deckPreCut: fakeDeck(),
      commitFull: 'b'.repeat(64),
      commitShort: 'b'.repeat(16),
    });
    expect(stale.stage).toBe('shuffle');
  });

  it('only enters read after every position is revealed', () => {
    let state = walkToShuffle();
    state = reduce(state, { type: 'AUTO_SHUFFLE', operationId: 'op' });
    state = reduce(state, {
      type: 'SHUFFLE_COMMITTED',
      sessionId: state.sessionId,
      operationId: 'op',
      deckPreCut: fakeDeck(),
      commitFull: 'c'.repeat(64),
      commitShort: 'c'.repeat(16),
    });
    state = reduce(state, { type: 'CONFIRM_CUT' });
    expect(state.stage).toBe('deal');
    state = reduce(state, { type: 'DEAL_DONE' });
    expect(state.stage).toBe('reveal');
    state = reduce(state, { type: 'REVEAL_NEXT' });
    state = reduce(state, { type: 'REVEAL_NEXT' });
    expect(state.stage).toBe('reveal');
    state = reduce(state, { type: 'REVEAL_NEXT' });
    expect(state.stage).toBe('read');
    if (state.stage === 'read') {
      expect(state.draws).toHaveLength(3);
      expect(new Set(state.draws.map((d) => d.cardId)).size).toBe(3);
    }
  });

  it('toggles table/page view without changing draws', () => {
    let state = walkToShuffle();
    state = reduce(state, { type: 'AUTO_SHUFFLE', operationId: 'op' });
    state = reduce(state, {
      type: 'SHUFFLE_COMMITTED',
      sessionId: state.sessionId,
      operationId: 'op',
      deckPreCut: fakeDeck(),
      commitFull: 'c'.repeat(64),
      commitShort: 'c'.repeat(16),
    });
    state = reduce(state, { type: 'CONFIRM_CUT' });
    state = reduce(state, { type: 'DEAL_DONE' });
    state = reduce(state, { type: 'REVEAL_NEXT' });
    state = reduce(state, { type: 'REVEAL_NEXT' });
    state = reduce(state, { type: 'REVEAL_NEXT' });
    expect(state.stage).toBe('read');
    const draws = state.stage === 'read' ? state.draws : [];
    state = reduce(state, { type: 'SET_VIEW', view: 'page' });
    expect(state.stage === 'read' && state.view).toBe('page');
    expect(state.stage === 'read' && state.draws).toEqual(draws);
    state = reduce(state, { type: 'SET_VIEW', view: 'table' });
    expect(state.stage === 'read' && state.view).toBe('table');
  });

  it('abandon confirm starts a new session', () => {
    let state = walkToShuffle();
    const oldId = state.sessionId;
    state = reduce(state, { type: 'ABANDON_REQUEST' });
    state = reduce(state, { type: 'ABANDON_CONFIRM' });
    expect(state.stage).toBe('enter');
    expect(state.sessionId).not.toBe(oldId);
  });
});
