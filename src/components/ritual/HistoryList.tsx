'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { CARDS } from '@/data/lexicons/zh-1';
import { composeReading } from '@/lib/reading';
import { buildHistoryHref, formatHistoryCards, formatHistoryWhen, historyHasQuestion } from '@/lib/history-href';
import { clearHistory, removeHistory, parseHistory, historySnapshot, serverHistorySnapshot, subscribeHistory } from '@/lib/storage';
import { ReadingView } from './ReadingView';
import { ConfirmModal } from './ConfirmModal';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import styles from './HistoryList.module.css';

export function HistoryList() {
  const raw = useSyncExternalStore(subscribeHistory, historySnapshot, serverHistorySnapshot);
  const items = useMemo(() => parseHistory(raw), [raw]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [includeQuestion, setIncludeQuestion] = useState(false);
  if (items.length === 0) return null;
  const open = items.find((item) => item.receipt.sessionId === openId) ?? null;
  return (
    <section className={styles.wrap}>
      <h2>仅这台设备上的记录</h2>
      <ul>
        {items.map((item) => {
          let plain = '';
          try {
            plain = buildHistoryHref(item, { includeQuestion: false });
          } catch {
            plain = '';
          }
          return (
            <li key={item.receipt.sessionId}>
              <span>{SPREADS[item.receipt.spreadId].nameZh}</span>
              <span>{formatHistoryWhen(item.receipt.completedAt)}</span>
              <span>{historyHasQuestion(item) ? '已含问题' : '未含问题'}</span>
              <span>{formatHistoryCards(item.receipt.draws)}</span>
              <button type="button" onClick={() => setOpenId(item.receipt.sessionId)}>
                打开
              </button>
              {plain ? (
                <button type="button" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}${plain}`)}>
                  复制不含问题的链接
                </button>
              ) : (
                <span>无法分享</span>
              )}
              <button type="button" onClick={() => removeHistory(item.receipt.sessionId)}>
                删除
              </button>
            </li>
          );
        })}
      </ul>
      {open && historyHasQuestion(open) ? (
        <label>
          <input type="checkbox" checked={includeQuestion} onChange={(event) => setIncludeQuestion(event.target.checked)} />
          包含我的问题
        </label>
      ) : null}
      {open && includeQuestion ? <p>问题会出现在链接中，收件人、站点及处理该链接的服务都可能看到。</p> : null}
      {open && includeQuestion ? (
        <button
          type="button"
          onClick={() => {
            try {
              const href = buildHistoryHref(open, { includeQuestion: true });
              void navigator.clipboard?.writeText(`${window.location.origin}${href}`);
            } catch {
              /* encode failures stay on the list row */
            }
          }}
        >
          复制含问题的链接
        </button>
      ) : null}
      {open ? <ReadingView doc={composeReading(open.receipt.spreadId, open.receipt.draws, CARDS, open.question ?? '')} /> : null}
      <button type="button" onClick={() => setConfirmClear(true)}>
        清空全部
      </button>
      {confirmClear ? (
        <ConfirmModal onCancel={() => setConfirmClear(false)}>
          <p>清空这台设备上的全部记录？清空后无法恢复。</p>
          <button
            type="button"
            onClick={() => {
              clearHistory();
              setConfirmClear(false);
              setOpenId(null);
            }}
          >
            确定清空
          </button>
          <button type="button" onClick={() => setConfirmClear(false)}>
            取消
          </button>
        </ConfirmModal>
      ) : null}
    </section>
  );
}
