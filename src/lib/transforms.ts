export type FaceView = 'as-dealt' | 'readable';

export function crossingSlotRotation(): number {
  return 90;
}

export function orientationRotation(reversed: boolean): number {
  return reversed ? 180 : 0;
}

export function netCardRotation(crossing: boolean, reversed: boolean): number {
  return ((crossing ? crossingSlotRotation() : 0) + orientationRotation(reversed)) % 360;
}

/** Rotation applied to the painted face after the card is on the table. */
export function faceImageRotation(reversed: boolean, view: FaceView): 0 | 180 {
  if (!reversed) return 0;
  return view === 'as-dealt' ? 180 : 0;
}
