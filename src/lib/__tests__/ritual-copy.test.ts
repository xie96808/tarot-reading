import { describe, expect, it } from 'vitest';
import { abandonCopy } from '@/lib/ritual-copy';
import type { RitualStage } from '@/lib/ritual-machine';

describe('abandonCopy', () => {
  it('says the deck is not sealed before the cut', () => {
    const early: RitualStage[] = ['question', 'spread', 'shuffle'];
    for (const stage of early) {
      expect(abandonCopy(stage)).toBe('牌序还没有封存。放弃只会结束这一局；现在离开不会丢掉一副已经洗好的牌。');
    }
  });

  it('says the sealed deck cannot be recovered after the cut', () => {
    const late: RitualStage[] = ['cut', 'deal', 'reveal', 'read'];
    for (const stage of late) {
      expect(abandonCopy(stage)).toBe('牌序已经封存。放弃本局将丢掉这副牌，无法恢复。');
    }
  });

  it('has no abandon line on enter or close', () => {
    expect(abandonCopy('enter')).toBe('');
    expect(abandonCopy('close')).toBe('');
  });
});
