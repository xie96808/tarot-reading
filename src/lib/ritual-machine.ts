import type { CardId } from '@/data/card-ids';
import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import { HAND_SCENE_ENABLED, SCENE_PAUSE_ENABLED, type SceneId } from '@/lib/scene';
import { cutDeck, drawTop, type Draw, type Orientation, type ShuffledCard } from '@/lib/shuffle';

export type RitualStage =
  | 'enter'
  | 'question'
  | 'spread'
  | 'shuffle'
  | 'cut'
  | 'deal'
  | 'reveal'
  | 'read'
  | 'close';

export type ShufflePhase = 'idle' | 'holding' | 'committing';

export type ReadingReceipt = {
  sessionId: string;
  spreadId: SpreadId;
  question: string;
  reversals: boolean;
  cutIndex: number;
  commitShort: string;
  draws: Draw[];
  revealedOrder: string[];
  completedAt: number;
  saved: boolean;
  savePrivate: boolean;
  note: string;
};

type Base = {
  sessionId: string;
  question: string;
  spreadId: SpreadId;
  reversals: boolean;
  abandonOpen: boolean;
  sceneId: SceneId | null;
  sceneLocked: boolean;
};

export type RitualSession =
  | (Base & { stage: 'enter' | 'question' | 'spread' })
  | (Base & { stage: 'shuffle'; shufflePhase: ShufflePhase; operationId: string | null })
  | (Base & {
      stage: 'cut';
      operationId: string | null;
      deckPreCut: ShuffledCard[];
      commitFull: string;
      commitShort: string;
      cutIndex: number;
    })
  | (Base & DrawnFields & { stage: 'deal' })
  | (Base & DrawnFields & { stage: 'reveal' })
  | (Base & DrawnFields & { stage: 'read' })
  | (Base & { stage: 'close'; receipt: ReadingReceipt });

type DrawnFields = {
  deckPreCut: ShuffledCard[];
  commitFull: string;
  commitShort: string;
  cutIndex: number;
  draws: Draw[];
  revealed: string[];
  selectedPositionId: string;
  note: string;
  saveDevice: boolean;
  savePrivate: boolean;
  view: 'table' | 'page';
};

export type RitualEvent =
  | { type: 'ACK_ENTER' }
  | { type: 'SET_QUESTION'; question: string }
  | { type: 'SUBMIT_QUESTION' }
  | { type: 'BACK' }
  | { type: 'SET_SPREAD'; spreadId: SpreadId }
  | { type: 'SET_REVERSALS'; reversals: boolean }
  | { type: 'SET_SCENE'; sceneId: SceneId }
  | { type: 'CONFIRM_SPREAD' }
  | { type: 'HOLD_START'; operationId: string }
  | { type: 'HOLD_SAMPLE' }
  | { type: 'HOLD_RELEASE' }
  | { type: 'HOLD_CANCEL' }
  | { type: 'AUTO_SHUFFLE'; operationId: string }
  | { type: 'SHUFFLE_COMMITTED'; sessionId: string; operationId: string; deckPreCut: ShuffledCard[]; commitFull: string; commitShort: string }
  | { type: 'SHUFFLE_FAILED'; sessionId: string; operationId: string }
  | { type: 'SET_CUT'; cutIndex: number }
  | { type: 'AUTO_CUT_REQUEST'; operationId: string }
  | { type: 'AUTO_CUT_DONE'; sessionId: string; operationId: string; cutIndex: number }
  | { type: 'AUTO_CUT_FAILED'; sessionId: string; operationId: string }
  | { type: 'CONFIRM_CUT' }
  | { type: 'DEAL_DONE' }
  | { type: 'SELECT_POSITION'; positionId: string }
  | { type: 'REVEAL_POSITION'; positionId: string }
  | { type: 'REVEAL_NEXT' }
  | { type: 'STEP_SELECTION'; delta: -1 | 1 }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'SET_SAVE_OPTIONS'; saveDevice: boolean; savePrivate: boolean }
  | { type: 'SET_VIEW'; view: 'table' | 'page' }
  | { type: 'CLOSE_ACK' }
  | { type: 'SHARE' }
  | { type: 'NEW_READING' }
  | { type: 'ABANDON_REQUEST' }
  | { type: 'ABANDON_CANCEL' }
  | { type: 'ABANDON_CONFIRM' };

export function createSession(): RitualSession {
  return {
    sessionId: createSessionId(),
    stage: 'enter',
    question: '',
    spreadId: 'three',
    reversals: true,
    abandonOpen: false,
    sceneId: null,
    sceneLocked: false,
  };
}

function createSessionId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `s-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function positions(spreadId: SpreadId) {
  return SPREADS[spreadId].positions;
}

function firstUnrevealed(state: Extract<RitualSession, { stage: 'reveal' }>): string | null {
  return positions(state.spreadId).map((p) => p.id).find((id) => !state.revealed.includes(id)) ?? null;
}

export function reduce(
  state: RitualSession,
  event: RitualEvent,
  options: { scenePause?: boolean } = { scenePause: SCENE_PAUSE_ENABLED },
): RitualSession {
  const scenePause = options.scenePause === true;
  if (event.type === 'ABANDON_REQUEST' && state.stage !== 'close' && state.stage !== 'enter') {
    return { ...state, abandonOpen: true };
  }
  if (event.type === 'ABANDON_CANCEL') {
    return { ...state, abandonOpen: false };
  }
  if (event.type === 'ABANDON_CONFIRM' && state.abandonOpen) {
    return createSession();
  }

  switch (state.stage) {
    case 'enter':
      if (event.type === 'ACK_ENTER') return { ...state, stage: 'question' };
      return state;
    case 'question':
      if (event.type === 'SET_QUESTION') return { ...state, question: event.question };
      if (event.type === 'SUBMIT_QUESTION') return { ...state, stage: 'spread' };
      if (event.type === 'BACK') return { ...state, stage: 'enter' };
      return state;
    case 'spread':
      if (event.type === 'SET_SPREAD') return { ...state, spreadId: event.spreadId };
      if (event.type === 'SET_REVERSALS') return { ...state, reversals: event.reversals };
      if (event.type === 'BACK') return { ...state, stage: 'question' };
      if (event.type === 'SET_SCENE') {
        if (!scenePause || state.sceneLocked || (event.sceneId === 'hand' && !HAND_SCENE_ENABLED)) return state;
        return { ...state, sceneId: event.sceneId };
      }
      if (event.type === 'CONFIRM_SPREAD') {
        if (scenePause && state.spreadId === 'three') {
          if (state.sceneId === null) return state;
          return { ...state, stage: 'shuffle', shufflePhase: 'idle', operationId: null, sceneLocked: true };
        }
        return { ...state, stage: 'shuffle', shufflePhase: 'idle', operationId: null };
      }
      return state;
    case 'shuffle':
      return reduceShuffle(state, event);
    case 'cut':
      return reduceCut(state, event);
    case 'deal':
      if (event.type === 'DEAL_DONE') return { ...state, stage: 'reveal' };
      return state;
    case 'reveal':
      return reduceReveal(state, event);
    case 'read':
      if (event.type === 'SET_NOTE') return { ...state, note: event.note };
      if (event.type === 'SET_SAVE_OPTIONS') {
        const coupled = coupleSaveOptions(
          { saveDevice: state.saveDevice, savePrivate: state.savePrivate },
          { saveDevice: event.saveDevice, savePrivate: event.savePrivate },
        );
        return { ...state, saveDevice: coupled.saveDevice, savePrivate: coupled.savePrivate };
      }
      if (event.type === 'SET_VIEW') return { ...state, view: event.view };
      if (event.type === 'CLOSE_ACK') {
        const keepPrivate = state.savePrivate;
        const receipt: ReadingReceipt = {
          sessionId: state.sessionId,
          spreadId: state.spreadId,
          question: keepPrivate ? state.question : '',
          reversals: state.reversals,
          cutIndex: state.cutIndex,
          commitShort: state.commitShort,
          draws: state.draws,
          revealedOrder: state.revealed,
          completedAt: Date.now(),
          saved: state.saveDevice,
          savePrivate: state.savePrivate,
          note: keepPrivate ? state.note : '',
        };
        return {
          sessionId: state.sessionId,
          stage: 'close',
          // Session resume/share UI can still show the live question; receipt is what history persists.
          question: state.question,
          spreadId: state.spreadId,
          reversals: state.reversals,
          abandonOpen: false,
          sceneId: state.sceneId,
          sceneLocked: state.sceneLocked,
          receipt,
        };
      }
      return state;
    case 'close':
      if (event.type === 'NEW_READING') return createSession();
      return state;
    default:
      return state;
  }
}

function reduceShuffle(
  state: Extract<RitualSession, { stage: 'shuffle' }>,
  event: RitualEvent,
): RitualSession {
  if (state.shufflePhase === 'idle') {
    if (event.type === 'BACK') return { ...state, stage: 'spread' };
    if (event.type === 'HOLD_START') {
      return { ...state, shufflePhase: 'holding', operationId: event.operationId };
    }
    if (event.type === 'AUTO_SHUFFLE') {
      return { ...state, shufflePhase: 'committing', operationId: event.operationId };
    }
    return state;
  }
  if (state.shufflePhase === 'holding') {
    if (event.type === 'HOLD_SAMPLE') return state;
    if (event.type === 'HOLD_CANCEL') {
      return { ...state, shufflePhase: 'idle', operationId: null };
    }
    if (event.type === 'HOLD_RELEASE') {
      return { ...state, shufflePhase: 'committing' };
    }
    return state;
  }
  if (event.type === 'SHUFFLE_COMMITTED') {
    if (event.sessionId !== state.sessionId || event.operationId !== state.operationId) return state;
    return {
      sessionId: state.sessionId,
      stage: 'cut',
      question: state.question,
      spreadId: state.spreadId,
      reversals: state.reversals,
      abandonOpen: false,
      sceneId: state.sceneId,
      sceneLocked: state.sceneLocked,
      operationId: null,
      deckPreCut: event.deckPreCut,
      commitFull: event.commitFull,
      commitShort: event.commitShort,
      cutIndex: 39,
    };
  }
  if (event.type === 'SHUFFLE_FAILED') {
    if (event.sessionId !== state.sessionId || event.operationId !== state.operationId) return state;
    return { ...state, shufflePhase: 'idle', operationId: null };
  }
  return state;
}

function reduceCut(
  state: Extract<RitualSession, { stage: 'cut' }>,
  event: RitualEvent,
): RitualSession {
  if (event.type === 'SET_CUT' && !state.operationId) {
    if (!Number.isInteger(event.cutIndex) || event.cutIndex < 1 || event.cutIndex > 77) return state;
    return { ...state, cutIndex: event.cutIndex };
  }
  if (event.type === 'AUTO_CUT_REQUEST') {
    return { ...state, operationId: event.operationId };
  }
  if (event.type === 'AUTO_CUT_DONE') {
    if (event.sessionId !== state.sessionId || event.operationId !== state.operationId) return state;
    return { ...state, operationId: null, cutIndex: event.cutIndex };
  }
  if (event.type === 'AUTO_CUT_FAILED') {
    if (event.sessionId !== state.sessionId || event.operationId !== state.operationId) return state;
    return { ...state, operationId: null };
  }
  if (event.type === 'CONFIRM_CUT' && !state.operationId) {
    const deck = cutDeck(state.deckPreCut, state.cutIndex);
    const draws = drawTop(
      deck,
      positions(state.spreadId).map((p) => p.id),
    );
    return {
      sessionId: state.sessionId,
      stage: 'deal',
      question: state.question,
      spreadId: state.spreadId,
      reversals: state.reversals,
      abandonOpen: false,
      sceneId: state.sceneId,
      sceneLocked: state.sceneLocked,
      deckPreCut: state.deckPreCut,
      commitFull: state.commitFull,
      commitShort: state.commitShort,
      cutIndex: state.cutIndex,
      draws,
      revealed: [],
      selectedPositionId: draws[0].positionId,
      note: '',
      saveDevice: false,
      savePrivate: false,
      view: 'table',
    };
  }
  return state;
}

function reduceReveal(
  state: Extract<RitualSession, { stage: 'reveal' }>,
  event: RitualEvent,
): RitualSession {
  if (state.stage !== 'reveal') return state;
  const valid = new Set(state.draws.map((d) => d.positionId));
  if (event.type === 'SELECT_POSITION' && valid.has(event.positionId)) {
    return { ...state, selectedPositionId: event.positionId };
  }
  if (event.type === 'REVEAL_POSITION' && valid.has(event.positionId)) {
    const revealed = state.revealed.includes(event.positionId)
      ? state.revealed
      : [...state.revealed, event.positionId];
    const next: Extract<RitualSession, { stage: 'reveal' | 'read' }> = {
      ...state,
      revealed,
      selectedPositionId: event.positionId,
      stage: revealed.length === state.draws.length ? 'read' : 'reveal',
    };
    return next;
  }
  if (event.type === 'STEP_SELECTION') {
    return {
      ...state,
      selectedPositionId: stepPositionId(state.spreadId, state.selectedPositionId, event.delta),
    };
  }
  if (event.type === 'REVEAL_NEXT') {
    const selectedOpen = valid.has(state.selectedPositionId) && !state.revealed.includes(state.selectedPositionId)
      ? state.selectedPositionId
      : null;
    const nextId = selectedOpen ?? firstUnrevealed(state);
    if (!nextId) return state;
    return reduceReveal(state, { type: 'REVEAL_POSITION', positionId: nextId });
  }
  if (event.type === 'SET_VIEW') return { ...state, view: event.view };
  return state;
}

export function persistable(state: RitualSession): RitualSession {
  if (state.stage === 'shuffle') {
    return { ...state, shufflePhase: 'idle', operationId: null, abandonOpen: false };
  }
  if (state.stage === 'cut') {
    return { ...state, operationId: null, abandonOpen: false };
  }
  if (state.stage === 'read') {
    const flags = normalizeSaveOptions(state);
    return { ...state, abandonOpen: false, saveDevice: flags.saveDevice, savePrivate: flags.savePrivate };
  }
  return { ...state, abandonOpen: false };
}

export function stepPositionId(spreadId: SpreadId, currentId: string, delta: -1 | 1): string {
  const ids = SPREADS[spreadId].positions.map((position) => position.id);
  const index = Math.max(0, ids.indexOf(currentId));
  const next = index + delta;
  if (next < 0 || next >= ids.length) return ids[index] ?? ids[0];
  return ids[next];
}

export function seedSession(spreadId: SpreadId | null): RitualSession {
  const session = createSession();
  return { ...session, spreadId: spreadId ?? 'three' };
}

export function coupleSaveOptions(
  prev: { saveDevice: boolean; savePrivate: boolean },
  next: { saveDevice: boolean; savePrivate: boolean },
): { saveDevice: boolean; savePrivate: boolean } {
  if (!prev.savePrivate && next.savePrivate) return { saveDevice: true, savePrivate: true };
  if (prev.saveDevice && !next.saveDevice) return { saveDevice: false, savePrivate: false };
  if (!next.saveDevice) return { saveDevice: false, savePrivate: false };
  return { saveDevice: true, savePrivate: next.savePrivate };
}

export function normalizeSaveOptions(input: { saveDevice: boolean; savePrivate: boolean }): {
  saveDevice: boolean;
  savePrivate: boolean;
} {
  if (input.savePrivate && !input.saveDevice) return { saveDevice: true, savePrivate: true };
  if (!input.saveDevice) return { saveDevice: false, savePrivate: false };
  return { saveDevice: input.saveDevice, savePrivate: input.savePrivate };
}

export function canResume(session: RitualSession | null): session is RitualSession {
  return Boolean(session && session.stage !== 'enter');
}

export type OrientationName = Orientation;
export type CardName = CardId;
