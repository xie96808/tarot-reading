'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { FaceUrls } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
import { autoUprightDelayMs, MOTION, prefersReducedMotion } from '@/lib/motion';
import { sceneBeatDurations, type SceneVisual } from '@/lib/scene-beats';
import { faceImageRotation, type FaceView } from '@/lib/transforms';
import { useReducedMotion } from '@/lib/browser-state';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';
import styles from './Card3D.module.css';

type Card3DProps = {
  revealed: boolean;
  urls?: FaceUrls | null;
  alt: string;
  reversed?: boolean;
  sizes: string;
  onReveal?: () => void;
  label?: string;
  crossing?: boolean;
  dealDelayMs?: number;
  dealing?: boolean;
  animateOnMount?: boolean;
  visual?: SceneVisual;
};

type SceneFrom = SceneVisual | 'mount';

export function Card3D({
  revealed,
  urls,
  alt,
  reversed = false,
  sizes,
  onReveal,
  label,
  crossing,
  dealDelayMs = 0,
  dealing = false,
  animateOnMount = false,
  visual,
}: Card3DProps) {
  const reduced = useReducedMotion();
  const scene = visual !== undefined;
  const [presentation, setPresentation] = useState({
    revealed,
    flipped: revealed && !animateOnMount,
    view: (revealed && reversed && !animateOnMount ? 'readable' : 'as-dealt') as FaceView,
    manual: false,
    justRevealed: animateOnMount,
  });

  if (!scene && presentation.revealed !== revealed) {
    setPresentation({ revealed, flipped: false, view: 'as-dealt', manual: false, justRevealed: revealed });
  }
  const pose = useScenePose(visual, reduced);
  const [timedOpen, setTimedOpen] = useState<{ visual: SceneVisual | undefined; open: boolean }>({ visual, open: false });
  if (timedOpen.visual !== visual) setTimedOpen({ visual, open: false });
  const openFace = sceneFaceOpen(visual, pose.instant || reduced, timedOpen.open);
  const dealtNow = scene && (visual === 'back' || visual === 'door-partial' || visual === 'hand-partial');
  const readableNow = openFace && reversed && (pose.instant || reduced);
  if (!presentation.manual && dealtNow && presentation.view !== 'as-dealt') {
    setPresentation((current) => ({ ...current, view: 'as-dealt' }));
  } else if (!presentation.manual && readableNow && presentation.view !== 'readable') {
    setPresentation((current) => ({ ...current, view: 'readable' }));
  }
  const { flipped, view } = presentation;

  useEffect(() => {
    if (scene) return;
    if (!revealed) return;
    const frame = requestAnimationFrame(() => setPresentation((current) => ({ ...current, flipped: true })));
    const delay = autoUprightDelayMs(reversed, prefersReducedMotion());
    const timer = delay === null ? undefined : window.setTimeout(() => {
      setPresentation((current) => current.manual ? current : { ...current, view: 'readable' });
    }, delay);
    return () => {
      cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [revealed, reversed, scene]);

  useEffect(() => {
    if (!scene || !visual) return;
    if (visual === 'back' || visual === 'door-partial' || visual === 'hand-partial') return;
    if (pose.instant || reduced) return;
    const beats = sceneBeatDurations(false);
    const ms = visual === 'door-full'
      ? (pose.from === 'door-partial' ? beats.completeMs : beats.seamMs + beats.partialFlipMs)
      : beats.settleMs;
    const timer = window.setTimeout(() => setTimedOpen({ visual, open: true }), ms);
    return () => window.clearTimeout(timer);
  }, [scene, visual, pose.instant, pose.from, reduced]);

  useEffect(() => {
    // Partial must not use autoUprightDelayMs. Upright starts only after the face is fully open.
    if (!scene || !reversed || !openFace) return;
    if (visual !== 'door-full' && visual !== 'hand-settled') return;
    if (pose.instant || reduced) return;
    const timer = window.setTimeout(() => {
      setPresentation((current) => current.manual ? current : { ...current, view: 'readable' });
    }, MOTION.uprightPauseMs);
    return () => window.clearTimeout(timer);
  }, [scene, reversed, openFace, visual, pose.instant, reduced]);

  const beats = sceneBeatDurations(reduced);
  const showFace = scene ? visual !== 'back' : revealed;
  const showBadge = reversed && showFace;
  const showUpright = reversed && (scene ? openFace && (visual === 'door-full' || visual === 'hand-settled') : revealed);
  const showReveal = !showUpright && Boolean(onReveal) && (scene ? visual === 'back' : !revealed);
  const seam = !reduced && (visual === 'door-partial' || (visual === 'door-full' && pose.from === 'back' && !openFace));
  const poseName = !scene || !visual
    ? undefined
    : visual === 'door-partial'
      ? 'partial'
      : visual === 'door-full'
        ? 'full'
        : visual === 'back'
          ? 'back'
          : 'hand';
  const rotation = faceImageRotation(reversed, scene && !openFace ? 'as-dealt' : view);
  const innerClass = scene
    ? `${styles.inner} ${poseName === 'partial' && !reduced ? styles.partial : ''} ${openFace && (visual === 'door-full' || visual === 'hand-settled') ? styles.revealed : ''}`
    : `${styles.inner} ${flipped ? styles.revealed : ''}`;

  return (
    <div
      data-deal-card={dealing || undefined}
      data-card-visual
      data-visual={visual}
      data-scene-motion={scene ? (pose.instant || reduced ? 'instant' : 'play') : undefined}
      data-scene-from={scene ? pose.from : undefined}
      data-seam={seam ? 'open' : undefined}
      data-reduced={scene && reduced ? 'true' : undefined}
      className={`${styles.slot} ${crossing ? styles.crossing : ''} ${dealing ? styles.dealing : ''}`}
      style={
        {
          '--deal-ms': `${MOTION.dealFlightMs}ms`,
          '--flip-ms': `${MOTION.flipMs}ms`,
          '--deal-delay': `${dealDelayMs}ms`,
          '--upright-ms': `${MOTION.uprightMs}ms`,
          '--seam-ms': `${beats.seamMs}ms`,
          '--seam-lead-ms': reduced ? '0ms' : `${MOTION.seamLeadMs}ms`,
          '--partial-flip-ms': `${beats.partialFlipMs}ms`,
          '--complete-ms': `${beats.completeMs}ms`,
          '--palm-ms': `${beats.palmMs}ms`,
          '--settle-ms': `${beats.settleMs}ms`,
          '--seam-px': `${MOTION.seamPx}px`,
          '--partial-turn': `${MOTION.partialTurnDeg}deg`,
          '--palm-shift': `${MOTION.palmShiftPct}%`,
          '--read-fade-ms': `${MOTION.readFadeMs}ms`,
        } as CSSProperties
      }
    >
      {visual === 'hand-partial' || visual === 'hand-settled' ? (
        <div className={styles.palm} data-part="palm" aria-hidden="true" />
      ) : null}
      <div className={styles.flip}>
        <span className={`${styles.glow} ${!scene && flipped && presentation.justRevealed ? styles.glowing : ''}`} aria-hidden="true" />
        <div className={innerClass} data-pose={poseName}>
          <div className={styles.back}>
            <CardBack alt={showFace ? '' : alt} />
          </div>
          <div className={styles.front}>
            <div className={styles.orient} style={{ transform: `rotate(${rotation}deg)` }}>
              {showFace ? urls ? <CardFace key={urls.digest} urls={urls} sizes={sizes} alt={alt} /> : <div className={styles.waiting} role="status">正在准备牌面…</div> : null}
            </div>
          </div>
        </div>
      </div>
      {label || showBadge ? (
        <p className={styles.label} data-part="label">
          {label}
          {showBadge ? (
            <span className={styles.badge} data-part="badge">
              {COPY.reversed}
            </span>
          ) : null}
        </p>
      ) : null}
      {showReveal ? (
        <button type="button" className={styles.action} data-part="reveal" onClick={onReveal}>
          {COPY.revealAction}
        </button>
      ) : null}
      {showUpright ? (
        <button
          type="button"
          className={styles.action}
          data-part="reveal"
          onClick={() => {
            setPresentation((current) => ({ ...current, manual: true, view: current.view === 'readable' ? 'as-dealt' : 'readable' }));
          }}
        >
          {view === 'readable' ? COPY.viewAsDealt : COPY.viewReadable}
        </button>
      ) : null}
    </div>
  );
}

function sceneFaceOpen(visual: SceneVisual | undefined, instant: boolean, timed: boolean): boolean {
  if (visual !== 'door-full' && visual !== 'hand-settled') return false;
  return instant || timed;
}

function useScenePose(visual: SceneVisual | undefined, reduced: boolean): { from: SceneFrom; instant: boolean } {
  const [pose, setPose] = useState<{ visual: SceneVisual | undefined; from: SceneFrom; instant: boolean }>(() => ({
    visual,
    from: 'mount',
    instant: reduced || (visual !== undefined && visual !== 'back'),
  }));
  if (visual !== pose.visual || (reduced && !pose.instant)) {
    setPose({
      visual,
      from: pose.visual === undefined ? 'mount' : pose.visual,
      instant: reduced || (pose.visual === undefined && visual !== undefined && visual !== 'back'),
    });
  }
  return pose;
}
