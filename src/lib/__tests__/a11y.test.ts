import { describe, expect, it, vi } from 'vitest';
import { focusableIn, trapTab } from '@/lib/a11y';

function fakeRoot(
  ids: string[],
  opts: { hidden?: string[]; ariaHidden?: string[]; inertClosest?: string[] } = {},
) {
  const hidden = new Set(opts.hidden ?? []);
  const ariaHidden = new Set(opts.ariaHidden ?? []);
  const inertClosest = new Set(opts.inertClosest ?? []);
  const nodes = ids.map((id) => ({
    id,
    hasAttribute: (name: string) => name === 'hidden' && hidden.has(id),
    getAttribute: (name: string) => (name === 'aria-hidden' && ariaHidden.has(id) ? 'true' : null),
    closest: (sel: string) => {
      if (sel.includes('aria-hidden') && ariaHidden.has(id)) return {};
      if (sel.includes('inert') && inertClosest.has(id)) return {};
      if (sel.includes('[hidden]') && hidden.has(id)) return {};
      return null;
    },
    focus: vi.fn(),
  }));
  return {
    querySelectorAll: () => nodes,
  } as unknown as HTMLElement;
}

describe('modal focus helpers', () => {
  it('drops hidden, aria-hidden, and inert controls', () => {
    const items = focusableIn(
      fakeRoot(['a', 'b', 'c', 'd'], {
        hidden: ['b'],
        ariaHidden: ['c'],
        inertClosest: ['d'],
      }),
    );
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
