import { describe, expect, it, vi } from 'vitest';
import { focusableIn, trapTab } from '@/lib/a11y';

function fakeRoot(ids: string[], disabled: string[] = []) {
  const nodes = ids.map((id) => ({
    id,
    hasAttribute: (name: string) => name === 'hidden' && disabled.includes(id),
    focus: vi.fn(),
  }));
  return {
    querySelectorAll: () => nodes,
  } as unknown as HTMLElement;
}

describe('modal focus helpers', () => {
  it('drops hidden controls', () => {
    const items = focusableIn(fakeRoot(['a', 'b'], ['b']));
    expect(items.map((el) => el.id)).toEqual(['a']);
  });

  it('cycles Tab from last to first', () => {
    const root = fakeRoot(['a', 'c']);
    const items = focusableIn(root);
    const prevent = vi.fn();
    vi.stubGlobal('document', { activeElement: items[1] });
    trapTab({ key: 'Tab', shiftKey: false, preventDefault: prevent } as unknown as KeyboardEvent, root);
    expect(prevent).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
