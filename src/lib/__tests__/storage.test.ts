import { beforeEach, describe, expect, it } from 'vitest';
import { createSession } from '@/lib/ritual-machine';
import { clearHistory, loadHistory, pushHistory } from '@/lib/storage';

describe('history', () => {
  beforeEach(() => {
    clearHistory();
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
      },
      savedAt: 99,
    });
    const history = loadHistory();
    expect(history).toHaveLength(20);
    expect(history[0].receipt.sessionId).toBe('s-24');
    expect(history.filter((h) => h.receipt.sessionId === 's-24')).toHaveLength(1);
    expect(base.stage).toBe('enter');
  });
});
