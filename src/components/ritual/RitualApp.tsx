'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { COPY } from '@/i18n/zh-CN';
import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import { CARDS } from '@/data/lexicons/zh-1';
import { composeReading } from '@/lib/reading';
import { encodeReading } from '@/lib/reading-codec';
import { commitShuffle, newOperationId, randomCutIndex } from '@/lib/ritual-effects';
import { canResume, createSession, persistable, reduce, type RitualSession } from '@/lib/ritual-machine';
import { clearSession, loadSession, pushHistory, saveSession } from '@/lib/storage';
import { loadFaceIndex, type FaceUrls } from '@/lib/faces';
import { MAX_NOTE_CODEPOINTS, MAX_QUESTION_CODEPOINTS } from '@/config/site';
import type { PointerSample } from '@/lib/rng';
import { dealDurationMs, prefersReducedMotion, shuffleCommitHoldMs, sleep } from '@/lib/motion';
import { pointerOffset, tableHandMode } from '@/lib/table-hands';
import { CardBack } from './CardBack';
import { TableScene } from './TableScene';
import { ShuffleTable } from './ShuffleTable';
import { CutTable } from './CutTable';
import { Tableau } from './Tableau';
import { ReadingView } from './ReadingView';
import { HistoryList } from './HistoryList';
import { ConfirmModal } from './ConfirmModal';
import styles from './RitualApp.module.css';

function chapter(stage: RitualSession['stage']): string {
  if (stage === 'enter') return '入席';
  if (stage === 'question' || stage === 'spread') return '问心';
  if (stage === 'shuffle' || stage === 'cut') return '洗切';
  if (stage === 'deal' || stage === 'reveal' || stage === 'read') return '见牌';
  return '留笺';
}

export function RitualApp() {
  const [state, setState] = useState<RitualSession>(() => createSession());
  const [hydrated, setHydrated] = useState(false);
  const [faces, setFaces] = useState<Map<string, FaceUrls>>(new Map());
  const [shareUrl, setShareUrl] = useState('');
  const [includeQuestion, setIncludeQuestion] = useState(false);
  const [storageNote, setStorageNote] = useState(false);
  const samples = useRef<PointerSample[]>([]);
  const holding = useRef(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [handPointer, setHandPointer] = useState({ x: 0, y: 0 });
  const [pendingResume, setPendingResume] = useState<RitualSession | null>(null);
  const [restartAsk, setRestartAsk] = useState(false);

  const dispatch = useCallback((event: Parameters<typeof reduce>[1]) => {
    setState((current) => reduce(current, event));
  }, []);

  useEffect(() => {
    const restored = loadSession();
    if (canResume(restored)) {
      setPendingResume(persistable(restored));
    }
    setHydrated(true);
    loadFaceIndex().then(setFaces).catch(() => undefined);
    setReducedMotion(prefersReducedMotion());
    const onVis = () => setPageHidden(document.hidden);
    const onMotion = () => setReducedMotion(prefersReducedMotion());
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.addEventListener('visibilitychange', onVis);
    motionQuery.addEventListener('change', onMotion);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      motionQuery.removeEventListener('change', onMotion);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (pendingResume && state.stage === 'enter') return;
    const result = saveSession(persistable(state));
    if (result === 'memory') setStorageNote(true);
  }, [state, hydrated, pendingResume]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (state.stage !== 'shuffle') return;
      if (event.code !== 'Space' || event.repeat) return;
      event.preventDefault();
      if (event.type === 'keydown' && !holding.current) {
        holding.current = true;
        samples.current = [];
        dispatch({ type: 'HOLD_START', operationId: newOperationId() });
      }
      if (event.type === 'keyup' && holding.current) {
        holding.current = false;
        dispatch({ type: 'HOLD_RELEASE' });
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [state.stage, dispatch]);

  useEffect(() => {
    if (!pageHidden) return;
    if (state.stage === 'shuffle' && state.shufflePhase === 'holding') {
      holding.current = false;
      dispatch({ type: 'HOLD_CANCEL' });
    }
  }, [pageHidden, state, dispatch]);

  useEffect(() => {
    if (state.stage !== 'shuffle' || !('shufflePhase' in state) || state.shufflePhase !== 'committing') {
      return;
    }
    const sessionId = state.sessionId;
    const operationId = state.operationId;
    if (!operationId) return;
    let cancelled = false;
    const holdMs = shuffleCommitHoldMs(prefersReducedMotion());
    Promise.all([commitShuffle(samples.current, state.reversals), sleep(holdMs)])
      .then(([result]) => {
        if (cancelled) return;
        dispatch({
          type: 'SHUFFLE_COMMITTED',
          sessionId,
          operationId,
          ...result,
        });
        samples.current = [];
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'SHUFFLE_FAILED', sessionId, operationId });
      });
    return () => {
      cancelled = true;
    };
  }, [state, dispatch]);

  useEffect(() => {
    if (state.stage !== 'deal' || !('draws' in state)) return;
    const ms = dealDurationMs(state.draws.length, prefersReducedMotion() || document.hidden);
    const timer = window.setTimeout(() => dispatch({ type: 'DEAL_DONE' }), ms);
    return () => window.clearTimeout(timer);
  }, [state, dispatch]);

  const reading = useMemo(() => {
    if (state.stage !== 'read' && state.stage !== 'close') return null;
    if (!('draws' in state) && state.stage !== 'close') return null;
    const draws = state.stage === 'close' ? state.receipt.draws : state.draws;
    const spreadId = state.spreadId;
    return composeReading(spreadId, draws, CARDS);
  }, [state]);

  useEffect(() => {
    document.getElementById('stage-title')?.focus();
  }, [state.stage]);

  if (!hydrated) return <main className={styles.shell} />;

  return (
    <main className={styles.shell}>
      <h2 id="stage-title" className={styles.chapter} tabIndex={-1}>
        {chapter(state.stage)}
      </h2>
      <p className="visually-hidden" aria-live="polite">
        {state.stage === 'reveal' && 'revealed' in state
          ? `已翻开 ${state.revealed.length} / ${state.draws.length}`
          : chapter(state.stage)}
      </p>
      {storageNote ? <p className={styles.warn}>{COPY.storageFallback}</p> : null}
      {state.abandonOpen ? (
        <ConfirmModal onCancel={() => dispatch({ type: 'ABANDON_CANCEL' })}>
          <p>{COPY.abandonConfirm}</p>
          <button type="button" onClick={() => dispatch({ type: 'ABANDON_CONFIRM' })}>
            确定放弃
          </button>
          <button type="button" onClick={() => dispatch({ type: 'ABANDON_CANCEL' })}>
            继续这一局
          </button>
        </ConfirmModal>
      ) : null}
      {restartAsk ? (
        <ConfirmModal onCancel={() => setRestartAsk(false)}>
          <p>{COPY.resumeRestartConfirm}</p>
          <button
            type="button"
            onClick={() => {
              setPendingResume(null);
              setRestartAsk(false);
              setState(createSession());
            }}
          >
            {COPY.resumeRestart}
          </button>
          <button type="button" onClick={() => setRestartAsk(false)}>
            {COPY.resumeContinue}
          </button>
        </ConfirmModal>
      ) : null}
      {state.stage !== 'enter' && state.stage !== 'close' ? (
        <button type="button" className={styles.abandon} onClick={() => dispatch({ type: 'ABANDON_REQUEST' })}>
          放弃本局
        </button>
      ) : null}

      {state.stage === 'enter' ? (
        <section className={`${styles.center} ${styles.stage}`}>
          <div className={styles.candle} aria-hidden="true" />
          <h1>{COPY.enterTitle}</h1>
          <p>{COPY.enterBody}</p>
          {pendingResume ? (
            <>
              <p className={styles.warn}>{COPY.resumeBody}</p>
              <button
                type="button"
                className={styles.primary}
                autoFocus
                onClick={() => {
                  const next = pendingResume;
                  setPendingResume(null);
                  setRestartAsk(false);
                  setState(next);
                }}
              >
                {COPY.resumeContinue}
              </button>
              <button type="button" className={styles.ghost} onClick={() => setRestartAsk(true)}>
                {COPY.resumeRestart}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.primary}
                autoFocus
                onClick={() => dispatch({ type: 'ACK_ENTER' })}
              >
                {COPY.enterPrimary}
              </button>
              <Link href="/about">{COPY.enterSecondary}</Link>
            </>
          )}
          <HistoryList />
        </section>
      ) : null}

      {state.stage === 'question' ? (
        <section className={`${styles.center} ${styles.stage}`}>
          <h1>{COPY.questionTitle}</h1>
          <p>{COPY.questionHint}</p>
          <textarea
            className={styles.field}
            value={state.question}
            maxLength={MAX_QUESTION_CODEPOINTS * 2}
            placeholder={COPY.questionPlaceholder}
            onChange={(event) => {
              const next = event.target.value;
              if ([...next].length <= MAX_QUESTION_CODEPOINTS) {
                dispatch({ type: 'SET_QUESTION', question: next });
              }
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                dispatch({ type: 'SUBMIT_QUESTION' });
              }
            }}
          />
          <p className={styles.muted}>{COPY.questionPrivacy}</p>
          <div className={styles.examples}>
            {COPY.questionExamples.map((example) => (
              <button key={example} type="button" onClick={() => dispatch({ type: 'SET_QUESTION', question: example })}>
                {example}
              </button>
            ))}
          </div>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'SUBMIT_QUESTION' })}>
            {COPY.questionContinue}
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => {
              dispatch({ type: 'SET_QUESTION', question: '' });
              dispatch({ type: 'SUBMIT_QUESTION' });
            }}
          >
            {COPY.questionSkip}
          </button>
        </section>
      ) : null}

      {state.stage === 'spread' ? (
        <section className={`${styles.center} ${styles.stage}`}>
          <ul className={styles.spreads}>
            {(Object.keys(SPREADS) as SpreadId[]).map((id) => {
              const spread = SPREADS[id];
              return (
                <li key={id} className={state.spreadId === id ? styles.chosen : undefined}>
                  <button type="button" onClick={() => dispatch({ type: 'SET_SPREAD', spreadId: id })}>
                    <strong>{spread.nameZh}</strong>
                    <span>
                      {spread.titleZh} · {spread.blurbZh}
                    </span>
                    <em>{spread.durationZh}</em>
                  </button>
                </li>
              );
            })}
          </ul>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={state.reversals}
              onChange={(event) => dispatch({ type: 'SET_REVERSALS', reversals: event.target.checked })}
            />
            {COPY.reverseLabel}
          </label>
          <p className={styles.muted}>{COPY.reverseHint}</p>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'CONFIRM_SPREAD' })}>
            {COPY.spreadConfirm}
          </button>
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: 'BACK' })}>
            返回问题
          </button>
        </section>
      ) : null}

      {state.stage === 'shuffle' ? (
        <section className={`${styles.center} ${styles.stage} ${styles.tableStage}`}>
          <h1>{COPY.shuffleTitle}</h1>
          <TableScene
            hand={tableHandMode({
              stage: 'shuffle',
              shufflePhase: state.shufflePhase,
              reduced: reducedMotion || pageHidden,
            })}
            pointer={handPointer}
            label={state.shufflePhase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}
            onPointerDown={(event) => {
              holding.current = true;
              samples.current = [];
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
              setHandPointer(pointerOffset(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()));
              dispatch({ type: 'HOLD_START', operationId: newOperationId() });
            }}
            onPointerMove={(event) => {
              setHandPointer(pointerOffset(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()));
              if (!holding.current) return;
              samples.current.push({ x: event.clientX, y: event.clientY, t: performance.now() });
              dispatch({ type: 'HOLD_SAMPLE' });
            }}
            onPointerUp={() => {
              if (!holding.current) return;
              holding.current = false;
              dispatch({ type: 'HOLD_RELEASE' });
            }}
            onPointerCancel={() => {
              holding.current = false;
              dispatch({ type: 'HOLD_CANCEL' });
            }}
          >
            <ShuffleTable phase={state.shufflePhase} paused={pageHidden} reduced={reducedMotion} />
          </TableScene>
          <p>{state.shufflePhase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}</p>
          <button
            type="button"
            className={styles.primary}
            disabled={state.shufflePhase === 'committing'}
            onClick={() => {
              samples.current = [];
              dispatch({ type: 'AUTO_SHUFFLE', operationId: newOperationId() });
            }}
          >
            {COPY.shuffleAuto}
          </button>
        </section>
      ) : null}

      {state.stage === 'cut' ? (
        <section className={`${styles.center} ${styles.stage} ${styles.tableStage}`}>
          <h1>{COPY.cutTitle}</h1>
          <p>
            {COPY.shuffleSealed} · {state.commitShort}
          </p>
          <details>
            <summary>{COPY.sealedFingerprint}</summary>
            <code style={{ fontSize: 13, wordBreak: 'break-all' }}>{state.commitFull}</code>
            <p className={styles.muted}>只检查本标签页牌序是否自洽，不是公证。</p>
          </details>
          <TableScene
            hand={tableHandMode({ stage: 'cut', reduced: reducedMotion })}
            pointer={handPointer}
            label={COPY.cutTitle}
          >
            <CutTable cutIndex={state.cutIndex} />
          </TableScene>
          <label>
            {COPY.cutHint(state.cutIndex)}
            <input
              type="range"
              className={styles.slider}
              min={1}
              max={77}
              step={1}
              value={state.cutIndex}
              disabled={Boolean(state.operationId)}
              onChange={(event) => dispatch({ type: 'SET_CUT', cutIndex: Number(event.target.value) })}
            />
          </label>
          <button
            type="button"
            className={styles.ghost}
            disabled={Boolean(state.operationId)}
            onClick={async () => {
              const operationId = newOperationId();
              dispatch({ type: 'AUTO_CUT_REQUEST', operationId });
              try {
                const cutIndex = await randomCutIndex();
                dispatch({ type: 'AUTO_CUT_DONE', sessionId: state.sessionId, operationId, cutIndex });
              } catch {
                dispatch({ type: 'AUTO_CUT_FAILED', sessionId: state.sessionId, operationId });
              }
            }}
          >
            {COPY.cutAuto}
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={Boolean(state.operationId)}
            onClick={() => dispatch({ type: 'CONFIRM_CUT' })}
          >
            {COPY.cutConfirm}
          </button>
        </section>
      ) : null}

      {state.stage === 'deal' || state.stage === 'reveal' || state.stage === 'read' ? (
        <section className={`${styles.stage} ${styles.tableStage}`}>
          {state.stage === 'deal' ? <p className={styles.dealHint}>牌正在落到桌上</p> : null}
          <div className={state.stage === 'read' && state.view === 'page' ? styles.tableParked : undefined}>
            <TableScene
              hand={tableHandMode({ stage: state.stage, reduced: reducedMotion })}
              layout="spread"
            >
              {state.stage === 'deal' ? (
                <div className={styles.dealSource} aria-hidden="true">
                  <CardBack alt="" />
                </div>
              ) : null}
              <Tableau
                spreadId={state.spreadId}
                draws={state.draws}
                revealed={state.revealed}
                selectedPositionId={state.selectedPositionId}
                faces={faces}
                dealing={state.stage === 'deal'}
                onSelect={(positionId) => dispatch({ type: 'SELECT_POSITION', positionId })}
                onReveal={
                  state.stage === 'reveal'
                    ? (positionId) => dispatch({ type: 'REVEAL_POSITION', positionId })
                    : undefined
                }
              />
            </TableScene>
          </div>
          {state.stage === 'reveal' ? (
            <div className={styles.center}>
              <p className={styles.muted}>{COPY.reversedHint}</p>
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'REVEAL_NEXT' })}>
                {COPY.revealAction}
              </button>
            </div>
          ) : null}
          {state.stage === 'read' && reading ? (
            <>
              <div className={styles.viewSwitch}>
                <button
                  type="button"
                  className={state.view === 'table' ? styles.chosenView : undefined}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'table' })}
                >
                  {COPY.viewTable}
                </button>
                <button
                  type="button"
                  className={state.view === 'page' ? styles.chosenView : undefined}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'page' })}
                >
                  {COPY.viewPage}
                </button>
              </div>
              <ReadingView question={state.question.trim()} doc={reading} />
              <div className={styles.center}>
                <label>
                  留笺
                  <textarea
                    className={styles.field}
                    value={state.note}
                    onChange={(event) => {
                      const next = event.target.value;
                      if ([...next].length <= MAX_NOTE_CODEPOINTS) dispatch({ type: 'SET_NOTE', note: next });
                    }}
                    placeholder={COPY.notePlaceholder}
                  />
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={state.saveDevice}
                    onChange={(event) =>
                      dispatch({
                        type: 'SET_SAVE_OPTIONS',
                        saveDevice: event.target.checked,
                        savePrivate: state.savePrivate,
                      })
                    }
                  />
                  {COPY.saveDevice}
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={state.savePrivate}
                    onChange={(event) =>
                      dispatch({
                        type: 'SET_SAVE_OPTIONS',
                        saveDevice: state.saveDevice,
                        savePrivate: event.target.checked,
                      })
                    }
                  />
                  {COPY.savePrivate}
                </label>
                <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'CLOSE_ACK' })}>
                  {COPY.readContinue}
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {state.stage === 'close' && reading ? (
        <section className={`${styles.center} ${styles.stage}`}>
          <h1 className={styles.closeTitle}>{COPY.closeTitle}</h1>
          <p>{COPY.closeBody}</p>
          <ReadingView question={state.receipt.question.trim()} doc={reading} />
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={includeQuestion}
              onChange={(event) => setIncludeQuestion(event.target.checked)}
            />
            {COPY.shareIncludeQuestion}
          </label>
          {includeQuestion ? <p className={styles.warn}>{COPY.shareQuestionWarning}</p> : null}
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              try {
                const id = encodeReading({
                  v: 1,
                  deckVersion: 'rws-1',
                  lexiconVersion: 'zh-1',
                  algo: 'fy-hkdf-2',
                  spreadId: state.receipt.spreadId,
                  q: includeQuestion ? state.receipt.question.trim() || null : null,
                  reversals: state.receipt.reversals,
                  cutIndex: state.receipt.cutIndex,
                  commit: state.receipt.commitShort,
                  draws: state.receipt.draws,
                  ts: Math.floor(state.receipt.completedAt / 1000),
                });
                const url = `${window.location.origin}/r/${id}`;
                setShareUrl(url);
                void navigator.clipboard?.writeText(url);
                if (state.receipt.saved) {
                  pushHistory({
                    receipt: state.receipt,
                    question: state.receipt.savePrivate ? state.receipt.question : undefined,
                    note: state.receipt.savePrivate ? state.receipt.note : undefined,
                    savedAt: Date.now(),
                  });
                }
                clearSession();
              } catch (error) {
                setShareUrl(error instanceof Error ? error.message : '无法生成链接');
              }
            }}
          >
            {COPY.shareCopy}
          </button>
          {shareUrl ? (
            <textarea readOnly value={shareUrl} className={`${styles.field} ${styles.shareBox}`} />
          ) : null}
          <Link href={`/deck/${state.receipt.draws[0].cardId}`}>{COPY.viewCards}</Link>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => {
              clearSession();
              dispatch({ type: 'NEW_READING' });
            }}
          >
            {COPY.newReading}
          </button>
        </section>
      ) : null}
    </main>
  );
}
