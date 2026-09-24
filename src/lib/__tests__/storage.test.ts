import { beforeEach, describe, expect, it } from 'vitest';
import { SESSION_STORAGE_KEY } from '@/config/site';
import { createSession } from '@/lib/ritual-machine';
import { clearHistory, clearSession, loadHistory, loadSession, pushHistory, saveSession } from '@/lib/storage';

describe('history', () => {
  beforeEach(() => {
    clearHistory();
    clearSession();
  });

  it('dedupes by sessionId and keeps 20', () => {
    const base = createSession();
    for (let i = 0; i < 25; i += 1) {
      pushHistory({
        receipt: {
          sessionId: `s-${i}`,
          spreadId: 'single',
          question: '',
          reversals: true,
          cutIndex: 1,
          commitShort: 'a'.repeat(16),
          draws: [],
          revealedOrder: [],
          completedAt: i,
          saved: true,
          savePrivate: false,
          note: '',
          sceneId: null,
          pauseAnswers: [],
          keptPauseIndex: null,
        },
        savedAt: i,
      });
    }
    expect(loadHistory()).toHaveLength(20);
    pushHistory({
      receipt: {
        sessionId: 's-24',
        spreadId: 'three',
        question: '',
        reversals: true,
        cutIndex: 2,
        commitShort: 'b'.repeat(16),
        draws: [],
        revealedOrder: [],
        completedAt: 99,
        saved: true,
        savePrivate: false,
        note: '',
        sceneId: null,
        pauseAnswers: [],
        keptPauseIndex: null,
      },
      savedAt: 99,
    });
    const history = loadHistory();
    expect(history).toHaveLength(20);
    expect(history[0].receipt.sessionId).toBe('s-24');
    expect(history.filter((h) => h.receipt.sessionId === 's-24')).toHaveLength(1);
    expect(base.stage).toBe('enter');
  });

  it('strips question and note from nested receipt when savePrivate is false', () => {
    pushHistory({
      receipt: {
        sessionId: 'priv-1',
        spreadId: 'single',
        question: '秘密问题',
        reversals: true,
        cutIndex: 1,
        commitShort: 'c'.repeat(16),
        draws: [],
        revealedOrder: [],
        completedAt: 1,
        saved: true,
        savePrivate: false,
        note: '秘密留笺',
        sceneId: null,
        pauseAnswers: [],
        keptPauseIndex: null,
      },
      question: '秘密问题',
      note: '秘密留笺',
      savedAt: 1,
    });
    const [entry] = loadHistory();
    expect(entry.question).toBeUndefined();
    expect(entry.note).toBeUndefined();
    expect(entry.receipt.question).toBe('');
    expect(entry.receipt.note).toBe('');
    expect(entry.receipt.savePrivate).toBe(false);
  });

  it('keeps question and note when savePrivate is true', () => {
    pushHistory({
      receipt: {
        sessionId: 'priv-2',
        spreadId: 'single',
        question: '可保存',
        reversals: true,
        cutIndex: 1,
        commitShort: 'd'.repeat(16),
        draws: [],
        revealedOrder: [],
        completedAt: 2,
        saved: true,
        savePrivate: true,
        note: '留笺',
        sceneId: null,
        pauseAnswers: [],
        keptPauseIndex: null,
      },
      question: '可保存',
      note: '留笺',
      savedAt: 2,
    });
    const [entry] = loadHistory();
    expect(entry.question).toBe('可保存');
    expect(entry.note).toBe('留笺');
    expect(entry.receipt.question).toBe('可保存');
  });

  it('strips pause answers and custom text from a non-private receipt', () => {
    pushHistory({
      receipt: {
        sessionId: 'priv-3',
        spreadId: 'three',
        question: '秘密问题',
        reversals: true,
        cutIndex: 1,
        commitShort: 'e'.repeat(16),
        draws: [],
        revealedOrder: [],
        completedAt: 3,
        saved: true,
        savePrivate: false,
        note: '秘密留笺',
        sceneId: 'door',
        pauseAnswers: [
          { index: 1, positionId: 'past', kind: 'action', actionId: 'name', custom: '自写不该留下' },
        ],
        keptPauseIndex: 1,
      },
      question: '秘密问题',
      note: '秘密留笺',
      savedAt: 3,
    });
    const [entry] = loadHistory();
    expect(entry.receipt.sceneId).toBeNull();
    expect(entry.receipt.pauseAnswers).toEqual([]);
    expect(entry.receipt.keptPauseIndex).toBeNull();
    expect(JSON.stringify(entry)).not.toContain('自写不该留下');
  });
});

describe('loadSession validation', () => {
  beforeEach(() => {
    clearSession();
  });

  it('clears corrupt session payloads instead of crashing', () => {
    const mem = globalThis as typeof globalThis & { __tarotMemory?: Map<string, string | null> };
    if (!mem.__tarotMemory) mem.__tarotMemory = new Map();
    mem.__tarotMemory.set(`session:${SESSION_STORAGE_KEY}`, '{"stage":"nope"}');
    expect(loadSession()).toBeNull();

    mem.__tarotMemory.set(
      `session:${SESSION_STORAGE_KEY}`,
      JSON.stringify({ ...createSession(), stage: 'cut' }),
    );
    expect(loadSession()).toBeNull();

    const ok = createSession();
    saveSession(ok);
    expect(loadSession()).toEqual(ok);
  });
});
