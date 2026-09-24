import type { RitualStage } from '@/lib/ritual-machine';

export type RitualProgress = 'idle' | 'in-progress' | 'closed';

export function ritualProgress(stage: RitualStage | null): RitualProgress {
  if (!stage || stage === 'enter') return 'idle';
  if (stage === 'close') return 'closed';
  return 'in-progress';
}

function isRitualPath(path: string): boolean {
  const bare = path.split(/[?#]/)[0] ?? '';
  return bare === '/read';
}

export function startNavAction(input: {
  fromPath: string;
  toPath: string;
  progress: RitualProgress;
}): 'allow' | 'confirm-leave' | 'confirm-restart' {
  if (!isRitualPath(input.fromPath)) return 'allow';
  if (!isRitualPath(input.toPath)) return 'confirm-leave';
  if (input.progress === 'idle') return 'allow';
  return 'confirm-restart';
}

export function shouldConfirmLeave(fromPath: string, toPath: string): boolean {
  if (!fromPath.startsWith('/read')) return false;
  if (toPath.startsWith('/read')) return false;
  return true;
}
