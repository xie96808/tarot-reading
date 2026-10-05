'use client';

import { useEffect, useState } from 'react';
import type { ShufflePhase } from '@/lib/ritual-machine';
import { MOTION } from '@/lib/motion';
import {
  CUT_HAND_SRC,
  SHUFFLE_HAND_SRC,
  cutHandFrame,
  shuffleHandFrame,
  type CutHandFrame,
  type ShuffleHandFrame,
} from '@/lib/table-hands';
import styles from './RitualHands.module.css';

type ShuffleHandsProps = {
  phase: ShufflePhase;
  reduced?: boolean;
  paused?: boolean;
};

export function ShuffleHands({ phase, reduced = false, paused = false }: ShuffleHandsProps) {
  const holding = !reduced && !paused && phase === 'holding';
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!holding) return;
    const started = performance.now();
    const id = window.setInterval(() => setElapsed(performance.now() - started), MOTION.shuffleFrameMs);
    return () => window.clearInterval(id);
  }, [holding, phase]);
  const holdTick = holding ? Math.floor(elapsed / MOTION.shuffleFrameMs) : 0;
  const frame = shuffleHandFrame(phase, reduced, holdTick);
  if (!frame) return null;
  return <HandPicture kind="shuffle" frame={frame} z={frame === 'seal' ? 'over' : 'under'} />;
}

type CutHandsProps = {
  gathering?: boolean;
  dragging?: boolean;
  reduced?: boolean;
};

export function CutHands({ gathering = false, dragging = false, reduced = false }: CutHandsProps) {
  const frame = cutHandFrame({ gathering, dragging, reduced });
  if (!frame) return null;
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
  const png = src.replace(/\.webp$/, '.png');
  return (
    <picture
      className={`${styles.hands} ${z === 'over' ? styles.over : styles.under}`}
      data-ritual-hands={kind}
      data-hand-frame={frame}
    >
      <source type="image/webp" srcSet={src} />
      <img src={png} alt="" width={1400} height={1100} draggable={false} />
    </picture>
  );
}
