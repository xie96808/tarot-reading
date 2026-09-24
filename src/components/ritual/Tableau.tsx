'use client';

import { CELTIC_SLOT_PERCENT, SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import { CARDS } from '@/data/lexicons/zh-1';
import type { Draw } from '@/lib/shuffle';
import type { FaceUrls } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
import { dealDelayMs } from '@/lib/motion';
import { Card3D } from './Card3D';
import styles from './Tableau.module.css';

type TableauProps = {
  spreadId: SpreadId;
  draws: Draw[];
  revealed: string[];
  selectedPositionId: string;
  faces: Map<string, FaceUrls>;
  onSelect: (positionId: string) => void;
  onReveal?: (positionId: string) => void;
  dealing?: boolean;
};

export function Tableau({
  spreadId,
  draws,
  revealed,
  selectedPositionId,
  faces,
  onSelect,
  onReveal,
  dealing = false,
}: TableauProps) {
  const spread = SPREADS[spreadId];
  const count = spread.positions.length;
  const selected = draws.find((item) => item.positionId === selectedPositionId) ?? draws[0];
  const selectedMeta = spread.positions.find((p) => p.id === selected.positionId)!;
  const selectedRevealed = revealed.includes(selected.positionId);

  const stepped = (
    <div className={styles.step}>
      <p>
        {selectedMeta.nameZh} · {spread.positions.findIndex((p) => p.id === selected.positionId) + 1}/
        {spread.positions.length}
      </p>
      <Card3D
        key={`${selected.positionId}:${selected.cardId}`}
        revealed={selectedRevealed}
        urls={selectedRevealed ? faces.get(selected.cardId) : undefined}
        sizes="220px"
        reversed={selected.orientation === 'reversed'}
        crossing={false}
        dealing={dealing}
        dealDelayMs={dealDelayMs(
          spread.positions.findIndex((p) => p.id === selected.positionId),
          count,
        )}
        alt={
          selectedRevealed
            ? `${CARDS[selected.cardId].nameZh} ${selected.orientation === 'reversed' ? COPY.reversed : COPY.upright}`
            : selectedMeta.nameZh
        }
        label={selectedMeta.nameZh}
        onReveal={selectedRevealed || !onReveal ? undefined : () => onReveal(selected.positionId)}
      />
      <div className={styles.stepNav}>
        {spread.positions.map((position) => (
          <button
            key={position.id}
            type="button"
            className={position.id === selected.positionId ? styles.navCurrent : undefined}
            onClick={() => onSelect(position.id)}
          >
            {`${position.drawOrder} ${position.nameZh}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (spreadId === 'celtic') {
    return (
      <div className={`${styles.celticWrap} ${dealing ? styles.dealingBoard : ''}`}>
        {stepped}
        <div className={styles.celtic} role="list">
          {spread.positions.map((position) => {
            const draw = draws.find((item) => item.positionId === position.id)!;
            const isRevealed = revealed.includes(position.id);
            const urls = isRevealed ? faces.get(draw.cardId) : undefined;
            const slot = CELTIC_SLOT_PERCENT[position.id];
            return (
              <div
                key={position.id}
                role="listitem"
                className={`${styles.celticSlot} ${selectedPositionId === position.id ? styles.selected : ''} ${position.id === 'challenge' ? styles.crossingSlot : ''} ${position.id === 'present' ? styles.presentSlot : ''}`}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                {position.id === 'present' ? (
                  <button type="button" className={styles.presentAccess} onClick={() => onSelect('present')}>
                    现状
                  </button>
                ) : null}
                <button type="button" className={styles.hit} onClick={() => onSelect(position.id)}>
                  <span className="visually-hidden">{position.nameZh}</span>
                </button>
                <Card3D
                  revealed={isRevealed}
                  urls={urls}
                  sizes="96px"
                  reversed={draw.orientation === 'reversed'}
                  crossing={position.id === 'challenge'}
                  dealing={dealing}
                  dealDelayMs={dealDelayMs(position.drawOrder - 1, count)}
                  alt={isRevealed ? `${CARDS[draw.cardId].nameZh} ${draw.orientation === 'reversed' ? COPY.reversed : COPY.upright}` : position.nameZh}
                  label={position.nameZh}
                  onReveal={isRevealed || !onReveal ? undefined : () => onReveal(position.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {!dealing ? stepped : null}
      <div className={`${styles.row} ${dealing ? styles.dealingBoard : ''}`} role="list">
        {spread.positions.map((position) => {
          const draw = draws.find((item) => item.positionId === position.id)!;
          const isRevealed = revealed.includes(position.id);
          const urls = isRevealed ? faces.get(draw.cardId) : undefined;
          return (
            <div
              key={position.id}
              role="listitem"
              className={`${styles.item} ${selectedPositionId === position.id ? styles.selected : ''}`}
            >
              <button type="button" className={styles.hit} onClick={() => onSelect(position.id)}>
                <span className="visually-hidden">{position.nameZh}</span>
              </button>
              <Card3D
                revealed={isRevealed}
                urls={urls}
                sizes="(max-width: 720px) 220px, 170px"
                reversed={draw.orientation === 'reversed'}
                dealing={dealing}
                dealDelayMs={dealDelayMs(position.drawOrder - 1, count)}
                alt={
                  isRevealed
                    ? `${CARDS[draw.cardId].nameZh} ${draw.orientation === 'reversed' ? COPY.reversed : COPY.upright}`
                    : position.nameZh
                }
                label={position.nameZh}
                onReveal={isRevealed || !onReveal ? undefined : () => onReveal(position.id)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
