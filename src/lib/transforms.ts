export function crossingSlotRotation(): number {
  return 90;
}

export function orientationRotation(reversed: boolean): number {
  return reversed ? 180 : 0;
}

export function netCardRotation(crossing: boolean, reversed: boolean): number {
  return ((crossing ? crossingSlotRotation() : 0) + orientationRotation(reversed)) % 360;
}
