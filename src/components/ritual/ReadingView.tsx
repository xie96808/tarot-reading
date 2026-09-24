'use client';

import { COPY } from '@/i18n/zh-CN';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { readingGroups, whyForRelation, type PositionReading, type ReadingDocument } from '@/lib/reading';
import styles from './ReadingView.module.css';

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

function Why({ doc, edgeId }: { doc: ReadingDocument; edgeId: string }) {
  const rel = doc.relations.find((item) => item.edgeId === edgeId);
  if (!rel) return null;
  return (
    <details>
      <summary>{COPY.whyThis}</summary>
      <p>{whyForRelation(rel, doc.positions)}</p>
    </details>
  );
}

export function ReadingView({ doc }: { doc: ReadingDocument }) {
  const spread = SPREADS[doc.spreadId];
  const groups = readingGroups(doc);
  const focusName = spread.positions.find((p) => p.id === spread.focusPositionId)?.nameZh;

  return (
    <article className={styles.page}>
      <p className={styles.question}>{doc.framing}</p>
      {doc.spreadId === 'single' ? <p className={styles.disclaimer}>{COPY.yesNoDisclaimer}</p> : null}
      {groups
        ? groups.map((group) => (
            <div key={group.id} className={styles.group}>
              <h2>{group.title}</h2>
              {group.positions.map((position) => (
                <PositionBlock key={position.positionId} position={position} />
              ))}
              {group.relations.map((rel) => (
                <p key={rel.edgeId}>{rel.text}</p>
              ))}
              {group.relations.map((rel) => (
                <Why key={`${rel.edgeId}-why`} doc={doc} edgeId={rel.edgeId} />
              ))}
            </div>
          ))
        : doc.positions.map((position) => <PositionBlock key={position.positionId} position={position} />)}
      {groups ? (
        doc.stats.length > 0 ? (
          <section>
            <h2>整阵线索</h2>
            {doc.stats.map((stat) => (
              <p key={stat.kind}>{stat.text}</p>
            ))}
          </section>
        ) : null
      ) : (
        <section>
          <h2>整阵线索</h2>
          {doc.synthesis.split('\n').map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))}
          {doc.relations.map((rel) => (
            <Why key={rel.edgeId} doc={doc} edgeId={rel.edgeId} />
          ))}
        </section>
      )}
      <section>
        <h2>留给自己</h2>
        <p>{doc.takeaway}</p>
        <p className={styles.muted}>
          焦点位置：{focusName}
          {doc.spreadId === 'celtic' ? `。${COPY.focusNotOutcome}` : ''}
        </p>
      </section>
    </article>
  );
}
