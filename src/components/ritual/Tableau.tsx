'use client';

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import { CARDS } from '@/data/lexicons/zh-1';
import type { Draw } from '@/lib/shuffle';
import type { FaceUrls } from '@/lib/faces';
import { COPY } from '@/i18n/zh-CN';
import { celticSlotLayout } from '@/lib/celtic-layout';
import { dealDelayMs } from '@/lib/motion';
import type { SceneVisual } from '@/lib/scene-beats';
import { Card3D } from './Card3D';
import styles from './Tableau.module.css';

function useDesktopBoard() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia('(min-width: 1024px)');
      media.addEventListener('change', onStoreChange);
      return () => media.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  );
}

type TableauProps = {
  spreadId: SpreadId;
  draws: Draw[];
  revealed: string[];
  selectedPositionId: string;
  faces: Map<string, FaceUrls>;
  onSelect: (positionId: string) => void;
  onReveal?: (positionId: string) => void;
  dealing?: boolean;
  sceneVisuals?: Partial<Record<string, SceneVisual>> | null;
  revealLocked?: boolean;
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
  sceneVisuals = null,
  revealLocked = false,
}: TableauProps) {
  const [selection, setSelection] = useState({ revealed, position: selectedPositionId, animate: false });
  if (selection.revealed !== revealed || selection.position !== selectedPositionId) {
    setSelection({ revealed, position: selectedPositionId,
      animate: revealed.includes(selectedPositionId) && !selection.revealed.includes(selectedPositionId) });
  }
  const board = useRef<HTMLDivElement>(null);
  const desktop = useDesktopBoard();
  const [boardWidth, setBoardWidth] = useState(0);
  const [tableBox, setTableBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const node = board.current;
    if (!node) return;
    const measure = () => {
      const next = node.clientWidth;
      setBoardWidth(next > 0 ? next : Math.min(720, document.documentElement.clientWidth - 48));
      const table = node.closest('[data-table-scene]');
      const rect = (table ?? node).getBoundingClientRect();
      setTableBox((current) =>
        current.w === rect.width && current.h === rect.height ? current : { w: rect.width, h: rect.height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [spreadId, dealing, desktop]);
  const boardVars = { '--board-w': `${tableBox.w}px`, '--board-h': `${tableBox.h}px` } as CSSProperties;
  useLayoutEffect(() => {
    if (!dealing || !board.current) return;
    const origin = board.current.closest('[data-table-scene]')?.querySelector('[data-deck-origin]');
    if (!origin) return;
    const source = origin.getBoundingClientRect();
    for (const card of board.current.querySelectorAll<HTMLElement>('[data-deal-card]')) {
      const target = card.parentElement?.getBoundingClientRect();
      if (!target?.width) continue;
      card.style.setProperty('--deal-x', `${source.x + source.width / 2 - target.x - target.width / 2}px`);
      card.style.setProperty('--deal-y', `${source.y + source.height / 2 - target.y - target.width * .8}px`);
    }
  }, [dealing, spreadId, boardWidth]);

  const spread = SPREADS[spreadId];
  const count = spread.positions.length;
  const selected = draws.find((item) => item.positionId === selectedPositionId) ?? draws[0];
  const selectedMeta = spread.positions.find((p) => p.id === selected.positionId)!;
  const selectedRevealed = revealed.includes(selected.positionId);
  const sceneFor = (positionId: string) => (spreadId === 'celtic' ? undefined : sceneVisuals?.[positionId]);
  const faceOn = (positionId: string, isRevealed: boolean) => {
    const visual = sceneFor(positionId);
    return isRevealed || (visual !== undefined && visual !== 'back');
  };
  const cardAlt = (positionId: string, cardId: Draw['cardId'], orientation: Draw['orientation'], fallback: string, isRevealed: boolean) =>
    faceOn(positionId, isRevealed)
      ? `${CARDS[cardId].nameZh} ${orientation === 'reversed' ? COPY.reversed : COPY.upright}`
      : fallback;

  const stepped = (
    <div key={selected.positionId} className={styles.step}>
      <p>
        {selectedMeta.nameZh} · {spread.positions.findIndex((p) => p.id === selected.positionId) + 1}/
        {spread.positions.length}
      </p>
      <Card3D
        key={`${selected.positionId}:${selected.cardId}`}
        revealed={selectedRevealed}
        animateOnMount={selection.animate}
        visual={sceneFor(selected.positionId)}
        urls={faceOn(selected.positionId, selectedRevealed) ? faces.get(selected.cardId) : undefined}
        sizes="220px"
        reversed={selected.orientation === 'reversed'}
        crossing={false}
        dealing={dealing}
        dealDelayMs={dealDelayMs(
          spread.positions.findIndex((p) => p.id === selected.positionId),
          count,
        )}
        alt={cardAlt(selected.positionId, selected.cardId, selected.orientation, selectedMeta.nameZh, selectedRevealed)}
        label={selectedMeta.nameZh}
        onReveal={revealLocked || selectedRevealed || !onReveal ? undefined : () => onReveal(selected.positionId)}
      />
      <div className={styles.stepNav}>
        {spread.positions.map((position) => (
          <button
            key={position.id}
            type="button"
            className={position.id === selected.positionId ? styles.navCurrent : undefined}
            disabled={revealLocked}
            onClick={() => onSelect(position.id)}
          >
            {`${position.drawOrder} ${position.nameZh}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (spreadId === 'celtic') {
    const showBoard = dealing || desktop;
    const layout = showBoard && boardWidth > 0 ? celticSlotLayout(boardWidth, { interactive: !dealing }) : null;
    const geometry = layout ? Object.fromEntries(layout.slots.map((slot) => [slot.positionId, slot])) : null;
    return (
      <div ref={board} className={`${styles.celticWrap} ${dealing ? styles.dealingBoard : ''}`} style={boardVars}>
        {showBoard ? null : stepped}
        {layout && geometry ? (
          <div
            className={`${styles.celtic} ${dealing ? styles.dealLayout : ''}`}
            role="list"
            style={{ width: layout.board.w, height: layout.board.h }}
          >
            {spread.positions.map((position) => {
              const draw = draws.find((item) => item.positionId === position.id)!;
              const isRevealed = revealed.includes(position.id);
              const urls = isRevealed ? faces.get(draw.cardId) : undefined;
              const slot = geometry[position.id];
              return (
                <div
                  key={position.id}
                  role="listitem"
                  data-position={position.id}
                  className={`${styles.placed} ${slot.rotated ? styles.rotated : ''} ${selectedPositionId === position.id ? styles.selected : ''}`}
                  style={
                    {
                      left: slot.face.x,
                      top: slot.face.y,
                      width: slot.face.w,
                      height: slot.face.h,
                      '--portrait-w': `${layout.card.w}px`,
                      '--portrait-h': `${layout.card.h}px`,
                      '--label-x': `${slot.label.x - slot.face.x}px`,
                      '--label-y': `${slot.label.y - slot.face.y}px`,
                      '--label-w': `${slot.label.w}px`,
                      '--reveal-x': `${slot.reveal.x - slot.face.x}px`,
                      '--reveal-y': `${slot.reveal.y - slot.face.y}px`,
                      '--reveal-w': `${slot.reveal.w}px`,
                    } as CSSProperties
                  }
                >
                  {revealLocked ? null : (
                    <button type="button" className={styles.hit} data-part="face" onClick={() => { onSelect(position.id); if (!isRevealed && !dealing) onReveal?.(position.id); }}>
                      <span className="visually-hidden">{position.nameZh}</span>
                    </button>
                  )}
                  <Card3D
                    revealed={isRevealed}
                    urls={urls}
                    sizes={`${layout.card.w}px`}
                    reversed={draw.orientation === 'reversed'}
                    crossing={slot.rotated}
                    dealing={dealing}
                    dealDelayMs={dealDelayMs(position.drawOrder - 1, count)}
                    alt={isRevealed ? `${CARDS[draw.cardId].nameZh} ${draw.orientation === 'reversed' ? COPY.reversed : COPY.upright}` : position.nameZh}
                    label={position.nameZh}
                    onReveal={revealLocked || isRevealed || !onReveal || dealing ? undefined : () => onReveal(position.id)}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={board} style={boardVars}>
      {!dealing ? stepped : null}
      <div className={`${styles.row} ${dealing ? styles.dealingBoard : ''}`} role="list">
        {spread.positions.map((position) => {
          const draw = draws.find((item) => item.positionId === position.id)!;
          const isRevealed = revealed.includes(position.id);
          const visual = sceneFor(position.id);
          const urls = faceOn(position.id, isRevealed) ? faces.get(draw.cardId) : undefined;
          return (
            <div
              key={position.id}
              role="listitem"
              className={`${styles.item} ${selectedPositionId === position.id ? styles.selected : ''}`}
            >
              {revealLocked ? null : (
                <button type="button" className={styles.hit} data-part="face" onClick={() => { onSelect(position.id); if (!isRevealed && !dealing) onReveal?.(position.id); }}>
                  <span className="visually-hidden">{position.nameZh}</span>
                </button>
              )}
              <Card3D
                revealed={isRevealed}
                visual={visual}
                urls={urls}
                sizes="(max-width: 720px) 220px, 170px"
                reversed={draw.orientation === 'reversed'}
                dealing={dealing}
                dealDelayMs={dealDelayMs(position.drawOrder - 1, count)}
                alt={cardAlt(position.id, draw.cardId, draw.orientation, position.nameZh, isRevealed)}
                label={position.nameZh}
                onReveal={revealLocked || isRevealed || !onReveal ? undefined : () => onReveal(position.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
