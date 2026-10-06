'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEventHandler } from 'react';
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
  const root = useRef<HTMLDivElement>(null);
  const holding = !reduced && !paused && phase === 'holding';
  const [hold, setHold] = useState({ phase, tick: 0 });
  if (hold.phase !== phase) {
    setHold({ phase, tick: 0 });
  }
  const holdTick = hold.tick;
  const liveFrame = shuffleHandFrame(phase, reduced || paused, holding ? holdTick : 0);
  const [releaseFrom, setReleaseFrom] = useState<ShuffleHandFrame>('idle');
  if (phase === 'holding' && liveFrame && releaseFrom !== liveFrame) setReleaseFrom(liveFrame);
  if ((phase === 'idle' || reduced || paused) && releaseFrom !== 'idle') setReleaseFrom('idle');
  const releasing = phase === 'committing' && releaseFrom !== 'idle' && !reduced && !paused;
  const auto = phase === 'committing' && !releasing && !reduced && !paused;
  const [autoFrame, setAutoFrame] = useState<ShuffleHandFrame>('idle');

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

  useEffect(() => {
    if (!auto) return;
    const marks = [
      window.setTimeout(() => setAutoFrame('split'), 160),
      window.setTimeout(() => setAutoFrame('riffle'), 480),
      window.setTimeout(() => setAutoFrame('seal'), 1100),
    ];
    return () => {
      for (const mark of marks) window.clearTimeout(mark);
      setAutoFrame('idle');
    };
  }, [auto]);

  const frame: ShuffleHandFrame | null = reduced || paused ? null : releasing ? releaseFrom : auto ? autoFrame : liveFrame;
  useEffect(() => {
    onHandFrame?.(frame);
    return () => onHandFrame?.(null);
  }, [frame, onHandFrame]);

  useLayoutEffect(() => {
    if (!releasing || !root.current) return;
    const cards = [...root.current.querySelectorAll<HTMLElement>('[data-shuffle-card]')];
    const from = cards.map((card) => getComputedStyle(card).transform);
    cards.forEach((card, index) => {
      card.style.transition = 'none';
      if (from[index] && from[index] !== 'none') card.style.transform = from[index]!;
    });
    const frameId = window.requestAnimationFrame(() => {
      cards.forEach((card) => {
        card.style.transition = `transform ${MOTION.shuffleReleaseMs}ms cubic-bezier(.22,.61,.36,1)`;
        card.style.transform = 'translate3d(-50%, calc(-50% - var(--i) * 0.6px), 0) rotate(0deg)';
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [releasing]);

  const motion = reduced || paused ? 'still' : releasing ? 'release' : auto ? 'auto' : phase === 'holding' ? 'hold' : 'idle';
  const pose = frame ?? 'idle';
  const active = motion === 'hold' || motion === 'auto' || motion === 'release';

  return (
    <div
      ref={root}
      tabIndex={0}
      className={`${styles.table} ${active ? styles.active : styles.idle} ${phase === 'committing' ? styles.sealing : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-shuffle-pile
      data-shuffle-phase={phase}
      data-shuffle-motion={motion}
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
        {phase === 'holding' ? '松开后收齐' : phase === 'committing' ? '正在收齐' : ''}
      </span>
    </div>
  );
}
