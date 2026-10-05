import { describe, expect, it } from 'vitest';
import { MOTION } from '@/lib/motion';
import {
  futureBeatSchedule,
  lockedSceneVisual,
  meaningAfterPauseMs,
  pauseActionsReadyMs,
  sceneBeatDurations,
} from '@/lib/scene-beats';

describe('scene beat durations', () => {
  it('locks seam, partial flip, complete, palm, and settle', () => {
    expect(sceneBeatDurations(false)).toEqual({
      seamMs: 260,
      partialFlipMs: 640,
      completeMs: 260,
      palmMs: 520,
      settleMs: 360,
    });
    expect(sceneBeatDurations(false).partialFlipMs).toBe(MOTION.flipMs);
    expect(sceneBeatDurations(false).seamMs).toBe(MOTION.seamMs);
    expect(sceneBeatDurations(false).completeMs).toBe(MOTION.sceneCompleteMs);
    expect(sceneBeatDurations(false).palmMs).toBe(MOTION.palmMs);
    expect(sceneBeatDurations(false).settleMs).toBe(MOTION.settleMs);
  });

  it('zeroes every beat when motion is reduced', () => {
    expect(sceneBeatDurations(true)).toEqual({
      seamMs: 0,
      partialFlipMs: 0,
      completeMs: 0,
      palmMs: 0,
      settleMs: 0,
    });
    expect(pauseActionsReadyMs('door', true)).toBe(0);
    expect(pauseActionsReadyMs('hand', true)).toBe(0);
    expect(meaningAfterPauseMs('door', true)).toBe(0);
    expect(futureBeatSchedule('door', true)).toEqual({
      sentenceAtMs: 0,
      meaningAtMs: 0,
      doneAtMs: MOTION.readFadeMs,
    });
  });

  it('keeps choices disabled until the door or the palm has finished', () => {
    expect(pauseActionsReadyMs('door', false)).toBe(MOTION.seamLeadMs + MOTION.seamMs + MOTION.flipMs);
    expect(pauseActionsReadyMs('door', false)).toBe(980);
    expect(pauseActionsReadyMs('hand', false)).toBe(520);
    expect(meaningAfterPauseMs('door', false)).toBe(260);
    expect(meaningAfterPauseMs('hand', false)).toBe(360);
  });

  it('opens the future sentence after a full door or a settled palm', () => {
    expect(futureBeatSchedule('door', false)).toEqual({
      sentenceAtMs: 900,
      meaningAtMs: 900 + MOTION.readFadeMs,
      doneAtMs: 900 + MOTION.readFadeMs * 2,
    });
    expect(futureBeatSchedule('hand', false).sentenceAtMs).toBe(880);
  });

  it('stops a door at partial and does not stop the future there', () => {
    expect(
      lockedSceneVisual({
        sceneId: 'door',
        positionId: 'past',
        revealed: [],
        pausePositionId: 'past',
        futureOpen: false,
        handFutureSettled: false,
      }),
    ).toBe('door-partial');
    expect(
      lockedSceneVisual({
        sceneId: 'door',
        positionId: 'future',
        revealed: ['past', 'present', 'future'],
        pausePositionId: null,
        futureOpen: true,
        handFutureSettled: false,
      }),
    ).toBe('door-full');
    expect(
      lockedSceneVisual({
        sceneId: 'hand',
        positionId: 'future',
        revealed: ['past', 'present', 'future'],
        pausePositionId: null,
        futureOpen: true,
        handFutureSettled: false,
      }),
    ).toBe('hand-partial');
    expect(
      lockedSceneVisual({
        sceneId: 'hand',
        positionId: 'present',
        revealed: ['past', 'present'],
        pausePositionId: null,
        futureOpen: false,
        handFutureSettled: false,
      }),
    ).toBe('hand-settled');
  });
});
