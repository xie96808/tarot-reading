'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { COPY } from '@/i18n/zh-CN';
import { MOTION } from '@/lib/motion';
import { futureBeatSchedule } from '@/lib/scene-beats';
import type { SceneId } from '@/lib/scene';
import styles from './SceneCloseView.module.css';

type KeptLine = { index: 1 | 2; text: string };

type SceneCloseViewProps = {
  sentences: readonly [string, string, string, string];
  kept: readonly KeptLine[];
  keptIndex: 1 | 2 | null;
  selectable: boolean;
  skipped: readonly KeptLine[];
  onKeep?: (index: 1 | 2) => void;
};

export function SceneCloseView({
  sentences,
  kept,
  keptIndex,
  selectable,
  skipped,
  onKeep,
}: SceneCloseViewProps) {
  const titleId = useId();
  const chosen = kept.find((item) => item.index === keptIndex) ?? null;
  const mustChoose = selectable && kept.length === 2 && keptIndex === null;
  const onlyOne = selectable && kept.length === 1;
  return (
    <section role="region" className={styles.panel} data-scene-close aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {COPY.sceneStepsTitle}
      </h2>
      <ol className={styles.sentences}>
        {sentences.map((sentence, index) => (
          <li key={index}>{sentence}</li>
        ))}
      </ol>
      {selectable && skipped.length > 0
        ? skipped.map((line) => (
            <p key={line.index} className={styles.static} data-pause-skipped={line.index}>
              {line.text}
            </p>
          ))
        : null}
      {onlyOne && chosen ? (
        <div data-kept-static>
          <p className={styles.ask}>{COPY.keepOnly}</p>
          <p>{chosen.text}</p>
        </div>
      ) : null}
      {selectable && kept.length === 2 ? (
        <fieldset className={styles.choices}>
          <legend className={styles.ask}>{COPY.keepAsk}</legend>
          {kept.map((item) => (
            <label key={item.index}>
              <input
                type="radio"
                name="kept-pause"
                checked={keptIndex === item.index}
                onChange={() => onKeep?.(item.index)}
              />
              {item.text}
            </label>
          ))}
        </fieldset>
      ) : null}
      {mustChoose ? <p className={styles.ask}>{COPY.keepRequired}</p> : null}
      {!selectable && chosen ? <p data-kept-static>{chosen.text}</p> : null}
    </section>
  );
}

export function SceneFutureBeat({
  sceneId,
  reduced,
  sentence,
  frameZh,
  meaning,
  onDone,
}: {
  sceneId: SceneId;
  reduced: boolean;
  sentence: string;
  frameZh: string;
  meaning: string;
  onDone: () => void;
}) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const schedule = futureBeatSchedule(sceneId, reduced);
  const [shown, setShown] = useState(() => ({
    sentence: schedule.sentenceAtMs === 0,
    meaning: schedule.meaningAtMs === 0,
  }));

  useEffect(() => {
    const sentenceTimer =
      schedule.sentenceAtMs === 0
        ? undefined
        : window.setTimeout(() => setShown((current) => ({ ...current, sentence: true })), schedule.sentenceAtMs);
    const meaningTimer =
      schedule.meaningAtMs === 0
        ? undefined
        : window.setTimeout(() => setShown((current) => ({ ...current, meaning: true })), schedule.meaningAtMs);
    const doneTimer = window.setTimeout(onDone, schedule.doneAtMs);
    return () => {
      if (sentenceTimer !== undefined) window.clearTimeout(sentenceTimer);
      if (meaningTimer !== undefined) window.clearTimeout(meaningTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone, schedule.doneAtMs, schedule.meaningAtMs, schedule.sentenceAtMs]);

  useEffect(() => {
    if (!shown.sentence) return;
    titleRef.current?.focus();
  }, [shown.sentence]);

  return (
    <section
      role="region"
      className={styles.panel}
      data-future-beat
      aria-labelledby={shown.sentence ? titleId : undefined}
      style={{ '--read-fade-ms': `${MOTION.readFadeMs}ms` } as CSSProperties}
    >
      {shown.sentence ? (
        <h2 id={titleId} ref={titleRef} className={`${styles.title} ${reduced ? '' : styles.fade}`} tabIndex={0}>
          {sentence}
        </h2>
      ) : null}
      {shown.meaning ? (
        <div className={reduced ? undefined : styles.fade} data-future-meaning>
          <p>{frameZh}</p>
          <p>{meaning}</p>
        </div>
      ) : null}
    </section>
  );
}
