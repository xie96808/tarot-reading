import { describe, expect, it } from 'vitest';
import { ritualProgress, shouldConfirmLeave, startNavAction } from '@/lib/nav-guard';

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

  it('classifies ritual progress', () => {
    expect(ritualProgress(null)).toBe('idle');
    expect(ritualProgress('enter')).toBe('idle');
    expect(ritualProgress('question')).toBe('in-progress');
    expect(ritualProgress('shuffle')).toBe('in-progress');
    expect(ritualProgress('reveal')).toBe('in-progress');
    expect(ritualProgress('close')).toBe('closed');
  });

  it('restarts only on the live ritual path', () => {
    expect(startNavAction({ fromPath: '/read', toPath: '/read', progress: 'idle' })).toBe('allow');
    expect(startNavAction({ fromPath: '/read', toPath: '/read', progress: 'in-progress' })).toBe('confirm-restart');
    expect(startNavAction({ fromPath: '/read', toPath: '/read', progress: 'closed' })).toBe('confirm-restart');
    expect(startNavAction({ fromPath: '/read?spread=celtic', toPath: '/read', progress: 'in-progress' })).toBe('confirm-restart');
    expect(startNavAction({ fromPath: '/read/preview', toPath: '/read', progress: 'in-progress' })).toBe('allow');
    expect(startNavAction({ fromPath: '/read', toPath: '/deck', progress: 'in-progress' })).toBe('confirm-leave');
    expect(startNavAction({ fromPath: '/deck', toPath: '/read', progress: 'in-progress' })).toBe('allow');
  });
});
