import { describe, expect, it } from 'vitest';
import { shouldConfirmLeave } from '@/lib/nav-guard';

describe('ritual navigation guard', () => {
  it('only warns when leaving /read for another section while in progress', () => {
    expect(shouldConfirmLeave('/read', '/deck', 'shuffle')).toBe(true);
    expect(shouldConfirmLeave('/read', '/about', 'read')).toBe(true);
    expect(shouldConfirmLeave('/read', '/read', 'shuffle')).toBe(false);
    expect(shouldConfirmLeave('/', '/deck', 'shuffle')).toBe(false);
  });

  it('does not confirm after ritual close or at enter', () => {
    expect(shouldConfirmLeave('/read', '/deck', 'close')).toBe(false);
    expect(shouldConfirmLeave('/read', '/', 'enter')).toBe(false);
  });
});
