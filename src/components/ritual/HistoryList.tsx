'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { encodeReading } from '@/lib/reading-codec';
import { clearHistory, removeHistory, parseHistory, historySnapshot, serverHistorySnapshot, subscribeHistory } from '@/lib/storage';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import styles from './HistoryList.module.css';

export function HistoryList() {
  const raw = useSyncExternalStore(subscribeHistory, historySnapshot, serverHistorySnapshot);
  const items = useMemo(() => parseHistory(raw), [raw]);
  if (items.length === 0) return null;
  return (
    <section className={styles.wrap}>
      <h2>仅这台设备上的记录</h2>
      <ul>
        {items.map((item) => {
          let href = '';
          try {
            href = `/r/${encodeReading({
              v: 1,
              deckVersion: 'rws-1',
              lexiconVersion: 'zh-1',
              algo: 'fy-hkdf-2',
              spreadId: item.receipt.spreadId,
              q: item.question ?? null,
              reversals: item.receipt.reversals,
              cutIndex: item.receipt.cutIndex,
              commit: item.receipt.commitShort,
              draws: item.receipt.draws,
              ts: Math.floor(item.receipt.completedAt / 1000),
            })}`;
          } catch {
            href = '';
          }
          return (
            <li key={item.receipt.sessionId}>
              <span>{SPREADS[item.receipt.spreadId].nameZh}</span>
              {href ? <Link href={href}>打开</Link> : <span>无法分享</span>}
              <button type="button" onClick={() => removeHistory(item.receipt.sessionId)}>
                删除
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => { clearHistory(); }}>
        清空全部
      </button>
    </section>
  );
}
