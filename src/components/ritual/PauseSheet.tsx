'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { MAX_PAUSE_LINE_CODEPOINTS } from '@/config/site';
import type { PauseOffer } from '@/data/lexicons/zh-1/pauses/types';
import { COPY } from '@/i18n/zh-CN';
import { MOTION } from '@/lib/motion';
import { promptForPause } from '@/lib/pause';
import type { SceneId } from '@/lib/scene';
import styles from './PauseSheet.module.css';

type PauseSheetProps = {
  sceneId: SceneId;
  offer: PauseOffer;
  phase: 'choosing' | 'writing';
  custom: string;
  previous: 'action' | 'skip' | 'missing' | null;
  actionsEnabled: boolean;
  onChoose: (actionId: string) => void;
  onCustom: (custom: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
  onRevert: () => void;
};

export function PauseSheet({
  sceneId,
  offer,
  phase,
  custom,
  previous,
  actionsEnabled,
  onChoose,
  onCustom,
  onConfirm,
  onSkip,
  onRevert,
}: PauseSheetProps) {
  const promptId = useId();
  const customId = useId();
  const promptRef = useRef<HTMLHeadingElement>(null);
  const customRef = useRef<HTMLHeadingElement>(null);
  const engages = offer.actions.filter((action) => action.kind === 'engage');
  const leave = offer.actions.find((action) => action.kind === 'leave');
  const count = [...custom].length;

  useEffect(() => {
    if (phase === 'writing') customRef.current?.focus();
    else promptRef.current?.focus();
  }, [phase]);

  return (
    <section
      role="region"
      className={styles.sheet}
      data-pause-sheet
      data-pause-phase={phase}
      data-actions-ready={actionsEnabled ? 'true' : 'false'}
      aria-labelledby={phase === 'writing' ? customId : promptId}
    >
      {phase === 'choosing' ? (
        <>
          <p className={styles.lead}>{sceneId === 'door' ? COPY.pauseDoorLead : COPY.pauseHandLead}</p>
          <h2 id={promptId} ref={promptRef} className={styles.prompt} tabIndex={0}>
            {promptForPause(offer, previous)}
          </h2>
          <Crisis />
          <div className={styles.actions}>
            {engages.map((action) => (
              <button
                key={action.id}
                type="button"
                data-part="engage"
                data-pause-action={action.id}
                disabled={!actionsEnabled}
                onClick={() => onChoose(action.id)}
              >
                {action.labelZh}
              </button>
            ))}
            {leave ? (
              <button
                type="button"
                className={styles.leave}
                data-part="leave"
                data-pause-action={leave.id}
                disabled={!actionsEnabled}
                onClick={() => onChoose(leave.id)}
              >
                {leave.labelZh}
              </button>
            ) : null}
            <button type="button" data-part="skip" disabled={!actionsEnabled} onClick={onSkip}>
              {COPY.pauseSkip}
            </button>
          </div>
          <p className={styles.privacy} tabIndex={0}>
            {COPY.pausePrivacy}
          </p>
        </>
      ) : (
        <>
          <h2 id={customId} ref={customRef} className={styles.prompt} tabIndex={0}>
            {COPY.pauseCustomTitle}
          </h2>
          <input
            className={styles.line}
            type="text"
            value={custom}
            enterKeyHint="done"
            placeholder={COPY.pauseCustomPlaceholder}
            maxLength={MAX_PAUSE_LINE_CODEPOINTS * 2}
            onChange={(event) => {
              onCustom([...event.target.value].slice(0, MAX_PAUSE_LINE_CODEPOINTS).join(''));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
              }
            }}
          />
          {count > 0 ? (
            <p className={styles.privacy} aria-live="polite">
              {COPY.pauseCount(count)}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button type="button" data-part="confirm" onClick={onConfirm}>
              {COPY.pauseCustomConfirm}
            </button>
            <button type="button" className={styles.leave} data-part="revert" onClick={onRevert}>
              {COPY.pauseCustomBack}
            </button>
          </div>
          <Crisis />
          <p className={styles.privacy} tabIndex={0}>
            {COPY.pausePrivacy}
          </p>
        </>
      )}
    </section>
  );
}

function Crisis() {
  return (
    <p className={styles.body}>
      {COPY.crisisResources} <Link href="/about#help">方法页</Link>
    </p>
  );
}

export function PauseMeaning({
  missing,
  frameZh,
  meaning,
}: {
  missing: boolean;
  frameZh: string;
  meaning: string;
}) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  return (
    <section
      role="region"
      className={`${styles.sheet} ${styles.fade}`}
      data-pause-meaning
      aria-labelledby={titleId}
      style={{ '--read-fade-ms': `${MOTION.readFadeMs}ms` } as CSSProperties}
    >
      {missing ? <p className={styles.body}>{COPY.pauseMissing}</p> : null}
      <h2 id={titleId} ref={titleRef} className={styles.prompt} tabIndex={0}>
        {COPY.pauseMeaningLead}
      </h2>
      <p className={styles.body}>{frameZh}</p>
      <p className={styles.body}>{meaning}</p>
    </section>
  );
}
