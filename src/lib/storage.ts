import { HISTORY_LIMIT, HISTORY_STORAGE_KEY, SESSION_STORAGE_KEY } from '@/config/site';
import type { ReadingReceipt, RitualSession } from '@/lib/ritual-machine';

export type HistoryEntry = {
  receipt: ReadingReceipt;
  question?: string;
  note?: string;
  savedAt: number;
};

type MemoryStore = Map<string, string>;

function memory(): MemoryStore {
  const g = globalThis as typeof globalThis & { __tarotMemory?: MemoryStore };
  if (!g.__tarotMemory) g.__tarotMemory = new Map();
  return g.__tarotMemory;
}

function readStore(kind: 'session' | 'local', key: string): string | null {
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
      return 'ok';
    }
  } catch {
    /* fall through */
  }
  const mem = memory();
  const memKey = `${kind}:${key}`;
  if (value === null) mem.delete(memKey);
  else mem.set(memKey, value);
  return 'memory';
}

export function saveSession(state: RitualSession): 'ok' | 'memory' {
  return writeStore('session', SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function loadSession(): RitualSession | null {
  const raw = readStore('session', SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RitualSession;
    if (!parsed || typeof parsed !== 'object' || !('stage' in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  writeStore('session', SESSION_STORAGE_KEY, null);
}

export function loadHistory(): HistoryEntry[] {
  const raw = readStore('local', HISTORY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const current = loadHistory().filter((item) => item.receipt.sessionId !== entry.receipt.sessionId);
  const next = [entry, ...current].slice(0, HISTORY_LIMIT);
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
