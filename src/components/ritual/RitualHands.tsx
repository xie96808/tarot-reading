'use client';

import {
  CUT_HAND_SRC,
  SHUFFLE_HAND_SRC,
  type CutHandFrame,
  type ShuffleHandFrame,
} from '@/lib/table-hands';
import styles from './RitualHands.module.css';

type ShuffleHandsProps = {
  frame: ShuffleHandFrame;
};

export function ShuffleHands({ frame }: ShuffleHandsProps) {
  return <HandPicture kind="shuffle" frame={frame} z={frame === 'seal' ? 'over' : 'under'} />;
}

type CutHandsProps = {
  frame: CutHandFrame;
};

export function CutHands({ frame }: CutHandsProps) {
  return <HandPicture kind="cut" frame={frame} z={frame === 'press' ? 'over' : 'under'} />;
}

function HandPicture({
  kind,
  frame,
  z,
}: {
  kind: 'shuffle' | 'cut';
  frame: ShuffleHandFrame | CutHandFrame;
  z: 'under' | 'over';
}) {
  const src =
    kind === 'shuffle'
      ? SHUFFLE_HAND_SRC[frame as ShuffleHandFrame]
      : CUT_HAND_SRC[frame as CutHandFrame];
  return (
    <div
      className={`${styles.hands} ${z === 'over' ? styles.over : styles.under}`}
      data-ritual-hands={kind}
      data-hand-frame={frame}
      aria-hidden="true"
    >
      {/* key forces a real src swap so mid-hold frames never stick on idle pixels */}
      <img key={src} src={src} alt="" width={1400} height={1100} draggable={false} />
    </div>
  );
}
