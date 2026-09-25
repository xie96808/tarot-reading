import { HISTORY_LIMIT, HISTORY_STORAGE_KEY, SESSION_STORAGE_KEY } from '@/config/site';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import type { PauseAnswer, PauseDraft, PauseIndex, ReadingReceipt, RitualSession } from '@/lib/ritual-machine';

export type HistoryEntry = {
  receipt: ReadingReceipt;
  question?: string;
  note?: string;
  savedAt: number;
};

const historyListeners = new Set<() => void>();
const statusListeners = new Set<() => void>();
let storageFallback = false;

export function subscribeStorageStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => { statusListeners.delete(listener); };
}

export const storageStatusSnapshot = () => storageFallback;
export const serverStorageStatusSnapshot = () => false;
export const historySnapshot = () => readStore('local', HISTORY_STORAGE_KEY);
export const serverHistorySnapshot = () => null;

export function subscribeHistory(listener: () => void): () => void {
  historyListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    try {
      if (event.storageArea === window.localStorage && (event.key === HISTORY_STORAGE_KEY || event.key === null)) listener();
    } catch { /* Storage is disabled; same-tab memory notifications still work. */ }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    historyListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function notifyWrite(kind: 'session' | 'local', key: string, fallback: boolean) {
  if (fallback && !storageFallback) {
    storageFallback = true;
    statusListeners.forEach((listener) => listener());
  }
  if (kind === 'local' && key === HISTORY_STORAGE_KEY) historyListeners.forEach((listener) => listener());
}

type MemoryStore = Map<string, string | null>;

function memory(): MemoryStore {
  const g = globalThis as typeof globalThis & { __tarotMemory?: MemoryStore };
  if (!g.__tarotMemory) g.__tarotMemory = new Map();
  return g.__tarotMemory;
}

function readStore(kind: 'session' | 'local', key: string): string | null {
  const memKey = `${kind}:${key}`;
  if (memory().has(memKey)) return memory().get(memKey) ?? null;
  try {
    const store = kind === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
    if (store) return store.getItem(key);
  } catch {
    /* quota / private mode */
  }
  return memory().get(`${kind}:${key}`) ?? null;
}

function writeStore(kind: 'session' | 'local', key: string, value: string | null): 'ok' | 'memory' {
  try {
    const store = kind === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
    if (store) {
      if (value === null) store.removeItem(key);
      else store.setItem(key, value);
      memory().delete(`${kind}:${key}`);
      notifyWrite(kind, key, false);
      return 'ok';
    }
  } catch {
    /* fall through */
  }
  const mem = memory();
  const memKey = `${kind}:${key}`;
  mem.set(memKey, value);
  notifyWrite(kind, key, true);
  return 'memory';
}

export function saveSession(state: RitualSession): 'ok' | 'memory' {
  return writeStore('session', SESSION_STORAGE_KEY, JSON.stringify(state));
}

const SESSION_STAGES = new Set([
  'enter',
  'question',
  'spread',
  'shuffle',
  'cut',
  'deal',
  'reveal',
  'read',
  'close',
]);

function isValidSession(value: unknown): value is RitualSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  if (typeof session.sessionId !== 'string' || !session.sessionId) return false;
  if (typeof session.stage !== 'string' || !SESSION_STAGES.has(session.stage)) return false;
  if (typeof session.question !== 'string') return false;
  if (typeof session.spreadId !== 'string') return false;
  if (typeof session.reversals !== 'boolean') return false;
  if (typeof session.abandonOpen !== 'boolean') return false;
  if (session.stage === 'shuffle') {
    if (session.shufflePhase !== 'idle' && session.shufflePhase !== 'holding' && session.shufflePhase !== 'committing') {
      return false;
    }
  }
  if (session.stage === 'cut' || session.stage === 'deal' || session.stage === 'reveal' || session.stage === 'read') {
    if (!Array.isArray(session.deckPreCut) || typeof session.commitShort !== 'string') return false;
  }
  if (session.stage === 'deal' || session.stage === 'reveal' || session.stage === 'read') {
    if (!Array.isArray(session.draws) || !Array.isArray(session.revealed)) return false;
  }
  if (session.stage === 'close') {
    const receipt = session.receipt;
    if (!receipt || typeof receipt !== 'object') return false;
    const r = receipt as Record<string, unknown>;
    if (typeof r.sessionId !== 'string' || !Array.isArray(r.draws)) return false;
  }
  return true;
}

function isPauseIndex(value: unknown): value is PauseIndex {
  return value === 1 || value === 2;
}

function positionForIndex(index: PauseIndex): 'past' | 'present' {
  return index === 1 ? 'past' : 'present';
}

function isPauseDraft(value: unknown): value is PauseDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  if (!isPauseIndex(draft.index)) return false;
  if (draft.positionId !== positionForIndex(draft.index)) return false;
  if (draft.phase !== 'choosing' && draft.phase !== 'writing') return false;
  if (draft.actionId !== null && typeof draft.actionId !== 'string') return false;
  if (typeof draft.custom !== 'string') return false;
  return true;
}

function isPauseAnswer(value: unknown): value is PauseAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as Record<string, unknown>;
  if (!isPauseIndex(answer.index)) return false;
  if (answer.positionId !== positionForIndex(answer.index)) return false;
  if (answer.kind === 'skip' || answer.kind === 'missing') return true;
  if (answer.kind !== 'action') return false;
  return typeof answer.actionId === 'string' && answer.actionId.length > 0 && typeof answer.custom === 'string';
}

function readAnswers(value: unknown): { answers: PauseAnswer[]; bad: boolean } {
  if (value === undefined) return { answers: [], bad: false };
  if (!Array.isArray(value) || !value.every(isPauseAnswer)) return { answers: [], bad: true };
  const indexes = new Set(value.map((answer) => answer.index));
  if (indexes.size !== value.length) return { answers: [], bad: true };
  return { answers: value, bad: false };
}

function readPauseFields(raw: Record<string, unknown>, sceneLocked: boolean): {
  pause: PauseDraft | null;
  pauseAnswers: PauseAnswer[];
} {
  const pauseBad = raw.pause != null && !isPauseDraft(raw.pause);
  const answers = readAnswers(raw.pauseAnswers);
  if (pauseBad || answers.bad) return { pause: null, pauseAnswers: [] };
  return {
    pause: sceneLocked && isPauseDraft(raw.pause) ? raw.pause : null,
    pauseAnswers: answers.answers,
  };
}

function spreadFullyRevealed(session: Extract<RitualSession, { stage: 'reveal' }>): boolean {
  const spread = SPREADS[session.spreadId as keyof typeof SPREADS];
  if (!spread || !Array.isArray(session.revealed)) return false;
  return spread.positions.every((position) => session.revealed.includes(position.id));
}

export function normalizeSession(session: RitualSession): RitualSession {
  const raw = session as RitualSession & Record<string, unknown>;
  const sceneId = raw.sceneId === 'door' || raw.sceneId === 'hand' ? raw.sceneId : null;
  const sceneLocked = raw.sceneLocked === true;
  const { pause, pauseAnswers } = readPauseFields(raw, sceneLocked);
  const keptPauseIndex = raw.keptPauseIndex === 1 || raw.keptPauseIndex === 2 ? raw.keptPauseIndex : null;
  const futureBeat = raw.futureBeat === 'open' ? 'open' : null;
  if (session.stage === 'reveal' && spreadFullyRevealed(session)) {
    // A fully revealed spread stuck on reveal has no flip button and no reading.
    return { ...session, sceneId, sceneLocked, pause, pauseAnswers, keptPauseIndex, stage: 'read', futureBeat: null };
  }
  return { ...session, sceneId, sceneLocked, pause, pauseAnswers, keptPauseIndex, futureBeat };
}

export function loadSession(): RitualSession | null {
  const raw = readStore('session', SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSession(parsed)) {
      writeStore('session', SESSION_STORAGE_KEY, null);
      return null;
    }
    return normalizeSession(parsed);
  } catch {
    writeStore('session', SESSION_STORAGE_KEY, null);
    return null;
  }
}

export function clearSession(): void {
  writeStore('session', SESSION_STORAGE_KEY, null);
}

export function loadHistory(): HistoryEntry[] {
  return parseHistory(historySnapshot());
}

export function parseHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeHistoryEntry(entry: HistoryEntry): HistoryEntry {
  if (entry.receipt.savePrivate) return entry;
  return {
    ...entry,
    question: undefined,
    note: undefined,
    receipt: {
      ...entry.receipt,
      question: '',
      note: '',
      sceneId: null,
      pauseAnswers: [],
      keptPauseIndex: null,
    },
  };
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const sanitized = sanitizeHistoryEntry(entry);
  const current = loadHistory().filter((item) => item.receipt.sessionId !== sanitized.receipt.sessionId);
  const next = [sanitized, ...current].slice(0, HISTORY_LIMIT);
  writeStore('local', HISTORY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeHistory(sessionId: string): HistoryEntry[] {
  const next = loadHistory().filter((item) => item.receipt.sessionId !== sessionId);
  writeStore('local', HISTORY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  writeStore('local', HISTORY_STORAGE_KEY, null);
}
