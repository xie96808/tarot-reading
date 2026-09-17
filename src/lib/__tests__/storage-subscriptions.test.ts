import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearHistory, clearSession, historySnapshot, loadSession, saveSession, serverHistorySnapshot,
  serverStorageStatusSnapshot, storageStatusSnapshot, subscribeStorageStatus, parseHistory } from '@/lib/storage';
import { createSession } from '@/lib/ritual-machine';

afterEach(() => { vi.unstubAllGlobals(); clearHistory(); clearSession(); });

describe('storage snapshots', () => {
  it('publishes fallback status and preserves memory writes over stale readable storage', () => {
    const stored = JSON.stringify({ ...createSession(), stage: 'question', question: 'old' });
    vi.stubGlobal('sessionStorage', { getItem: () => stored, setItem: () => { throw new Error('quota'); }, removeItem: () => { throw new Error('quota'); } });
    const listener = vi.fn();
    const unsubscribe = subscribeStorageStatus(listener);
    expect(storageStatusSnapshot()).toBe(false);
    const fresh = createSession();
    expect(saveSession(fresh)).toBe('memory');
    expect(loadSession()).toEqual(fresh);
    expect(storageStatusSnapshot()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    clearSession();
    expect(loadSession()).toBeNull();
    unsubscribe();
  });
  it('has stable serialized snapshots and deterministic server values', () => {
    clearHistory();
    expect(historySnapshot()).toBe(historySnapshot());
    expect(parseHistory(historySnapshot())).toEqual([]);
    expect(serverHistorySnapshot()).toBeNull();
    expect(serverStorageStatusSnapshot()).toBe(false);
    expect(parseHistory('invalid')).toEqual([]);
  });


});
