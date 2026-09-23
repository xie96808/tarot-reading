export type LeaveGuardStage = string | null | undefined;

/** Confirm leaving /read only while a ritual is in progress (not after close / at enter). */
export function shouldConfirmLeave(
  fromPath: string,
  toPath: string,
  stage: LeaveGuardStage = null,
): boolean {
  if (!fromPath.startsWith('/read')) return false;
  if (toPath.startsWith('/read')) return false;
  if (stage === 'close' || stage === 'enter') return false;
  // Unknown stage (e.g. no session yet on /read): still warn — safer for in-progress.
  return true;
}
