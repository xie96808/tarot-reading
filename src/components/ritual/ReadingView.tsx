'use client';

import { COPY } from '@/i18n/zh-CN';
import type { ReadingDocument } from '@/lib/reading';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import styles from './ReadingView.module.css';

export function ReadingView({
  question,
  doc,
}: {
  question: string;
  doc: ReadingDocument;
}) {
  const spread = SPREADS[doc.spreadId];
  return (
    <article className={styles.page}>
      {question ? <p className={styles.question}>问：{question}</p> : <p className={styles.question}>这次没有写下问题。</p>}
      {doc.spreadId === 'single' ? <p className={styles.disclaimer}>{COPY.yesNoDisclaimer}</p> : null}
      {doc.positions.map((position) => (
        <section key={position.positionId}>
          <h2>
            {position.positionNameZh} · {position.nameZh}（
            {position.orientation === 'reversed' ? COPY.reversed : COPY.upright}）
          </h2>
          <p className={styles.frame}>{position.frameZh}</p>
          <p>{position.meaning}</p>
        </section>
      ))}
      <section>
        <h2>整阵线索</h2>
        {doc.synthesis.split('\n').map((line) => (
          <p key={line}>{line}</p>
        ))}
        {doc.relations.map((rel) => (
          <details key={rel.edgeId}>
            <summary>{COPY.whyThis}</summary>
            <p>
              {rel.ruleId} · {rel.sourcePositionIds.join(' / ')}
            </p>
          </details>
        ))}
      </section>
      <section>
        <h2>留给自己</h2>
        <p>{doc.takeaway}</p>
        <p className={styles.muted}>焦点位置：{spread.positions.find((p) => p.id === spread.focusPositionId)?.nameZh}</p>
      </section>
    </article>
  );
}
