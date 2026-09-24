import { describe, expect, it } from 'vitest';
import { ritualProgress, shouldConfirmLeave, startNavAction } from '@/lib/nav-guard';

describe('ritual navigation guard', () => {
  it('only warns when leaving /read for another section', () => {
    expect(shouldConfirmLeave('/read', '/deck')).toBe(true);
    expect(shouldConfirmLeave('/read', '/about')).toBe(true);
    expect(shouldConfirmLeave('/read', '/read')).toBe(false);
    expect(shouldConfirmLeave('/', '/deck')).toBe(false);
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
