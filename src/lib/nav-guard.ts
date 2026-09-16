export function shouldConfirmLeave(fromPath: string, toPath: string): boolean {
  if (!fromPath.startsWith('/read')) return false;
  if (toPath.startsWith('/read')) return false;
  return true;
}
