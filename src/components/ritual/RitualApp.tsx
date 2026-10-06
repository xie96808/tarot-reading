'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { COPY } from '@/i18n/zh-CN';
import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import { CARDS } from '@/data/lexicons/zh-1';
import { lookupPauseOffer } from '@/data/lexicons/zh-1/pauses';
import { buildPositionReadings, composeReading } from '@/lib/reading';
import { abandonCopy } from '@/lib/ritual-copy';
import { encodeReading } from '@/lib/reading-codec';
import { commitShuffle, newOperationId, randomCutIndex } from '@/lib/ritual-effects';
import { canResume, createSession, persistable, reduce, stepPositionId, type PauseAnswer, type RitualSession } from '@/lib/ritual-machine';
import { SCENE_PAUSE_ENABLED } from '@/lib/scene';
import { composeSceneClose, type PauseResolution } from '@/lib/scene-close';
import { canFocusGatedPosition, nextGatedPosition } from '@/lib/pause';
import { lockedSceneVisual, meaningAfterPauseMs, pauseActionsReadyMs, sceneBeatDurations, type SceneVisual } from '@/lib/scene-beats';
import { toSharePayload } from '@/lib/share-payload';
import type { Draw } from '@/lib/shuffle';
import { clearSession, loadSession, pushHistory, saveSession, subscribeStorageStatus, storageStatusSnapshot, serverStorageStatusSnapshot } from '@/lib/storage';
import { decodeFace, faceSlotKey, forgetFaceDecode, loadFaceIndex, revealFaceSizes, subscribeFaceIndex, type FaceUrls } from '@/lib/faces';
import { MAX_NOTE_CODEPOINTS, MAX_QUESTION_CODEPOINTS } from '@/config/site';
import type { PointerSample } from '@/lib/rng';
import { faceUpRevealCount } from '@/lib/face-up-count';
import { MOTION, cutProportion, dealDurationMs, prefersReducedMotion, shuffleCommitHoldMs, sleep } from '@/lib/motion';
import { tableHandMode, type CutHandFrame, type ShuffleHandFrame } from '@/lib/table-hands';
import { CardBack } from './CardBack';
import { TableScene } from './TableScene';
import { ShuffleTable } from './ShuffleTable';
import { CutTable } from './CutTable';
import { Tableau } from './Tableau';
import { ReadingView } from './ReadingView';
import { HistoryList } from './HistoryList';
import { ConfirmModal } from './ConfirmModal';
import { PauseMeaning, PauseSheet } from './PauseSheet';
import { SceneCloseView, SceneFutureBeat } from './SceneCloseView';
import styles from './RitualApp.module.css';
import { useClientReady, usePageHidden, useReducedMotion } from '@/lib/browser-state';

function useCompactStage(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia('(max-width: 1023px)');
      media.addEventListener('change', onStoreChange);
      return () => media.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(max-width: 1023px)').matches,
    () => true,
  );
}

const PAGE_SCROLL_STAGES = new Set<RitualSession['stage']>(['enter', 'question', 'spread', 'read', 'close']);

function toResolution(answer: PauseAnswer): PauseResolution {
  if (answer.kind === 'action') {
    return { index: answer.index, kind: 'action', actionId: answer.actionId, custom: answer.custom };
  }
  return { index: answer.index, kind: answer.kind };
}

function sceneCloseOf(state: RitualSession) {
  if (!SCENE_PAUSE_ENABLED || state.spreadId !== 'three' || !state.sceneId) return null;
  const past = state.pauseAnswers.find((item) => item.index === 1);
  const present = state.pauseAnswers.find((item) => item.index === 2);
  if (!past || !present) return null;
  const draws = state.stage === 'close' ? state.receipt.draws : 'draws' in state ? state.draws : null;
  if (!draws) return null;
  const ordered = ['past', 'present', 'future'].map((positionId) => draws.find((draw) => draw.positionId === positionId));
  if (ordered.some((draw) => !draw)) return null;
  const [pastDraw, presentDraw, futureDraw] = ordered as [Draw, Draw, Draw];
  return composeSceneClose({
    sceneId: state.sceneId,
    past: toResolution(past),
    present: toResolution(present),
    draws: [pastDraw, presentDraw, futureDraw],
    cards: CARDS,
    lookup: lookupPauseOffer,
  });
}

function PrepareForm({
  state,
  dispatch,
}: {
  state: Extract<RitualSession, { stage: 'enter' | 'question' | 'spread' }>;
  dispatch: (event: Parameters<typeof reduce>[1]) => void;
}) {
  const sceneName = state.sceneId === 'hand' ? '过手' : state.sceneId === 'door' ? '推门' : null;
  return (
    <>
      <h1>{COPY.questionTitle}</h1>
      <label className={styles.ask}>
        {COPY.questionLabel}
        <textarea
          className={`${styles.field} ${styles.question}`}
          rows={3}
          value={state.question}
          maxLength={MAX_QUESTION_CODEPOINTS * 2}
          placeholder={COPY.questionPlaceholder}
          onChange={(event) => {
            const next = [...event.target.value].slice(0, MAX_QUESTION_CODEPOINTS).join('');
            dispatch({ type: 'SET_QUESTION', question: next });
          }}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              dispatch({ type: 'CONFIRM_SPREAD' });
            }
          }}
        />
      </label>
      {[...state.question].length > 0 ? (
        <p className={styles.muted} aria-live="polite">
          {COPY.questionCount([...state.question].length)}
        </p>
      ) : null}
      <p className={styles.muted}>{COPY.questionPrivacy}</p>
      <details className={styles.examples}>
        <summary>{COPY.questionExamplesSummary}</summary>
        {COPY.questionExamples.map((example) => (
          <button key={example} type="button" onClick={() => dispatch({ type: 'SET_QUESTION', question: example })}>
            {example}
          </button>
        ))}
      </details>
      <div className={styles.spreads} role="radiogroup" aria-label={COPY.spreadGroupLabel}>
        {(Object.keys(SPREADS) as SpreadId[]).map((id) => {
          const spread = SPREADS[id];
          return (
            <label key={id}>
              <input
                type="radio"
                name="spread"
                checked={state.spreadId === id}
                onChange={() => dispatch({ type: 'SET_SPREAD', spreadId: id })}
              />
              <strong>
                {spread.nameZh} · {spread.titleZh}
              </strong>
              <em>
                {spread.positions.length} 张 · {spread.blurbZh} · {spread.durationZh}
              </em>
            </label>
          );
        })}
      </div>
      <fieldset className={styles.settings}>
        <legend>{COPY.readingSettings}</legend>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={state.reversals}
            onChange={(event) => dispatch({ type: 'SET_REVERSALS', reversals: event.target.checked })}
          />
          {COPY.reverseLabel}
        </label>
        <p className={styles.muted}>{COPY.reverseHint}</p>
        <p className={styles.muted}>{COPY.reversedHint}</p>
      </fieldset>
      {sceneName ? <p>{COPY.sceneLocked(sceneName)}</p> : null}
      <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'CONFIRM_SPREAD' })}>
        {COPY.spreadConfirm}
      </button>
      <p className={styles.muted}>
        <Link href="/about#help">{COPY.prepareHelp}</Link>
      </p>
    </>
  );
}

function chapter(stage: RitualSession['stage']): string {
  if (stage === 'enter') return '入席';
  if (stage === 'question' || stage === 'spread') return '问心';
  if (stage === 'shuffle' || stage === 'cut') return '洗切';
  if (stage === 'deal' || stage === 'reveal' || stage === 'read') return '见牌';
  return '留笺';
}

export function RitualApp({ initialSpread = null }: { initialSpread?: SpreadId | null }) {
  const ready = useClientReady();
  return ready ? <RitualClient initialSpread={initialSpread} /> : <main className={styles.shell} />;
}

function RitualClient({ initialSpread }: { initialSpread: SpreadId | null }) {
  const [state, setState] = useState<RitualSession>(() => {
    const session = createSession();
    return initialSpread ? { ...session, spreadId: initialSpread } : session;
  });
  const [faces, setFaces] = useState<Map<string, FaceUrls>>(new Map());
  const [faceLoadError, setFaceLoadError] = useState(false);
  const [cutCommitSession, setCutCommitSession] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [includeQuestion, setIncludeQuestion] = useState(false);
  const storageNote = useSyncExternalStore(subscribeStorageStatus, storageStatusSnapshot, serverStorageStatusSnapshot);
  const samples = useRef<PointerSample[]>([]);
  const holding = useRef(false);
  const pageHidden = usePageHidden();
  const reducedMotion = useReducedMotion();
  const [pendingResume, setPendingResume] = useState<RitualSession | null>(() => {
    const restored = loadSession();
    return canResume(restored) ? persistable(restored) : null;
  });
  const [restartAsk, setRestartAsk] = useState(false);
  const [restoredPauseKey, setRestoredPauseKey] = useState<string | null>(null);
  const [instantMeaning, setInstantMeaning] = useState(false);
  const [handSettled, setHandSettled] = useState(false);
  const [handFutureOn, setHandFutureOn] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);
  const [readyPauseKey, setReadyPauseKey] = useState<string | null>(null);
  const [shownMeaning, setShownMeaning] = useState<string | null>(null);
  const [snapSession, setSnapSession] = useState<string | null>(null);
  const [restoredRevealed, setRestoredRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const [shuffleHandFrameState, setShuffleHandFrameState] = useState<ShuffleHandFrame | null>(null);
  const [cutHandFrameState, setCutHandFrameState] = useState<CutHandFrame | null>(null);

  const dispatch = useCallback((event: Parameters<typeof reduce>[1]) => {
    setState((current) => reduce(current, event));
  }, []);

  useEffect(() => subscribeFaceIndex(setFaces), []);
  useEffect(() => {
    let cancelled = false;
    loadFaceIndex().catch(() => { if (!cancelled) setFaceLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (pendingResume && state.stage === 'enter') return;
    saveSession(persistable(state));
  }, [state, pendingResume]);

  const pushedHistoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.stage !== 'close' || !state.receipt.saved) return;
    if (pushedHistoryRef.current === state.receipt.sessionId) return;
    pushedHistoryRef.current = state.receipt.sessionId;
    const privateOk = state.receipt.savePrivate;
    const receipt = privateOk
      ? state.receipt
      : {
          ...state.receipt,
          question: '',
          note: '',
          sceneId: null,
          pauseAnswers: [],
          keptPauseIndex: null,
        };
    pushHistory({
      receipt,
      question: privateOk ? state.receipt.question || undefined : undefined,
      note: privateOk ? state.receipt.note || undefined : undefined,
      savedAt: Date.now(),
    });
  }, [state]);

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
    const cancelHiddenHold = () => {
      if (!document.hidden) return;
      holding.current = false;
      dispatch({ type: 'HOLD_CANCEL' });
    };
    document.addEventListener('visibilitychange', cancelHiddenHold);
    return () => document.removeEventListener('visibilitychange', cancelHiddenHold);
  }, [dispatch]);

  const shufflePhase = state.stage === 'shuffle' ? state.shufflePhase : null;
  const shuffleOperationId = state.stage === 'shuffle' ? state.operationId : null;
  const shuffleReversals = state.reversals;

  useEffect(() => {
    // Only (re)start commit when entering committing for a given operation.
    // Ignore unrelated state like abandonOpen so cleanup never reseals a live commit.
    if (shufflePhase !== 'committing' || !shuffleOperationId) return;
    const sessionId = state.sessionId;
    const operationId = shuffleOperationId;
    let cancelled = false;
    const holdMs = shuffleCommitHoldMs(prefersReducedMotion());
    Promise.all([commitShuffle(samples.current, shuffleReversals), sleep(holdMs)])
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
  }, [shufflePhase, shuffleOperationId, shuffleReversals, state.sessionId, dispatch]);

  useEffect(() => {
    if (state.stage !== 'deal' || !('draws' in state)) return;
    const ms = dealDurationMs(state.draws.length, prefersReducedMotion() || document.hidden);
    const timer = window.setTimeout(() => dispatch({ type: 'DEAL_DONE' }), ms);
    return () => window.clearTimeout(timer);
  }, [state, dispatch]);

  useEffect(() => {
    if (state.stage !== 'cut' || cutCommitSession !== state.sessionId) return;
    const timer = window.setTimeout(() => {
      setCutCommitSession(null);
      dispatch({ type: 'CONFIRM_CUT' });
    }, reducedMotion ? 0 : MOTION.cutMs);
    return () => window.clearTimeout(timer);
  }, [state.stage, state.sessionId, cutCommitSession, reducedMotion, dispatch]);

  const compactStage = useCompactStage();
  const faceSizes = revealFaceSizes(compactStage);
  const [decodedSlots, setDecodedSlots] = useState<ReadonlySet<string>>(() => new Set());
  const [failedSlots, setFailedSlots] = useState<ReadonlySet<string>>(() => new Set());
  const [faceAttempt, setFaceAttempt] = useState(0);
  const [faceWait, setFaceWait] = useState<{ key: string | null; announced: boolean; stalled: boolean }>({
    key: null,
    announced: false,
    stalled: false,
  });
  const previewDraws = 'draws' in state ? state.draws : null;
  useEffect(() => {
    if (!previewDraws) return;
    let cancelled = false;
    for (const draw of previewDraws) {
      const urls = faces.get(draw.cardId);
      if (!urls) continue;
      const key = faceSlotKey(urls.digest, faceSizes);
      decodeFace(urls, faceSizes).then((ok) => {
        if (cancelled) return;
        if (ok) {
          setDecodedSlots((current) => (current.has(key) ? current : new Set(current).add(key)));
          setFailedSlots((current) => {
            if (!current.has(key)) return current;
            const next = new Set(current);
            next.delete(key);
            return next;
          });
          return;
        }
        setFailedSlots((current) => (current.has(key) ? current : new Set(current).add(key)));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [previewDraws, faces, faceSizes, faceAttempt]);

  const finishFuture = useCallback(() => {
    dispatch({ type: 'FUTURE_BEAT_DONE' });
  }, [dispatch]);

  const sceneSpread = SCENE_PAUSE_ENABLED && state.spreadId === 'three';
  const sceneLive = sceneSpread && state.sceneLocked && state.sceneId !== null;
  const revealState = state.stage === 'reveal' ? state : null;
  const pause = revealState?.pause ?? null;
  const futureOpen = Boolean(revealState?.futureBeat === 'open');
  const navigationLocked = Boolean(sceneLive && revealState && (pause || futureOpen));
  const pauseKey = pause ? `${state.sessionId}:${pause.index}` : null;
  const pauseRestored = pauseKey !== null && restoredPauseKey === pauseKey;
  const handFuture = futureOpen && state.sceneId === 'hand';
  if (handFutureOn !== handFuture) {
    setHandFutureOn(handFuture);
    if (!handFuture && handSettled) setHandSettled(false);
  }
  if (pause && instantMeaning) setInstantMeaning(false);
  if (!pauseKey && restoredPauseKey) setRestoredPauseKey(null);
  if (pauseKey !== readyPauseKey) {
    setReadyPauseKey(pauseKey);
    if (actionsReady) setActionsReady(false);
  }
  const sceneId = state.sceneId;
  const openedAtResume = snapSession === state.sessionId ? restoredRevealed : null;
  const faceReady = (positionId: string) => {
    if (!('draws' in state)) return false;
    const draw = state.draws.find((item) => item.positionId === positionId);
    const urls = draw ? faces.get(draw.cardId) : undefined;
    return Boolean(urls && decodedSlots.has(faceSlotKey(urls.digest, faceSizes)));
  };
  const sceneVisuals =
    sceneLive && sceneId && (state.stage === 'reveal' || state.stage === 'read')
      ? (['past', 'present', 'future'] as const).reduce<Record<'past' | 'present' | 'future', SceneVisual>>((visuals, positionId) => {
          const visual = lockedSceneVisual({
            sceneId,
            positionId,
            revealed: 'revealed' in state ? state.revealed : [],
            pausePositionId: pause?.positionId ?? null,
            futureOpen,
            handFutureSettled: reducedMotion || handSettled,
          });
          visuals[positionId] = (visual === 'door-partial' || visual === 'hand-partial') && !faceReady(positionId) ? 'back' : visual;
          return visuals;
        }, { past: 'back', present: 'back', future: 'back' })
      : null;
  const sceneInstant =
    sceneVisuals === null
      ? null
      : Object.fromEntries(
          (['past', 'present', 'future'] as const).map((positionId) => [
            positionId,
            state.stage === 'read' ||
              (pauseRestored && pause?.positionId === positionId) ||
              Boolean(openedAtResume?.has(positionId)),
          ]),
        );
  const faceUpCount =
    'revealed' in state
      ? faceUpRevealCount(
          {
            stage: state.stage,
            revealed: state.revealed,
            pause: 'pause' in state ? state.pause : null,
          },
          sceneVisuals,
        )
      : 0;

  const pauseDraw = pause && 'draws' in state ? state.draws.find((draw) => draw.positionId === pause.positionId) : undefined;
  const pauseFaceReady = !pauseDraw || faceReady(pauseDraw.positionId);
  const pauseFaceKey = pauseDraw ? faces.get(pauseDraw.cardId) : undefined;
  const pauseFaceFailed = Boolean(pauseFaceKey && failedSlots.has(faceSlotKey(pauseFaceKey.digest, faceSizes)));
  const faceWaitKey = !pauseKey || pauseFaceReady ? null : `${pauseKey}:${faceAttempt}`;
  if (faceWait.key !== faceWaitKey) {
    setFaceWait({ key: faceWaitKey, announced: false, stalled: false });
  }
  const faceAnnounced = faceWait.key === faceWaitKey && faceWait.announced;
  const faceStalled = faceWait.key === faceWaitKey && faceWait.stalled;
  const choicesReady = Boolean(pauseKey) && pauseFaceReady && (reducedMotion || pauseRestored || actionsReady);
  const gatedNext = sceneLive && revealState ? nextGatedPosition(revealState) : null;
  const pauseOffer = pause && pauseDraw && sceneId ? lookupPauseOffer(sceneId, pauseDraw.cardId, pauseDraw.orientation, pause.index) : null;
  const previousKind = pause?.index === 2 ? (state.pauseAnswers.find((item) => item.index === 1)?.kind ?? null) : null;
  const meaningAnswer =
    sceneLive && revealState && !pause && !futureOpen
      ? (revealState.pauseAnswers.findLast((item) => item.positionId === 'past' || item.positionId === 'present') ?? null)
      : null;
  const meaningKey = meaningAnswer ? `${state.sessionId}:${meaningAnswer.index}` : null;
  const meaningDelay = !meaningAnswer || !sceneId || instantMeaning ? 0 : meaningAfterPauseMs(sceneId, reducedMotion);
  const showMeaning = Boolean(meaningAnswer) && (meaningDelay === 0 || shownMeaning === meaningKey);
  const sceneClose = sceneCloseOf(state);
  const futureReading =
    futureOpen && 'draws' in state
      ? buildPositionReadings(state.spreadId, state.draws, CARDS).find((item) => item.positionId === 'future') ?? null
      : null;
  const meaningReading =
    showMeaning && meaningAnswer && 'draws' in state
      ? buildPositionReadings(state.spreadId, state.draws, CARDS).find((item) => item.positionId === meaningAnswer.positionId) ?? null
      : null;
  const noteHost = SCENE_PAUSE_ENABLED && state.sceneLocked && state.keptPauseIndex !== null;

  useEffect(() => {
    if (!handFuture) return;
    const ms = sceneBeatDurations(reducedMotion).palmMs;
    if (ms <= 0) return;
    const timer = window.setTimeout(() => setHandSettled(true), ms);
    return () => window.clearTimeout(timer);
  }, [handFuture, reducedMotion]);

  useEffect(() => {
    if (!pauseKey || !sceneId || reducedMotion || pauseRestored || !pauseFaceReady) return;
    const timer = window.setTimeout(() => setActionsReady(true), pauseActionsReadyMs(sceneId, false));
    return () => window.clearTimeout(timer);
  }, [pauseKey, sceneId, reducedMotion, pauseRestored, pauseFaceReady]);

  useEffect(() => {
    if (!meaningKey || meaningDelay <= 0) return;
    const timer = window.setTimeout(() => setShownMeaning(meaningKey), meaningDelay);
    return () => window.clearTimeout(timer);
  }, [meaningKey, meaningDelay]);

  const reading = useMemo(() => {
    if (state.stage !== 'read' && state.stage !== 'close') return null;
    if (!('draws' in state) && state.stage !== 'close') return null;
    const draws = state.stage === 'close' ? state.receipt.draws : state.draws;
    const spreadId = state.spreadId;
    const question = state.stage === 'close' ? state.receipt.question : state.question;
    return composeReading(spreadId, draws, CARDS, question);
  }, [state]);

  useEffect(() => {
    if (!faceWaitKey) return;
    const announce = window.setTimeout(() => {
      setFaceWait((current) => (current.key === faceWaitKey ? { ...current, announced: true } : current));
    }, 200);
    const stall = window.setTimeout(() => {
      setFaceWait((current) => (current.key === faceWaitKey ? { ...current, stalled: true } : current));
    }, 8000);
    return () => {
      window.clearTimeout(announce);
      window.clearTimeout(stall);
    };
  }, [faceWaitKey]);

  useEffect(() => {
    const title = document.getElementById('stage-title');
    const ritual = state.stage === 'shuffle' || state.stage === 'cut' || state.stage === 'deal' || state.stage === 'reveal';
    const page = PAGE_SCROLL_STAGES.has(state.stage);
    if (!ritual && !page) return;
    if (title) title.focus({ preventScroll: true });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame2 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        if (ritual) {
          const stage = document.querySelector(`[data-ritual-stage="${state.stage}"]`) as HTMLElement | null;
          const table = stage?.querySelector('[data-table-scene]') as HTMLElement | null;
          (table ?? stage)?.scrollIntoView({
            block: 'center',
            inline: 'nearest',
            behavior: reduce ? 'auto' : 'smooth',
          });
          return;
        }
        title?.scrollIntoView({
          block: 'start',
          inline: 'nearest',
          behavior: reduce ? 'auto' : 'smooth',
        });
      });
    });
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [state.stage]);

  useEffect(() => {
    const onRestart = () => {
      clearSession();
      setPendingResume(null);
      setRestartAsk(false);
      setState(createSession());
    };
    window.addEventListener('tarot:restart', onRestart);
    return () => window.removeEventListener('tarot:restart', onRestart);
  }, []);

  return (
    <main className={styles.shell}>
      <h2 id="stage-title" className={styles.chapter} tabIndex={-1}>
        {chapter(state.stage)}
      </h2>
      <p className="visually-hidden" aria-live="polite">
        {state.stage === 'reveal' && 'revealed' in state
          ? `已翻开 ${faceUpCount} / ${state.draws.length}`
          : chapter(state.stage)}
      </p>
      {faceLoadError ? <div className={styles.warn} role="alert">
        <p>牌面资源暂未就绪，请检查网络后重试。</p>
        <button type="button" onClick={() => {
          setFaceLoadError(false);
          loadFaceIndex().then(setFaces).catch(() => setFaceLoadError(true));
        }}>重新加载牌面</button>
      </div> : null}
      {storageNote ? <p className={styles.warn}>{COPY.storageFallback}</p> : null}
      {state.abandonOpen ? (
        <ConfirmModal onCancel={() => dispatch({ type: 'ABANDON_CANCEL' })}>
          <p>{abandonCopy(state.stage, state.sceneLocked)}</p>
          <button type="button" onClick={() => dispatch({ type: 'ABANDON_CONFIRM' })}>
            确定放弃
          </button>
          <button type="button" data-safe-focus onClick={() => dispatch({ type: 'ABANDON_CANCEL' })}>
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
          <button type="button" data-safe-focus onClick={() => setRestartAsk(false)}>
            {COPY.resumeContinue}
          </button>
        </ConfirmModal>
      ) : null}
      {state.stage !== 'enter' && state.stage !== 'close' ? (
        <button type="button" className={styles.abandon} onClick={() => dispatch({ type: 'ABANDON_REQUEST' })}>
          放弃本局
        </button>
      ) : null}

      {state.stage === 'enter' || state.stage === 'question' || state.stage === 'spread' ? (
        <section className={`${styles.center} ${styles.stage}`}>
          {state.stage === 'enter' ? <div className={styles.candle} aria-hidden="true" /> : null}
          {state.stage === 'enter' && pendingResume ? (
            <>
              <p className={styles.warn}>
                {pendingResume.stage === 'close' ? COPY.resumeClosedBody : COPY.resumeBody}
              </p>
              <button
                type="button"
                className={styles.primary}
                autoFocus
                onClick={() => {
                  const next = pendingResume;
                  const revealedNow = 'revealed' in next ? next.revealed : [];
                  if (next.stage === 'reveal' && next.pause) {
                    setRestoredPauseKey(`${next.sessionId}:${next.pause.index}`);
                    setInstantMeaning(false);
                    setSnapSession(next.sessionId);
                    setRestoredRevealed(new Set(revealedNow));
                  } else if (next.stage === 'reveal' && next.pauseAnswers.length > 0) {
                    setRestoredPauseKey(null);
                    setInstantMeaning(true);
                    setSnapSession(next.sessionId);
                    setRestoredRevealed(new Set(revealedNow));
                  } else if (next.stage === 'read' || next.stage === 'reveal') {
                    setRestoredPauseKey(null);
                    setInstantMeaning(false);
                    setSnapSession(next.sessionId);
                    setRestoredRevealed(new Set(revealedNow));
                  } else {
                    setRestoredPauseKey(null);
                    setInstantMeaning(false);
                    setSnapSession(null);
                    setRestoredRevealed(new Set());
                  }
                  setPendingResume(null);
                  setRestartAsk(false);
                  setState(next);
                }}
              >
                {pendingResume.stage === 'close' ? COPY.resumeClosedContinue : COPY.resumeContinue}
              </button>
              <button type="button" className={styles.ghost} onClick={() => setRestartAsk(true)}>
                {COPY.resumeRestart}
              </button>
            </>
          ) : (
            <PrepareForm state={state} dispatch={dispatch} />
          )}
          {state.stage === 'enter' ? <HistoryList /> : null}
        </section>
      ) : null}

      {state.stage === 'shuffle' ? (
        <section className={`${styles.center} ${styles.stage} ${styles.tableStage}`} data-ritual-stage="shuffle">
          <h1>{COPY.shuffleTitle}</h1>
          <p>{state.shufflePhase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}</p>
          <TableScene
            paused={pageHidden}
            hand={tableHandMode({
              stage: 'shuffle',
              shufflePhase: state.shufflePhase,
              reduced: reducedMotion || pageHidden,
              shuffleFrame: shuffleHandFrameState,
            })}
            label={state.shufflePhase === 'committing' ? COPY.shuffleCommitting : COPY.shuffleHold}
            onPointerDown={(event) => {
              event.preventDefault();
              holding.current = true;
              samples.current = [];
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
              dispatch({ type: 'HOLD_START', operationId: newOperationId() });
            }}
            onPointerMove={(event) => {
              if (!holding.current) return;
              event.preventDefault();
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
            <ShuffleTable
              phase={state.shufflePhase}
              paused={pageHidden}
              reduced={reducedMotion}
              onHandFrame={setShuffleHandFrameState}
            />
          </TableScene>
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
          {state.shufflePhase === 'idle' ? (
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: 'BACK' })}>
              {COPY.backToSpread}
            </button>
          ) : null}
        </section>
      ) : null}

      {state.stage === 'cut' ? (
        <section className={`${styles.center} ${styles.stage} ${styles.tableStage}`} data-ritual-stage="cut">
          <h1>{COPY.cutTitle}</h1>
          <p>{COPY.shuffleSealed}</p>
          <TableScene
            paused={pageHidden}
            hand={tableHandMode({ stage: 'cut', reduced: reducedMotion, cutFrame: cutHandFrameState })}
            label={COPY.cutTitle}
          >
            <CutTable
              cutIndex={state.cutIndex}
              gathering={cutCommitSession === state.sessionId}
              reduced={reducedMotion}
              disabled={Boolean(state.operationId) || cutCommitSession === state.sessionId}
              onCutChange={(cutIndex) => dispatch({ type: 'SET_CUT', cutIndex })}
              onHandFrame={setCutHandFrameState}
            />
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
              disabled={Boolean(state.operationId) || cutCommitSession === state.sessionId}
              onChange={(event) => dispatch({ type: 'SET_CUT', cutIndex: Number(event.target.value) })}
            />
          </label>
          <p data-cut-top={cutProportion(state.cutIndex)?.top} data-cut-bottom={cutProportion(state.cutIndex)?.bottom}>
            上方 {state.cutIndex} 张 · 下方 {78 - state.cutIndex} 张
          </p>
          <button
            type="button"
            className={styles.ghost}
            disabled={Boolean(state.operationId) || cutCommitSession === state.sessionId}
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
            disabled={Boolean(state.operationId) || cutCommitSession === state.sessionId}
            onClick={() => setCutCommitSession(state.sessionId)}
          >
            {COPY.cutConfirm}
          </button>
          <details>
            <summary>{COPY.sealedFingerprint}</summary>
            <p className={styles.muted}>{state.commitShort}</p>
            <code style={{ fontSize: 13, wordBreak: 'break-all' }}>{state.commitFull}</code>
            <p className={styles.muted}>只检查本标签页牌序是否自洽，不是公证。</p>
          </details>
        </section>
      ) : null}

      {state.stage === 'deal' || state.stage === 'reveal' || state.stage === 'read' ? (
        <section
          className={`${styles.stage} ${styles.tableStage}`}
          data-ritual-stage={state.stage === 'read' ? 'read' : state.stage}
        >
          {state.stage === 'deal' ? <p className={styles.dealHint}>牌正在落到桌上</p> : null}
          <div className={state.stage === 'read' && state.view === 'page' ? styles.tableParked : undefined}>
            <TableScene
              paused={pageHidden}
              hand={tableHandMode({ stage: state.stage, reduced: reducedMotion })}
              layout="spread"
            >
              {state.stage === 'deal' ? (
                <div className={styles.dealSource} data-deck-origin aria-hidden="true">
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
                sceneVisuals={sceneVisuals}
                sceneInstant={sceneInstant}
                revealLocked={navigationLocked}
                revealablePositionId={sceneLive ? gatedNext ?? '' : undefined}
                onSelect={(positionId) => dispatch({ type: 'SELECT_POSITION', positionId })}
                onReveal={
                  state.stage === 'reveal' && !navigationLocked
                    ? (positionId) => dispatch({ type: 'REVEAL_POSITION', positionId })
                    : undefined
                }
              />
            </TableScene>
          </div>
          {SCENE_PAUSE_ENABLED && pause && pauseOffer && sceneId ? (
            <PauseSheet
              sceneId={sceneId}
              positionId={pause.positionId}
              offer={pauseOffer}
              phase={pause.phase}
              custom={pause.custom}
              previous={previousKind}
              actionsEnabled={choicesReady}
              pendingFace={faceAnnounced && !pauseFaceReady}
              retryFace={pauseFaceFailed || (faceStalled && !pauseFaceReady)}
              onRetryFace={() => {
                for (const draw of state.stage === 'reveal' ? state.draws : []) {
                  const urls = faces.get(draw.cardId);
                  if (urls) forgetFaceDecode(urls.digest, faceSizes);
                }
                setFaceAttempt((attempt) => attempt + 1);
              }}
              onChoose={(actionId) => dispatch({ type: 'CHOOSE_PAUSE', actionId })}
              onCustom={(custom) => dispatch({ type: 'SET_PAUSE_CUSTOM', custom })}
              onConfirm={() => dispatch({ type: 'CONFIRM_PAUSE' })}
              onSkip={() => dispatch({ type: 'SKIP_PAUSE' })}
              onRevert={() => dispatch({ type: 'REVERT_PAUSE' })}
            />
          ) : null}
          {SCENE_PAUSE_ENABLED && futureOpen && sceneClose && futureReading && sceneId ? (
            <SceneFutureBeat
              sceneId={sceneId}
              reduced={reducedMotion}
              sentence={sceneClose.sentences[3]}
              frameZh={futureReading.frameZh}
              meaning={futureReading.meaning}
              onDone={finishFuture}
            />
          ) : null}
          {state.stage === 'reveal' ? (
            <div className={styles.center}>
              <p className={styles.revealProgress} data-reveal-count={faceUpCount} aria-live="polite">
                {`已翻开 ${faceUpCount} / ${state.draws.length}`}
              </p>
              <p className={styles.muted}>{COPY.reversedHint}</p>
              <div className={styles.revealBar}>
                {state.revealed.length < state.draws.length && !pause && !futureOpen ? (
                  <button
                    type="button"
                    className={styles.primary}
                    data-reveal="primary"
                    onClick={() => dispatch({ type: 'REVEAL_NEXT' })}
                  >
                    {gatedNext || !state.revealed.includes(state.selectedPositionId)
                      ? COPY.revealSelected(
                          (gatedNext
                            ? SPREADS.three.positions.find((position) => position.id === gatedNext)?.nameZh
                            : SPREADS[state.spreadId].positions.find((position) => position.id === state.selectedPositionId)?.nameZh) ?? '',
                        )
                      : COPY.revealNextClosed}
                  </button>
                ) : null}
                {pause ? (
                  <p className={styles.muted} data-reveal-status="in-progress">
                    {COPY.revealInProgress}
                  </p>
                ) : null}
                {SCENE_PAUSE_ENABLED && meaningReading ? (
                  <PauseMeaning
                    missing={meaningAnswer?.kind === 'missing'}
                    frameZh={meaningReading.frameZh}
                    meaning={meaningReading.meaning}
                  />
                ) : null}
              </div>
              <button
                type="button"
                className={styles.ghost}
                disabled={
                  navigationLocked ||
                  stepPositionId(state.spreadId, state.selectedPositionId, -1) === state.selectedPositionId ||
                  (sceneLive && revealState ? !canFocusGatedPosition(revealState, stepPositionId(state.spreadId, state.selectedPositionId, -1)) : false)
                }
                onClick={() => dispatch({ type: 'STEP_SELECTION', delta: -1 })}
              >
                {COPY.stepPrev}
              </button>
              <button
                type="button"
                className={styles.ghost}
                disabled={
                  navigationLocked ||
                  stepPositionId(state.spreadId, state.selectedPositionId, 1) === state.selectedPositionId ||
                  (sceneLive && revealState ? !canFocusGatedPosition(revealState, stepPositionId(state.spreadId, state.selectedPositionId, 1)) : false)
                }
                onClick={() => dispatch({ type: 'STEP_SELECTION', delta: 1 })}
              >
                {COPY.stepNext}
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
              <ReadingView doc={reading} />
              {sceneClose ? (
                <SceneCloseView
                  sentences={sceneClose.sentences}
                  kept={sceneClose.kept}
                  keptIndex={state.keptPauseIndex}
                  selectable
                  onKeep={(index) => dispatch({ type: 'SET_KEPT_PAUSE', index })}
                />
              ) : null}
              <div className={`${styles.center} ${styles.noteBlock}`}>
                <label className={styles.noteLabel}>
                  留笺
                  <textarea
                    className={styles.field}
                    value={state.note}
                    onChange={(event) => {
                      const next = event.target.value;
                      if ([...next].length <= MAX_NOTE_CODEPOINTS) dispatch({ type: 'SET_NOTE', note: next });
                    }}
                    placeholder={noteHost ? COPY.noteBeside : COPY.notePlaceholder}
                  />
                </label>
                {[...state.note].length > 0 ? (
                  <p className={styles.muted}>{COPY.noteCount([...state.note].length)}</p>
                ) : null}
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
                const id = encodeReading(toSharePayload(state.receipt, includeQuestion));
                const url = `${window.location.origin}/r/${id}`;
                setShareUrl(url);
                void navigator.clipboard?.writeText(url);
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
          <ul aria-label="这几张牌的词条">
            {state.receipt.draws.map((draw) => {
              const position = SPREADS[state.receipt.spreadId].positions.find((item) => item.id === draw.positionId);
              return (
                <li key={draw.positionId}>
                  <Link href={`/deck/${draw.cardId}`}>
                    {position?.nameZh} · {CARDS[draw.cardId].nameZh}
                  </Link>
                </li>
              );
            })}
          </ul>
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
