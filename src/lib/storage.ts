import { HISTORY_LIMIT, HISTORY_STORAGE_KEY, SESSION_STORAGE_KEY } from '@/config/site';
import type { ReadingReceipt, RitualSession } from '@/lib/ritual-machine';

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

export function normalizeSession(session: RitualSession): RitualSession {
  const raw = session as RitualSession & { sceneId?: unknown; sceneLocked?: unknown };
  const sceneId = raw.sceneId === 'door' || raw.sceneId === 'hand' ? raw.sceneId : null;
  const sceneLocked = raw.sceneLocked === true;
  return { ...session, sceneId, sceneLocked };
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
    receipt: { ...entry.receipt, question: '', note: '' },
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
