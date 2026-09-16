import { describe, expect, it } from 'vitest';
import { shouldConfirmLeave } from '@/lib/nav-guard';

describe('ritual navigation guard', () => {
  it('only warns when leaving /read for another section', () => {
    expect(shouldConfirmLeave('/read', '/deck')).toBe(true);
    expect(shouldConfirmLeave('/read', '/about')).toBe(true);
    expect(shouldConfirmLeave('/read', '/read')).toBe(false);
    expect(shouldConfirmLeave('/', '/deck')).toBe(false);
  });
});
