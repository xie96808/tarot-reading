'use client';

import { COPY } from '@/i18n/zh-CN';
import type { PositionReading, ReadingDocument } from '@/lib/reading';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import styles from './ReadingView.module.css';

const CELTIC_GROUPS: Array<{ id: 'core' | 'path' | 'people' | 'close'; title: string }> = [
  { id: 'core', title: '当下核心' },
  { id: 'path', title: '来处与走向' },
  { id: 'people', title: '内外视角' },
  { id: 'close', title: '条件性收束' },
];

function PositionBlock({ position }: { position: PositionReading }) {
  return (
    <section>
      <h3>
        {position.positionNameZh} · {position.nameZh}（
        {position.orientation === 'reversed' ? COPY.reversed : COPY.upright}）
      </h3>
      <p className={styles.frame}>{position.frameZh}</p>
      <p>{position.meaning}</p>
    </section>
  );
}

export function ReadingView({
  question,
  doc,
}: {
  question: string;
  doc: ReadingDocument;
}) {
  const spread = SPREADS[doc.spreadId];
  const byId = Object.fromEntries(doc.positions.map((position) => [position.positionId, position]));

  return (
    <article className={styles.page}>
      {question ? <p className={styles.question}>问：{question}</p> : <p className={styles.question}>这次没有写下问题。</p>}
      {doc.spreadId === 'single' ? <p className={styles.disclaimer}>{COPY.yesNoDisclaimer}</p> : null}
      {doc.spreadId === 'celtic'
        ? CELTIC_GROUPS.map((group) => {
            const items = spread.positions.filter((position) => position.group === group.id);
            return (
              <div key={group.id} className={styles.group}>
                <h2>{group.title}</h2>
                {items.map((position) => (
                  <PositionBlock key={position.id} position={byId[position.id]} />
                ))}
              </div>
            );
          })
        : doc.positions.map((position) => <PositionBlock key={position.positionId} position={position} />)}
      <section>
        <h2>整阵线索</h2>
        {doc.synthesis.split('\n').map((line) => (
          <p key={line}>{line}</p>
        ))}
        {doc.relations.map((rel) => {
          const names = rel.sourcePositionIds.map(
            (id) => doc.positions.find((p) => p.positionId === id)?.positionNameZh ?? id,
          );
          return (
            <details key={rel.edgeId}>
              <summary>{COPY.whyThis}</summary>
              <p>
                {names.join(' 与 ')}：{rel.text}
              </p>
            </details>
          );
        })}
      </section>
      <section>
        <h2>留给自己</h2>
        <p>{doc.takeaway}</p>
        <p className={styles.muted}>
          焦点位置：{spread.positions.find((p) => p.id === spread.focusPositionId)?.nameZh}
        </p>
      </section>
    </article>
  );
}
