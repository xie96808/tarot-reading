import { describe, expect, it } from 'vitest';
import { faceImageRotation, netCardRotation } from '@/lib/transforms';

describe('celtic transforms', () => {
  it('keeps upright crossing at 90 and reversed crossing at 270', () => {
    expect(netCardRotation(false, false)).toBe(0);
    expect(netCardRotation(false, true)).toBe(180);
    expect(netCardRotation(true, false)).toBe(90);
    expect(netCardRotation(true, true)).toBe(270);
  });
});

describe('reversed face auto-upright', () => {
  it('shows reversed cards as-dealt then readable without losing the reversed meaning', () => {
    expect(faceImageRotation(false, 'as-dealt')).toBe(0);
    expect(faceImageRotation(false, 'readable')).toBe(0);
    expect(faceImageRotation(true, 'as-dealt')).toBe(180);
    expect(faceImageRotation(true, 'readable')).toBe(0);
  });
});
