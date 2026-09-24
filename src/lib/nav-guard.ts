import type { RitualStage } from '@/lib/ritual-machine';

export type RitualProgress = 'idle' | 'in-progress' | 'closed';
export type LeaveGuardStage = string | null | undefined;

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

/** Confirm leaving /read only while a ritual is in progress (not after close / at enter). */
export function shouldConfirmLeave(
  fromPath: string,
  toPath: string,
  stage: LeaveGuardStage = null,
): boolean {
  if (!fromPath.startsWith('/read')) return false;
  if (toPath.startsWith('/read')) return false;
  if (stage === 'close' || stage === 'enter') return false;
  return true;
}
