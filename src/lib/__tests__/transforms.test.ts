import { describe, expect, it } from 'vitest';
import { netCardRotation } from '@/lib/transforms';

describe('celtic transforms', () => {
  it('keeps upright crossing at 90 and reversed crossing at 270', () => {
    expect(netCardRotation(false, false)).toBe(0);
    expect(netCardRotation(false, true)).toBe(180);
    expect(netCardRotation(true, false)).toBe(90);
    expect(netCardRotation(true, true)).toBe(270);
  });
});
