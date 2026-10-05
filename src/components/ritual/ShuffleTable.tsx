'use client';

import { useEffect, useState, type CSSProperties, type PointerEventHandler } from 'react';
import type { ShufflePhase } from '@/lib/ritual-machine';
import { MOTION } from '@/lib/motion';
import { COPY } from '@/i18n/zh-CN';
import { SHUFFLE_HAND_SRC, shuffleHandFrame, type ShuffleHandFrame } from '@/lib/table-hands';
import { CardBack } from './CardBack';
import { ShuffleHands } from './RitualHands';
import styles from './ShuffleTable.module.css';

type ShuffleTableProps = {
  phase: ShufflePhase;
  paused?: boolean;
  reduced?: boolean;
  onHandFrame?: (frame: ShuffleHandFrame | null) => void;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export function ShuffleTable({
  phase,
  paused = false,
  reduced = false,
  onHandFrame,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: ShuffleTableProps) {
  const holding = !reduced && !paused && phase === 'holding';
  const [hold, setHold] = useState({ phase, tick: 0 });
  if (hold.phase !== phase) {
    setHold({ phase, tick: 0 });
  }
  const holdTick = hold.tick;

  useEffect(() => {
    for (const src of Object.values(SHUFFLE_HAND_SRC)) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  useEffect(() => {
    if (!holding) return;
    const id = window.setInterval(
      () => setHold((current) => ({ ...current, tick: current.tick + 1 })),
      MOTION.shuffleFrameMs,
    );
    return () => window.clearInterval(id);
  }, [holding, phase]);

  const frame = shuffleHandFrame(phase, reduced || paused, holding ? holdTick : 0);
  useEffect(() => {
    onHandFrame?.(frame);
    return () => onHandFrame?.(null);
  }, [frame, onHandFrame]);

  const pose = frame ?? 'idle';
  const active = !reduced && !paused && (phase === 'holding' || phase === 'committing');

  return (
    <div
      className={`${styles.table} ${active ? styles.active : styles.idle} ${phase === 'committing' ? styles.sealing : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-shuffle-phase={phase}
      data-hand-frame={pose}
      data-paused={paused || reduced}
      role="img"
      aria-label={phase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}
    >
      <div className={styles.halo} aria-hidden="true" />
      {frame ? <ShuffleHands frame={frame} /> : null}
      {Array.from({ length: MOTION.shuffleCards }, (_, index) => {
        const half = index < MOTION.shuffleCards / 2 ? -1 : 1;
        const inHalf = index % (MOTION.shuffleCards / 2);
        return (
          <div
            key={index}
            className={styles.card}
            data-shuffle-card
            data-half={half === -1 ? 'left' : 'right'}
            style={
              {
                '--i': index,
                '--layer': inHalf,
                '--fan': index - (MOTION.shuffleCards - 1) / 2,
                '--side': half,
                '--pair': index % 2 === 0 ? -1 : 1,
              } as CSSProperties
            }
          >
            <CardBack alt="" />
          </div>
        );
      })}
      <span className={styles.caption} aria-hidden="true">
        {phase === 'idle' ? '按住牌堆 · 让思绪慢下来' : phase === 'holding' ? '交错 · 混合' : '归拢 · 静候这一刻'}
      </span>
    </div>
  );
}
